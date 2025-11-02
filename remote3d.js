// Remote 3D Scroll Animation

(function() {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded. Loading from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initRemote3D;
    document.head.appendChild(script);
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRemote3D);
  } else {
    initRemote3D();
  }

  function initRemote3D() {
    const container = document.querySelector('.remote-3d-stage');
    if (!container) {
      console.warn('Remote 3D container not found');
      return;
    }

    const wrapper = container.querySelector('.remote-3d-wrapper');
    const pin = container.querySelector('.remote-3d-pin');
    const canvas = container.querySelector('.remote-3d-canvas');
    const textOverlay = container.querySelector('.remote-3d-text');

    if (!wrapper || !pin || !canvas || !textOverlay) {
      console.warn('Remote 3D elements not found');
      return;
    }

    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    
    if (isMobile) {
      textOverlay.style.opacity = '1';
      textOverlay.style.transform = 'none';
      return;
    }

    // Intersection Observer for lazy loading
    let modelsLoaded = false;
    let modelsReady = false;
    let scene = null;
    let camera = null;
    let renderer = null;
    let model = null;
    let baseModel = null;
    let loader = null;
    let rafId = null;
    let scrollProgress = 0;
    let isAnimating = false;

    const loadModels = () => {
      if (modelsLoaded) return;
      modelsLoaded = true;
      console.log('Starting to load 3D models...');

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, -0.5, 6);

      renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true,
        premultipliedAlpha: false
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.physicallyCorrectLights = true;

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight1.position.set(5, 5, 5);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight2.position.set(-5, 3, -3);
      scene.add(directionalLight2);

      loader = new THREE.GLTFLoader();
      
      const createFallbackModel = () => {
        const geometry = new THREE.BoxGeometry(1, 2, 0.3);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x667eea,
          shininess: 60
        });
        model = new THREE.Mesh(geometry, material);
        model.position.set(-2.5, 3, 0);
        scene.add(model);
        console.log('Using fallback 3D model');
      };

      let baseModelLoaded = false;
      let websiteModelLoaded = false;
      
      const checkModelsReady = () => {
        if (baseModelLoaded && websiteModelLoaded && !modelsReady) {
          modelsReady = true;
          console.log('Both 3D models fully loaded and ready');
          animate();
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll();
        }
      };

      loader.load(
        '/assets/InstayAssets/remotebase.glb',
        (gltf) => {
          baseModel = gltf.scene;
          baseModel.position.set(-3.8, -1.5, 0);
          baseModel.rotation.y = 0;
          baseModel.rotation.x = 0.2;
          baseModel.rotation.z = -0.1;
          baseModel.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 1,
                roughness: 0.6,
                metalness: 0.0,
                clearcoat: 0.3,
                clearcoatRoughness: 0.4,
                transmission: 0.1,
                ior: 1.35,
                thickness: 0.25
              });
              child.material.needsUpdate = true;
            }
          });
          const box = new THREE.Box3().setFromObject(baseModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.3 / maxDim;
          baseModel.scale.setScalar(scale);
          scene.add(baseModel);
          baseModelLoaded = true;
          console.log('Base model loaded successfully');
          checkModelsReady();
        },
        (progress) => {},
        (error) => {
          console.error('Error loading base model:', error);
          baseModelLoaded = true;
          checkModelsReady();
        }
      );

      loader.load(
        '/assets/InstayAssets/remotewebsite.glb',
        (gltf) => {
          model = gltf.scene;
          model.position.set(-2.16, 3.35, 0); 
          model.rotation.y = Math.PI;
          model.rotation.x = 0;
          model.rotation.z = 0;
          
          model.traverse((child) => {
            if (child.isMesh) {
              child.material.transparent = true;
              child.material.needsUpdate = true;
              if (child.material.transmission !== undefined) {
                child.material.transmission = child.material.transmission;
              }
            }
          });
          
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.8/ maxDim;
          model.scale.setScalar(scale);
          
          scene.add(model);
          websiteModelLoaded = true;
          console.log('Website model loaded successfully');
          checkModelsReady();
        },
        (progress) => {
        },
        (error) => {
          console.error('Error loading 3D model:', error);
          createFallbackModel();
          websiteModelLoaded = true;
          checkModelsReady();
        }
      );
    };

    // Intersection Observer - load when section is 1000px away from viewport
    const observerOptions = {
      root: null,
      rootMargin: '1000px 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !modelsLoaded) {
          loadModels();
          observer.disconnect();
        }
      });
    }, observerOptions);

    observer.observe(wrapper);

    // Fallback: if user scrolls very fast or page loads already scrolled
    setTimeout(() => {
      const rect = wrapper.getBoundingClientRect();
      if (rect.top < window.innerHeight + 1500 && !modelsLoaded) {
        loadModels();
        observer.disconnect();
      }
    }, 500);

    function handleScroll() {
      if (!modelsReady || !scene || !model) return;
      if (isMobile) return; 
      
      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const scrollStart = rect.top;
      const scrollDistance = wrapperHeight - viewportHeight;
      const scrollEnd = scrollStart - scrollDistance;
      
      if (scrollStart <= 0 && scrollStart >= scrollEnd) {
        let rawProgress = Math.abs(scrollStart) / scrollDistance;
        scrollProgress = Math.min(1, rawProgress);
        isAnimating = true;
      } else if (scrollStart > 0) {
        scrollProgress = 0;
        isAnimating = false;
      } else {
        scrollProgress = 1;
        isAnimating = false;
      }

      updateAnimation();
    }

    function updateAnimation() {
      if (!modelsReady || !model) return;
      if (isMobile) return; 

      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const easedProgress = easeInOutCubic(scrollProgress);

      model.position.x = -2.16;
      
  model.position.y = 3.35 - (easedProgress * 5); 

      const startRotation = Math.PI; 
      const endRotation = 9.4;
      model.rotation.y = startRotation + (easedProgress * (endRotation - startRotation));
      model.rotation.x = 0;
      model.rotation.z = 0;

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          const startR = 1, startG = 1, startB = 1; 
          const endR = 0xb5 / 255, endG = 0xc3 / 255, endB = 0xd7 / 255;
          const red = startR + (endR - startR) * easedProgress;
          const green = startG + (endG - startG) * easedProgress;
          const blue = startB + (endB - startB) * easedProgress;
          
          child.material.color.setRGB(red, green, blue);
        }
      });

      const textProgress = scrollProgress > 0.2 ? 1 : scrollProgress / 0.2;
      textOverlay.style.opacity = textProgress;
      textOverlay.style.transform = `translate(-50%, -50%) scale(${0.9 + textProgress * 0.1})`;
    }

    // Animation loop
    function animate() {
      if (!modelsReady || !scene || !renderer || !camera) return;
      
      rafId = requestAnimationFrame(animate);
      
      if (model) {
        if (!isAnimating) {
          model.rotation.y += 0.002;
        }
      }
      
      renderer.render(scene, camera);
    }

    // Resize handler
    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cleanup
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (renderer) renderer.dispose();
    });
  }

  // Load GLTFLoader if not available
  if (typeof THREE !== 'undefined' && !THREE.GLTFLoader) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    script.onload = () => {
      console.log('GLTFLoader loaded');
      initRemote3D();
    };
    document.head.appendChild(script);
  }
})();
