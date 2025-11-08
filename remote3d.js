// Remote 3D Animation

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
    let targetScrollProgress = 0;
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
      renderer.toneMappingExposure = 1.3;
      renderer.physicallyCorrectLights = true;

      const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight1.position.set(5, 6, 5);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight2.position.set(-5, 4, -3);
      scene.add(directionalLight2);

      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight3.position.set(0, 7, 3);
      scene.add(directionalLight3);

      const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight4.position.set(-3, 5, 6);
      scene.add(directionalLight4);

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
              // Check if dark mode is active
              const isDarkMode = document.body.classList.contains('dark-mode');
              const baseColor = isDarkMode ? 0x4a9eff : 0x085bab;
              
              child.material = new THREE.MeshPhysicalMaterial({
                color: baseColor,
                roughness: 0.15,
                metalness: 0.85,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
                envMapIntensity: 2.0
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
        targetScrollProgress = Math.max(0, Math.min(1, rawProgress));
        isAnimating = true;
      } else if (scrollStart > 0) {
        targetScrollProgress = 0;
        isAnimating = false;
      } else {
        targetScrollProgress = 1;
        isAnimating = false;
      }
    }

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    let currentColor = { r: 1, g: 1, b: 1 };

    function updateAnimation() {
      if (!modelsReady || !model) return;
      if (isMobile) return; 

      const lerpSpeed = 0.1;
      scrollProgress = lerp(scrollProgress, targetScrollProgress, lerpSpeed);

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

      const targetColor = {
        r: lerp(1, 0xb5 / 255, easedProgress),
        g: lerp(1, 0xc3 / 255, easedProgress),
        b: lerp(1, 0xd7 / 255, easedProgress)
      };

      currentColor.r = lerp(currentColor.r, targetColor.r, 0.2);
      currentColor.g = lerp(currentColor.g, targetColor.g, 0.2);
      currentColor.b = lerp(currentColor.b, targetColor.b, 0.2);

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.setRGB(currentColor.r, currentColor.g, currentColor.b);
        }
      });

      const textProgress = scrollProgress > 0.2 ? 1 : scrollProgress / 0.2;
      const currentTextOpacity = parseFloat(textOverlay.style.opacity) || 0;
      const textOpacity = lerp(currentTextOpacity, textProgress, 0.15);
      textOverlay.style.opacity = textOpacity;
      const scaleValue = lerp(0.9, 1, textProgress);
      textOverlay.style.transform = `translate(-50%, -50%) scale(${scaleValue})`;
    }

    // Animation loop
    function animate() {
      if (!modelsReady || !scene || !renderer || !camera) return;
      
      rafId = requestAnimationFrame(animate);
      
      updateAnimation();
      
      if (model) {
        if (!isAnimating && scrollProgress < 0.05) {
          model.rotation.y += 0.002;
        }
      }
      
      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const updateBaseColor = () => {
      if (!baseModel) return;
      const isDarkMode = document.body.classList.contains('dark-mode');
      const baseColor = isDarkMode ? 0x4a9eff : 0x085bab;
      
      baseModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.setHex(baseColor);
          child.material.needsUpdate = true;
        }
      });
    };
    
    const darkModeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateBaseColor();
        }
      });
    });
    
    darkModeObserver.observe(document.body, { attributes: true });

    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (renderer) renderer.dispose();
      darkModeObserver.disconnect();
    });
  }

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
