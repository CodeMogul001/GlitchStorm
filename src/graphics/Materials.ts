/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Procedural PBR Materials & Textures
 * Zero external asset dependencies - 100% procedural Canvas & Three.js materials
 */
import * as THREE from 'three';

export class MaterialsManager {
  private static instance: MaterialsManager | null = null;

  // Cached textures
  public floorGridTexture: THREE.CanvasTexture;
  public wallPanelTexture: THREE.CanvasTexture;
  public serverRackTexture: THREE.CanvasTexture;
  public hazardStripeTexture: THREE.CanvasTexture;
  public hologramNoiseTexture: THREE.CanvasTexture;

  // Superhero Materials
  public heroSuitMat: THREE.MeshStandardMaterial;
  public heroAccentMat: THREE.MeshStandardMaterial;
  public heroGoldMat: THREE.MeshStandardMaterial;
  public heroCapeMat: THREE.MeshStandardMaterial;
  public heroSkinMat: THREE.MeshStandardMaterial;
  public heroEyesMat: THREE.MeshBasicMaterial;

  public playerArmorMat: THREE.MeshStandardMaterial;
  public playerVisorMat: THREE.MeshPhysicalMaterial;
  public playerCoreCyanMat: THREE.MeshBasicMaterial;
  public playerCoreGoldMat: THREE.MeshBasicMaterial;
  public playerJointMat: THREE.MeshStandardMaterial;

  public floorMat: THREE.MeshStandardMaterial;
  public wallMat: THREE.MeshStandardMaterial;
  public serverRackMat: THREE.MeshStandardMaterial;
  public catwalkMetalMat: THREE.MeshStandardMaterial;
  public hazardDoorMat: THREE.MeshStandardMaterial;
  public glassShieldMat: THREE.MeshPhysicalMaterial;

  // Enemy Materials
  public glitchlingBodyMat: THREE.MeshStandardMaterial;
  public glitchlingEyeMat: THREE.MeshBasicMaterial;
  public dasherBodyMat: THREE.MeshStandardMaterial;
  public dasherBladeMat: THREE.MeshBasicMaterial;
  public turretBodyMat: THREE.MeshStandardMaterial;
  public bruteArmorMat: THREE.MeshStandardMaterial;
  public bruteGlowMat: THREE.MeshBasicMaterial;

  // Boss Materials
  public wardenHullMat: THREE.MeshStandardMaterial;
  public wardenCoreRedMat: THREE.MeshBasicMaterial;
  public wardenArmorPlateMat: THREE.MeshStandardMaterial;

  // Interactive Prop Materials
  public terminalHoloMat: THREE.MeshBasicMaterial;
  public relayActiveMat: THREE.MeshBasicMaterial;
  public relayInactiveMat: THREE.MeshBasicMaterial;
  public energyCoreOrbMat: THREE.MeshBasicMaterial;

  public static get(): MaterialsManager {
    if (!this.instance) {
      this.instance = new MaterialsManager();
    }
    return this.instance;
  }

