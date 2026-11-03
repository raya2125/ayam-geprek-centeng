/**
 * ============================================================
 * AYAM GEPREK CENTENG - 3D INTERACTIVE VIEWER (THREE.JS)
 * Ultra-lightweight, 0 external 3D asset downloads, Silky 60FPS
 * ============================================================
 */

class Centeng3DViewer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.isMini = options.isMini || false;
    this.currentSambal = 'korek';
    this.pedasLevel = 3;
    this.showMozarella = false;
    this.showNasi = true;
    this.showLalapan = true;
    this.autoRotate = true;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.foodGroup = null;
    this.steamParticles = [];
    this.chiliBitsGroup = null;
    this.mozarellaMesh = null;
    this.nasiGroup = null;
    this.lalapanGroup = null;
    this.sambalSurfaceMesh = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 400;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background to blend with dark/ambient UI

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 3.8, 4.8);

    // 3. Renderer with high-DPI & antialiasing
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.autoRotate = this.autoRotate;
      this.controls.autoRotateSpeed = this.isMini ? 2.5 : 1.2;
      this.controls.minDistance = 2.0;
      this.controls.maxDistance = 7.5;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't allow looking under table
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Build 3D Food Model (Ayam Geprek + Cobek Batu + Daun Pisang + Sambal)
    this.buildFoodModel();

    // 7. Setup Steam Aroma Particles
    this.setupSteamParticles();

    // 8. Event Listeners
    window.addEventListener('resize', () => this.onResize());

    // 9. Start Render Loop
    this.animate();
  }

  setupLighting() {
    // Ambient Warm Light for appetizing food ambiance
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.7);
    this.scene.add(ambientLight);

    // Main Warm Key Light (mimicking kitchen/studio spotlight)
    const mainLight = new THREE.DirectionalLight(0xff8c42, 1.4);
    mainLight.position.set(3, 5, 3);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 15;
    this.scene.add(mainLight);

    // Soft Rim Light from back for appetizing 3D edge glow
    const rimLight = new THREE.DirectionalLight(0xffd166, 0.8);
    rimLight.position.set(-3, 3, -3);
    this.scene.add(rimLight);

    // Fill Light
    const fillLight = new THREE.PointLight(0xff5722, 0.6, 10);
    fillLight.position.set(0, 1.5, 2);
    this.scene.add(fillLight);
  }

  buildFoodModel() {
    this.foodGroup = new THREE.Group();
    this.scene.add(this.foodGroup);

    // A. Cobek Batu (Traditional Stone Mortar Plate)
    this.buildCobekPlate();

    // B. Alas Daun Pisang (Banana Leaf Base)
    this.buildBananaLeaf();

    // C. Daging Ayam Crispy Geprek (Golden Crunchy Fried Chicken)
    this.buildCrispyChicken();

    // D. Nasi Putih Pulen Hangat
    this.buildNasiPutih();

    // E. Lalapan Segar (Timun & Jeruk Limau)
    this.buildLalapan();

    // F. Lapisan Sambal Ulek Dadakan & Biji Cabai
    this.buildSambalLayer();

    // G. Keju Mozarella Leleh (Optional Overlay)
    this.buildMozarellaMelt();

    // Position food group slightly lower to center nicely
    this.foodGroup.position.y = -0.3;
  }

  buildCobekPlate() {
    const cobekGroup = new THREE.Group();

    // Heavy Stone Plate Base
    const plateGeo = new THREE.CylinderGeometry(1.9, 1.6, 0.22, 36);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x242424,
      roughness: 0.9,
      metalness: 0.1,
    });
    const plate = new THREE.Mesh(plateGeo, stoneMat);
    plate.position.y = -0.11;
    plate.receiveShadow = true;
    cobekGroup.add(plate);

    // Cobek Rim (Tepian Cobek Batu yang Khas)
    const rimGeo = new THREE.TorusGeometry(1.85, 0.08, 12, 36);
    const rim = new THREE.Mesh(rimGeo, stoneMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.01;
    cobekGroup.add(rim);

    // Ulekan Handle / Texture bump
    this.foodGroup.add(cobekGroup);
  }

  buildBananaLeaf() {
    // Daun Pisang Hijau Segar
    const leafGeo = new THREE.CircleGeometry(1.68, 32);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.rotation.x = -Math.PI / 2;
    leaf.position.y = 0.02;
    leaf.receiveShadow = true;

    // Banana leaf ribs / vein lines decoration
    const innerRingGeo = new THREE.RingGeometry(0.3, 1.65, 32);
    const leafStripeMat = new THREE.MeshBasicMaterial({
      color: 0x388e3c,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const leafLines = new THREE.Mesh(innerRingGeo, leafStripeMat);
    leafLines.rotation.x = -Math.PI / 2;
    leafLines.position.y = 0.025;

    this.foodGroup.add(leaf);
    this.foodGroup.add(leafLines);
  }

  buildCrispyChicken() {
    const chickenGroup = new THREE.Group();

    // Material Ayam Goreng Crispy Tepung Emas Keemasan
    const crispyChickenMat = new THREE.MeshStandardMaterial({
      color: 0xcc7722, // Golden brown crispy
      roughness: 0.85,
      metalness: 0.05
    });

    // Main Chicken Chunk (Daging Ayam Geprek)
    // Using a perturbed sphere geometry to simulate irregular crunchy geprek texture
    const mainChunkGeo = new THREE.DodecahedronGeometry(0.72, 2);
    const pos = mainChunkGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      // Add crunchy bumps & flat geprek flattening
      const noise = (Math.sin(vx * 8) + Math.cos(vy * 8) + Math.sin(vz * 8)) * 0.06;
      pos.setXYZ(i, vx * 1.15 + noise, vy * 0.65 + noise, vz * 0.95 + noise);
    }
    mainChunkGeo.computeVertexNormals();

    const chickenMesh = new THREE.Mesh(mainChunkGeo, crispyChickenMat);
    chickenMesh.position.set(-0.35, 0.45, 0.1);
    chickenMesh.castShadow = true;
    chickenMesh.receiveShadow = true;
    chickenGroup.add(chickenMesh);

    // Extra Crunchy Flakes (Kremesan & Kulit Renyah yang Rontok)
    const flakeMat = new THREE.MeshStandardMaterial({
      color: 0xdda15e,
      roughness: 0.8
    });

    for (let i = 0; i < 24; i++) {
      const flakeGeo = new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.07);
      const flake = new THREE.Mesh(flakeGeo, flakeMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.55;
      flake.position.set(
        -0.35 + Math.cos(angle) * radius,
        0.08 + Math.random() * 0.45,
        0.1 + Math.sin(angle) * radius
      );
      flake.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      flake.castShadow = true;
      chickenGroup.add(flake);
    }

    this.foodGroup.add(chickenGroup);
  }

  buildNasiPutih() {
    this.nasiGroup = new THREE.Group();

    // Dome of steaming white rice
    const riceGeo = new THREE.SphereGeometry(0.65, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const riceMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.92,
      metalness: 0.02
    });
    const riceMesh = new THREE.Mesh(riceGeo, riceMat);
    riceMesh.position.set(0.65, 0.02, -0.15);
    riceMesh.scale.set(1.05, 0.8, 1.05);
    riceMesh.castShadow = true;
    riceMesh.receiveShadow = true;
    this.nasiGroup.add(riceMesh);

    // Bawang Goreng Tabur di atas Nasi
    const bawangGorengMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    for (let i = 0; i < 15; i++) {
      const bgGeo = new THREE.BoxGeometry(0.05, 0.015, 0.02);
      const bg = new THREE.Mesh(bgGeo, bawangGorengMat);
      bg.position.set(
        0.65 + (Math.random() - 0.5) * 0.35,
        0.48 + Math.random() * 0.04,
        -0.15 + (Math.random() - 0.5) * 0.35
      );
      bg.rotation.set(0, Math.random() * 3, 0);
      this.nasiGroup.add(bg);
    }

    this.foodGroup.add(this.nasiGroup);
  }

  buildLalapan() {
    this.lalapanGroup = new THREE.Group();

    // Timun Segar (Cucumber Slices)
    const timunOuterMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.4 });
    const timunInnerMat = new THREE.MeshStandardMaterial({ color: 0xd8f3dc, roughness: 0.5 });

    for (let i = 0; i < 2; i++) {
      const sliceGroup = new THREE.Group();
      const outerGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.05, 24);
      const innerGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.052, 24);
      const outer = new THREE.Mesh(outerGeo, timunOuterMat);
      const inner = new THREE.Mesh(innerGeo, timunInnerMat);
      sliceGroup.add(outer);
      sliceGroup.add(inner);

      sliceGroup.position.set(0.15 + i * 0.32, 0.08, 0.95 - i * 0.15);
      sliceGroup.rotation.x = 0.2;
      sliceGroup.rotation.z = -0.15 * i;
      sliceGroup.castShadow = true;
      this.lalapanGroup.add(sliceGroup);
    }

    // Jeruk Limau / Nipis (Lime Wedge)
    const limeGeo = new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI);
    const limeMat = new THREE.MeshStandardMaterial({ color: 0x55a630, roughness: 0.35 });
    const lime = new THREE.Mesh(limeGeo, limeMat);
    lime.position.set(-0.35, 0.08, 0.95);
    lime.rotation.x = Math.PI / 2;
    lime.rotation.y = 0.4;
    lime.castShadow = true;
    this.lalapanGroup.add(lime);

    this.foodGroup.add(this.lalapanGroup);
  }

  buildSambalLayer() {
    // Sambal Surface on top of the chicken
    const sambalGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.12, 20);
    // Perturb vertices for organic lumpy sambal look
    const pos = sambalGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0) {
        pos.setY(i, y + Math.sin(pos.getX(i) * 12) * 0.05 + Math.cos(pos.getZ(i) * 12) * 0.05);
      }
    }
    sambalGeo.computeVertexNormals();

    this.sambalSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0xdf2929, // Default Sambal Korek Red
      roughness: 0.35, // Shiny oily reflection
      metalness: 0.05
    });

    this.sambalSurfaceMesh = new THREE.Mesh(sambalGeo, this.sambalSurfaceMat);
    this.sambalSurfaceMesh.position.set(-0.35, 0.72, 0.1);
    this.sambalSurfaceMesh.castShadow = true;
    this.foodGroup.add(this.sambalSurfaceMesh);

    // Chunks of crushed rawit cabai & seeds (Biji Cabai & Potongan Rawit)
    this.chiliBitsGroup = new THREE.Group();
    this.rebuildChiliBits();
    this.foodGroup.add(this.chiliBitsGroup);
  }

  rebuildChiliBits() {
    // Clear old bits
    while (this.chiliBitsGroup.children.length > 0) {
      this.chiliBitsGroup.remove(this.chiliBitsGroup.children[0]);
    }

    if (this.pedasLevel === 0) return; // Level 0: No chili bits

    const count = Math.min(12 + this.pedasLevel * 6, 65);
    const chiliRedMat = new THREE.MeshStandardMaterial({ color: 0xb7094c, roughness: 0.3 });
    const chiliGreenMat = new THREE.MeshStandardMaterial({ color: 0x2b9348, roughness: 0.3 });
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xffe6a7, roughness: 0.8 }); // Biji Cabai Putih Kuning

    for (let i = 0; i < count; i++) {
      const isSeed = Math.random() > 0.6;
      let mesh;

      if (isSeed) {
        const seedGeo = new THREE.SphereGeometry(0.024, 6, 6);
        seedGeo.scale(1.2, 0.6, 1.2);
        mesh = new THREE.Mesh(seedGeo, seedMat);
      } else {
        const bitGeo = new THREE.BoxGeometry(0.05 + Math.random() * 0.04, 0.02, 0.04);
        mesh = new THREE.Mesh(bitGeo, Math.random() > 0.25 ? chiliRedMat : chiliGreenMat);
      }

      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.48;
      mesh.position.set(
        -0.35 + Math.cos(angle) * radius,
        0.75 + Math.random() * 0.06,
        0.1 + Math.sin(angle) * radius
      );
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.chiliBitsGroup.add(mesh);
    }
  }

  buildMozarellaMelt() {
    // Melted cheese draped over chicken
    const cheeseGeo = new THREE.SphereGeometry(0.68, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.35);
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f, // Creamy melted cheese
      roughness: 0.35,
      metalness: 0.05
    });

    this.mozarellaMesh = new THREE.Mesh(cheeseGeo, cheeseMat);
    this.mozarellaMesh.position.set(-0.35, 0.70, 0.1);
    this.mozarellaMesh.scale.set(1.1, 0.8, 1.1);
    this.mozarellaMesh.visible = false; // Hidden by default
    this.foodGroup.add(this.mozarellaMesh);
  }

  setupSteamParticles() {
    // Gentle hot steam rising upwards from fresh geprek & hot rice
    const particleCount = this.isMini ? 8 : 16;
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    });

    for (let i = 0; i < particleCount; i++) {
      const geo = new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 8, 8);
      const p = new THREE.Mesh(geo, steamMat.clone());
      this.resetParticle(p);
      p.position.y = 0.5 + Math.random() * 1.5;
      this.scene.add(p);
      this.steamParticles.push(p);
    }
  }

  resetParticle(p) {
    // Spawn over chicken or rice
    const isRice = Math.random() > 0.5;
    if (isRice && this.showNasi) {
      p.position.set(0.65 + (Math.random() - 0.5) * 0.4, 0.5, -0.15 + (Math.random() - 0.5) * 0.4);
    } else {
      p.position.set(-0.35 + (Math.random() - 0.5) * 0.45, 0.7, 0.1 + (Math.random() - 0.5) * 0.45);
    }
    p.scale.set(0.7, 0.7, 0.7);
    p.material.opacity = 0.18;
  }

  // --- Dynamic Live Updates ---
  setSambalVariant(variant) {
    this.currentSambal = variant;
    if (!this.sambalSurfaceMat) return;

    switch (variant) {
      case 'korek':
        this.sambalSurfaceMat.color.setHex(0xdf2929); // Fiery red
        break;
      case 'matah':
        this.sambalSurfaceMat.color.setHex(0xe67e22); // Orange shallots
        break;
      case 'ijo':
        this.sambalSurfaceMat.color.setHex(0x388e3c); // Green rawit
        break;
      case 'keju':
        this.sambalSurfaceMat.color.setHex(0xffca28); // Creamy cheese sauce
        break;
    }
    this.rebuildChiliBits();
  }

  setPedasLevel(level) {
    this.pedasLevel = parseInt(level, 10);
    if (this.sambalSurfaceMesh) {
      if (this.pedasLevel === 0) {
        this.sambalSurfaceMesh.visible = false;
      } else {
        this.sambalSurfaceMesh.visible = true;
        // Increase sambal height and intensity
        const scaleY = 0.6 + (this.pedasLevel / 10) * 0.8;
        this.sambalSurfaceMesh.scale.set(1, scaleY, 1);
      }
    }
    this.rebuildChiliBits();
  }

  toggleMozarella(show) {
    this.showMozarella = show;
    if (this.mozarellaMesh) {
      this.mozarellaMesh.visible = show;
    }
  }

  toggleNasi(show) {
    this.showNasi = show;
    if (this.nasiGroup) {
      this.nasiGroup.visible = show;
    }
  }

  toggleLalapan(show) {
    this.showLalapan = show;
    if (this.lalapanGroup) {
      this.lalapanGroup.visible = show;
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    if (this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
    return this.autoRotate;
  }

  resetCamera() {
    if (this.controls) {
      this.controls.reset();
    }
    this.camera.position.set(0, 3.8, 4.8);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update Controls
    if (this.controls) {
      this.controls.update();
    }

    // Animate Steam Aroma Particles
    for (let i = 0; i < this.steamParticles.length; i++) {
      const p = this.steamParticles[i];
      p.position.y += 0.007 + Math.random() * 0.004;
      p.scale.x += 0.005;
      p.scale.z += 0.005;
      p.material.opacity -= 0.0016;

      if (p.position.y > 2.6 || p.material.opacity <= 0.01) {
        this.resetParticle(p);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global viewer instances
let main3dViewer = null;
let heroTeaserViewer = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Main 3D Customizer Viewer
  main3dViewer = new Centeng3DViewer('three3dCanvas', { isMini: false });

  // Hero Mini Teaser Viewer
  const teaserContainer = document.getElementById('heroTeaserCanvas');
  if (teaserContainer) {
    heroTeaserViewer = new Centeng3DViewer('heroTeaserCanvas', { isMini: true });
  }
});
