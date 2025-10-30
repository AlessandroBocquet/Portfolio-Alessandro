// Remote 3D Scroll Animation
// Uses Three.js and GSAP for scroll-driven 3D model animation

(function() {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded. Loading from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initRemote3D;
    document.head.appendChild(script);
    return;
  }

  initRemote3D();

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

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -0.5, 5);

    const renderer = new THREE.WebGLRenderer({ 
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

    // Lighting - optimized for accurate color reproduction
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 3, -3);
    scene.add(directionalLight2);

    // Load 3D model
    let model = null;
    const loader = new THREE.GLTFLoader();
    
    // Fallback: create a simple box if model fails to load
    const createFallbackModel = () => {
      const geometry = new THREE.BoxGeometry(1, 2, 0.3);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x667eea,
        shininess: 60
      });
      model = new THREE.Mesh(geometry, material);
      model.position.set(-5, -0.5, 0);
      scene.add(model);
      console.log('Using fallback 3D model');
    };

    loader.load(
      '/assets/remotewebsite.glb',
      (gltf) => {
        model = gltf.scene;
        model.position.set(-5, -0.5, 0);
        
        // Enable transparency and glass materials
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.needsUpdate = true;
            // Enable proper rendering for glass/transparent materials
            if (child.material.transmission !== undefined) {
              child.material.transmission = child.material.transmission;
            }
          }
        });
        
        // Scale the model appropriately
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.3 / maxDim;
        model.scale.setScalar(scale);
        
        scene.add(model);
        console.log('3D model loaded successfully');
      },
      (progress) => {
        // Loading progress
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        createFallbackModel();
      }
    );

    // Animation state
    let scrollProgress = 0;
    let rafId = null;
    let isAnimating = false;

    // Scroll handler
    function handleScroll() {
      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1)
      const scrollStart = rect.top;
      const scrollEnd = scrollStart - (wrapperHeight - viewportHeight);
      
      if (scrollStart <= 0 && scrollStart >= scrollEnd) {
        scrollProgress = Math.abs(scrollStart) / (wrapperHeight - viewportHeight);
        scrollProgress = Math.max(0, Math.min(1, scrollProgress));
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

    // Update animation based on scroll progress
    function updateAnimation() {
      if (!model) return;

      // Smooth easing function
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const easedProgress = easeInOutCubic(scrollProgress);

      // Move model from left (-5) to right (4)
      model.position.x = -4.5 + (easedProgress * 9);

      // Rotate model - starts showing back, gradually rotates to front
      model.rotation.y = Math.PI + (easedProgress * Math.PI);
      model.rotation.x = Math.sin(easedProgress * Math.PI) * 0.15;
      model.rotation.z = Math.sin(easedProgress * Math.PI) * 0.1;

      // Text fade in/out - appears later (after 30% scroll progress) and stays visible
      let textProgress = 0;
      if (scrollProgress > 0.5) {
        // Map 0.3-0.7 to 0-1 for fade in, then stays at 1
        if (scrollProgress <= 0.7) {
          textProgress = (scrollProgress - 0.3) / 0.4; // 0.3 to 0.7 = fade in
        } else {
          textProgress = 1; // Stay at full opacity after 0.7
        }
      }
      textOverlay.style.opacity = textProgress;
      textOverlay.style.transform = `translate(-50%, -50%) scale(${0.9 + textProgress * 0.1})`;
    }

    // Animation loop
    function animate() {
      rafId = requestAnimationFrame(animate);
      
      if (model) {
        // Add subtle continuous rotation when not scrolling
        if (!isAnimating) {
          model.rotation.y += 0.002;
        }
      }
      
      renderer.render(scene, camera);
    }

    animate();

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Initial update
    handleScroll();

    // Cleanup
    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
      renderer.dispose();
      window.removeEventListener('scroll', handleScroll);
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