  private constructor() {
    this.floorGridTexture = this.generateFloorGridTexture();
    this.wallPanelTexture = this.generateWallPanelTexture();
    this.serverRackTexture = this.generateServerRackTexture();
    this.hazardStripeTexture = this.generateHazardStripeTexture();
    this.hologramNoiseTexture = this.generateHologramNoiseTexture();

    // Superhero Materials
    this.heroSuitMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.52,
      metalness: 0.18,
    });

    this.heroAccentMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.38,
      metalness: 0.32,
    });

    this.heroGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.22,
      metalness: 0.85,
    });

    this.heroCapeMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d, // Deep superhero crimson
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    this.heroSkinMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.7,
      metalness: 0.05,
    });

    this.heroEyesMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // Player Materials
    this.playerArmorMat = new THREE.MeshStandardMaterial({
      color: 0x181e28,
      metalness: 0.85,
      roughness: 0.28,
    });

    this.playerJointMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f14,
      metalness: 0.9,
      roughness: 0.45,
    });

    this.playerVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f0ff,
      emissive: 0x0088cc,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    this.playerCoreCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    });

    this.playerCoreGoldMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });

    // Environment Materials
    this.floorMat = new THREE.MeshStandardMaterial({
      map: this.floorGridTexture,
      roughness: 0.4,
      metalness: 0.65,
    });

    this.wallMat = new THREE.MeshStandardMaterial({
      map: this.wallPanelTexture,
      roughness: 0.5,
      metalness: 0.75,
    });

    this.serverRackMat = new THREE.MeshStandardMaterial({
      map: this.serverRackTexture,
      roughness: 0.35,
      metalness: 0.8,
    });

    this.catwalkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      roughness: 0.3,
      metalness: 0.88,
    });

    this.hazardDoorMat = new THREE.MeshStandardMaterial({
      map: this.hazardStripeTexture,
      roughness: 0.4,
      metalness: 0.6,
    });

    this.glassShieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      depthWrite: false,
    });

    // Enemies
    this.glitchlingBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1215,
      roughness: 0.4,
      metalness: 0.85,
    });

    this.glitchlingEyeMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
    });

    this.dasherBodyMat = new THREE.MeshStandardMaterial({
      color: 0x241828,
      roughness: 0.25,
      metalness: 0.9,
    });

    this.dasherBladeMat = new THREE.MeshBasicMaterial({
      color: 0xff0088,
    });

    this.turretBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1c212a,
      roughness: 0.3,
      metalness: 0.85,
    });

    this.bruteArmorMat = new THREE.MeshStandardMaterial({
      color: 0x221115,
      roughness: 0.45,
      metalness: 0.92,
    });

    this.bruteGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff3300,
    });

    // Boss: The Warden
    this.wardenHullMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.3,
      metalness: 0.9,
    });

    this.wardenArmorPlateMat = new THREE.MeshStandardMaterial({
      color: 0x2b3445,
      roughness: 0.2,
      metalness: 0.95,
    });

    this.wardenCoreRedMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
    });

    // Props
    this.terminalHoloMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });

    this.relayActiveMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
    });

    this.relayInactiveMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
    });

    this.energyCoreOrbMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    });
  }

  private generateFloorGridTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark titanium metal plate base
    ctx.fillStyle = '#111620';
    ctx.fillRect(0, 0, 512, 512);

    // Grid panels
    ctx.strokeStyle = '#1e2838';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 504);

    // Center sub-grid
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    // Rivets at corners
    ctx.fillStyle = '#2d3a4f';
    const rivets = [
      [16, 16],
      [496, 16],
      [16, 496],
      [496, 496],
      [240, 240],
      [272, 272],
    ];
    rivets.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Subtle cyan luminescent conduit line
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 256);
    ctx.lineTo(448, 256);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private generateWallPanelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Industrial wall paneling
    ctx.fillStyle = '#161d28';
    ctx.fillRect(0, 0, 512, 512);

    // Bevel shading
    ctx.fillStyle = '#1f2838';
    ctx.fillRect(16, 16, 480, 230);
    ctx.fillRect(16, 266, 480, 230);

    // Seams
    ctx.strokeStyle = '#0a0d14';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 496);
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    // Warning decal
    ctx.fillStyle = '#e6af2e';
    ctx.fillRect(32, 32, 16, 8);
    ctx.fillRect(464, 32, 16, 8);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private generateServerRackTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0e1219';
    ctx.fillRect(0, 0, 256, 512);

    // 16 blade servers with blinking status LEDs
    for (let i = 0; i < 16; i++) {
      const y = i * 32;
      ctx.fillStyle = '#18202d';
      ctx.fillRect(8, y + 4, 240, 24);

      // Vent lines
      ctx.fillStyle = '#0a0d12';
      for (let j = 0; j < 12; j++) {
        ctx.fillRect(20 + j * 12, y + 8, 6, 16);
      }

      // Blinking LEDs
      ctx.fillStyle = i % 3 === 0 ? '#00ffff' : i % 2 === 0 ? '#00ff66' : '#ff3344';
      ctx.fillRect(210, y + 10, 5, 5);
      ctx.fillRect(222, y + 10, 5, 5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private generateHazardStripeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1c2432';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#e6a817';
    for (let i = -256; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 32, 0);
      ctx.lineTo(i + 32 + 256, 256);
      ctx.lineTo(i + 256, 256);
      ctx.closePath();
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private generateHologramNoiseTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = 0;
      img.data[i + 1] = v;
      img.data[i + 2] = 255;
      img.data[i + 3] = Math.random() * 80;
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}
