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

  // Wait for DOM to be ready
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

    // Check if mobile device
    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    
    if (isMobile) {
      // On mobile: just show static image, no 3D
      textOverlay.style.opacity = '1';
      textOverlay.style.transform = 'none';
      return;
    }

    // Intersection Observer for lazy loading
    let modelsLoaded = false;
    let scene = null;
    let camera = null;
    let renderer = null;
    let model = null;
    let baseModel = null;
    let loader = null;
    let rafId = null;
    let scrollProgress = 0;
    let isAnimating = false;

    // Setup scene and load models when section is near viewport
    const loadModels = () => {
      if (modelsLoaded) return;
      modelsLoaded = true;
      console.log('Starting to load 3D models...');

      // Scene setup
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

      // Load 3D models
      loader = new THREE.GLTFLoader();
      
      // Creates a simple box if model fails to load
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
                color: 0x000000, // Black tint
                transparent: true,
                opacity: 1,
                roughness: 0.6,
                metalness: 0.0,
                clearcoat: 0.3,
                clearcoatRoughness: 0.4,
                transmission: 0.1, // Reduced transmission for more solid black
                ior: 1.35,
                thickness: 0.25
              });
              child.material.needsUpdate = true;
            }
          });
          // Scale the base
          const box = new THREE.Box3().setFromObject(baseModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.3 / maxDim;
          baseModel.scale.setScalar(scale);
          scene.add(baseModel);
          console.log('Base model loaded successfully');
        },
        (progress) => {},
        (error) => {
          console.error('Error loading base model:', error);
        }
      );

      loader.load(
        '/assets/InstayAssets/remotewebsite.glb',
        (gltf) => {
          model = gltf.scene;
          model.position.set(-3.5, 3.5, 0); 
          
          // Enable transparency and glass materials
          model.traverse((child) => {
            if (child.isMesh) {
              child.material.transparent = true;
              child.material.needsUpdate = true;
              if (child.material.transmission !== undefined) {
                child.material.transmission = child.material.transmission;
              }
            }
          });
          
          // Scale the model appropriately
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.8/ maxDim;
          model.scale.setScalar(scale);
          
          scene.add(model);
          console.log('3D model loaded successfully');
          
          // Start animation loop after models are loaded
          animate();
          
          // Set up scroll handler
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll();
        },
        (progress) => {
        },
        (error) => {
          console.error('Error loading 3D model:', error);
          createFallbackModel();
          animate();
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll();
        }
      );
    };

    // Intersection Observer - load when section is 1000px away from viewport
    const observerOptions = {
      root: null,
      rootMargin: '1000px 0px', // Start loading 1000px before entering viewport
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !modelsLoaded) {
          loadModels();
          observer.disconnect(); // Stop observing once we start loading
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
      if (!scene || !model) return;
      if (isMobile) return; 
      
      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const scrollStart = rect.top;
      const scrollEnd = scrollStart - (wrapperHeight - viewportHeight);
      
      if (scrollStart <= 0 && scrollStart >= scrollEnd) {
        let rawProgress = Math.abs(scrollStart) / (wrapperHeight - viewportHeight);
        scrollProgress = Math.min(1, rawProgress * 1.5);
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
      if (!model) return;
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
          const endR = 0xb5 / 255, endG = 0xc3 / 255, endB = 0xd7 / 255; // #b5c3d7
          const red = startR + (endR - startR) * easedProgress;
          const green = startG + (endG - startG) * easedProgress;
          const blue = startB + (endB - startB) * easedProgress;
          
          child.material.color.setRGB(red, green, blue);
        }
      });

      // Text settings
      const textProgress = scrollProgress > 0.2 ? 1 : scrollProgress / 0.2;
      textOverlay.style.opacity = textProgress;
      textOverlay.style.transform = `translate(-50%, -50%) scale(${0.9 + textProgress * 0.1})`;
    }

    // Animation loop
    function animate() {
      if (!scene || !renderer || !camera) return;
      
      rafId = requestAnimationFrame(animate);
      
      if (model) {
        // Add subtle continuous rotation when not scrolling
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
