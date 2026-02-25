// SYNC OBJ – full-page scroll-driven 3D animation
// Loads entity04.obj via fetch(), parses with OBJLoader, animates across
// the entire page with keyframed position/rotation + halo color shift.

(function () {
  'use strict';

  var OBJ_PATH = '/assets/SyncAssets/entity04.obj';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── bootstrap ─────────────────────────────────────────────── */
  function boot() {
    var canvas = document.querySelector('.sync-obj-global-canvas');
    if (!canvas) return;                       // not the SYNC page
    if (window.innerWidth <= 768) return;       // skip on small screens

    console.log('[sync3d] booting…');

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', function () {
      loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js', function () {
        console.log('[sync3d] Three + OBJLoader ready');
        fetchAndRun(canvas);
      });
    });
  }

  /* ── fetch the OBJ as text, then hand to Three ─────────────── */
  function fetchAndRun(canvas) {
    console.log('[sync3d] fetching', OBJ_PATH);

    fetch(OBJ_PATH)
      .then(function (res) {
        console.log('[sync3d] fetch status', res.status, res.statusText);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (objText) {
        console.log('[sync3d] OBJ text length:', objText.length);
        var parser = new THREE.OBJLoader();
        var obj = parser.parse(objText);
        console.log('[sync3d] parsed OBJ, children:', obj.children.length);
        startScene(canvas, obj);
      })
      .catch(function (err) {
        console.error('[sync3d] OBJ load failed:', err);
      });
  }

  /* ── main scene ────────────────────────────────────────────── */
  function startScene(canvas, objRoot) {

    var textOverlay = document.querySelector('.sync-obj-global-text');

    /* renderer */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    /* scene + camera */
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    camera.position.set(0, 0.1, 7);

    /* lights */
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-5, 2, -3);
    scene.add(rimLight);
    var fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, -3, 4);
    scene.add(fillLight);

    /* materials */
    var isDark = function () { return document.body.classList.contains('dark-mode'); };

    var mainMat = new THREE.MeshPhysicalMaterial({
      color: isDark() ? 0x0b1020 : 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    var glowMat = new THREE.MeshBasicMaterial({
      color: 0x37d6d6,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });

    /* apply materials + add glow shell to every mesh */
    objRoot.traverse(function (child) {
      if (child.isMesh) {
        if (child.geometry) child.geometry.computeVertexNormals();
        child.material = mainMat;
        var halo = new THREE.Mesh(child.geometry, glowMat);
        halo.scale.setScalar(1.06);
        child.add(halo);
      }
    });

    /* normalize + center */
    var box = new THREE.Box3().setFromObject(objRoot);
    var size = box.getSize(new THREE.Vector3());
    var center = box.getCenter(new THREE.Vector3());
    objRoot.position.sub(center);
    var maxDim = Math.max(size.x, size.y, size.z) || 1;
    objRoot.scale.setScalar(2.4 / maxDim);

    var group = new THREE.Group();
    group.add(objRoot);
    scene.add(group);

    /* dark-mode watcher */
    new MutationObserver(function () {
      mainMat.color.setHex(isDark() ? 0x0b1020 : 0x1a1a1a);
      mainMat.needsUpdate = true;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

    /* ── scroll tracking ───────────────────────────────────── */
    var scrollProg = 0, targetProg = 0;

    function onScroll() {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetProg = Math.min(1, Math.max(0, window.scrollY / max));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── keyframes: x, y, rotation, scale, glow intensity ──── */
    var KF = [
      { t: 0.00, x: -1.6, y:  0.4, rx: 0.2,  ry: 0.0,  rz:-0.1,  s: 1.0,  g: 0.08 },
      { t: 0.12, x: -1.0, y:  1.1, rx: 0.4,  ry: 1.2,  rz: 0.08, s: 1.06, g: 0.28 },
      { t: 0.28, x:  1.2, y:  0.6, rx: 0.15, ry: 2.7,  rz:-0.05, s: 0.94, g: 0.50 },
      { t: 0.44, x:  0.5, y: -0.9, rx:-0.1,  ry: 4.1,  rz: 0.1,  s: 1.10, g: 0.72 },
      { t: 0.60, x: -1.1, y: -0.3, rx: 0.3,  ry: 5.6,  rz:-0.12, s: 1.0,  g: 0.42 },
      { t: 0.78, x:  1.0, y:  1.0, rx: 0.5,  ry: 7.3,  rz: 0.02, s: 1.15, g: 0.78 },
      { t: 1.00, x: -0.1, y:  0.1, rx: 0.25, ry: 8.6,  rz: 0.0,  s: 1.04, g: 0.22 },
    ];

    function sampleKF(t) {
      var c = Math.max(0, Math.min(1, t));
      var i = 0;
      while (i < KF.length - 2 && c > KF[i + 1].t) i++;
      var a = KF[i], b = KF[i + 1];
      var span = Math.max(1e-6, b.t - a.t);
      var e = ease((c - a.t) / span);
      return {
        x:  mix(a.x,  b.x,  e),
        y:  mix(a.y,  b.y,  e),
        rx: mix(a.rx, b.rx, e),
        ry: mix(a.ry, b.ry, e),
        rz: mix(a.rz, b.rz, e),
        s:  mix(a.s,  b.s,  e),
        g:  mix(a.g,  b.g,  e),
      };
    }

    /* ── resize ─────────────────────────────────────────────── */
    function onResize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);
    onResize();

    /* ── accent color helpers ──────────────────────────────── */
    var cyanR = 0x37/255, cyanG = 0xd6/255, cyanB = 0xd6/255;
    var violR = 0xb6/255, violG = 0x9f/255, violB = 0xff/255;

    /* ── render loop ───────────────────────────────────────── */
    function animate(ms) {
      requestAnimationFrame(animate);
      var now = (ms || 0) / 1000;

      // smooth scroll follow
      var diff = Math.abs(targetProg - scrollProg);
      scrollProg = mix(scrollProg, targetProg, Math.min(0.22, 0.06 + diff * 0.9));

      var kf = sampleKF(scrollProg);

      // micro-motion so it feels alive
      var wx = 0.10 * Math.sin(now * 0.85 + scrollProg * 7);
      var wy = 0.07 * Math.cos(now * 0.72 + scrollProg * 5);
      var wr = 0.12 * Math.sin(now * 0.55 + scrollProg * 3);

      group.position.set(kf.x + wx, kf.y + wy, 0);
      group.rotation.set(
        kf.rx + 0.06 * Math.sin(now * 0.9),
        kf.ry + wr,
        kf.rz + 0.04 * Math.cos(now * 0.8)
      );
      group.scale.setScalar(kf.s);

      // camera breathe
      camera.position.z = mix(7, 5.2, ease(scrollProg));
      camera.position.y = mix(0.15, -0.1, ease(scrollProg));
      camera.lookAt(0, 0, 0);

      // halo color: cycle cyan → violet and pulse
      var colorT = Math.sin(scrollProg * Math.PI * 2) * 0.5 + 0.5;
      var pulse  = 0.45 + 0.55 * Math.sin(now * 1.4 + scrollProg * 10);
      glowMat.color.setRGB(
        mix(cyanR, violR, colorT),
        mix(cyanG, violG, colorT),
        mix(cyanB, violB, colorT)
      );
      glowMat.opacity = Math.min(0.55, kf.g * 0.45 * pulse);

      // emissive tint on main material
      var emK = isDark() ? 0.18 : 0.10;
      mainMat.emissive.setRGB(
        mix(cyanR, violR, colorT) * emK,
        mix(cyanG, violG, colorT) * emK,
        mix(cyanB, violB, colorT) * emK
      );
      mainMat.emissiveIntensity = isDark() ? 1.0 : 0.8;

      // caption
      if (textOverlay) {
        var appear = smoothstep(0.02, 0.10, scrollProg);
        var fade   = 1 - smoothstep(0.55, 0.75, scrollProg);
        var op = Math.max(0, Math.min(1, appear * (0.85 * fade + 0.15)));
        textOverlay.style.opacity = op;
        textOverlay.style.transform = 'translateY(' + mix(10, 0, op) + 'px)';
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
    console.log('[sync3d] running ✓');
  }

  /* ── helpers ────────────────────────────────────────────────── */
  function mix(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }
  function smoothstep(lo, hi, x) {
    var t = Math.max(0, Math.min(1, (x - lo) / Math.max(1e-6, hi - lo)));
    return t * t * (3 - 2 * t);
  }

  function loadScript(url, cb) {
    if (url.indexOf('three.min') !== -1 && window.THREE) return cb();
    if (url.indexOf('OBJLoader') !== -1 && window.THREE && window.THREE.OBJLoader) return cb();
    var s = document.createElement('script');
    s.src = url;
    s.onload = cb;
    s.onerror = function () { console.error('[sync3d] script load failed:', url); };
    document.head.appendChild(s);
  }
})();
