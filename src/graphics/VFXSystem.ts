/**
 * GLITCHSTORM: THE LAST SIGNAL
 * VFX, Projectile Tracers, Particles & XP Nanite Cubes
 */
import * as THREE from 'three';

export interface Projectile {
  id: string;
  isPlayer: boolean;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  radius: number;
  lifetime: number;
  isAoE: boolean;
  aoeRadius: number;
  color: string;
  sourceWeapon?: string;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLife: number;
  scaleStart: number;
  colorStart: THREE.Color;
}

export interface XpCube {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  value: number;
  isMagnetized: boolean;
  active: boolean;
}

export interface AttackTelegraph {
  mesh: THREE.Mesh;
  duration: number;
  maxDuration: number;
  radius: number;
  position: THREE.Vector3;
}

export class VFXSystem {
  private scene: THREE.Scene;
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private xpCubes: XpCube[] = [];
  private telegraphs: AttackTelegraph[] = [];

  // Hitstop & screen shake
  public hitstopTimer: number = 0;
  public cameraShakeIntensity: number = 0;

  // Shared Geometries & Materials
  private bulletGeo: THREE.SphereGeometry;
  private particleGeo: THREE.BoxGeometry;
  private xpGeo: THREE.BoxGeometry;
  private ringGeo: THREE.RingGeometry;

  private pulseMat: THREE.MeshBasicMaterial;
  private voidMat: THREE.MeshBasicMaterial;
  private arcMat: THREE.MeshBasicMaterial;
  private enemyBulletMat: THREE.MeshBasicMaterial;
  private xpMat: THREE.MeshBasicMaterial;
  private ringMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.bulletGeo = new THREE.SphereGeometry(0.12, 6, 6);
    this.particleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    this.xpGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    this.ringGeo = new THREE.RingGeometry(0.1, 1.0, 32);

    this.pulseMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    this.voidMat = new THREE.MeshBasicMaterial({ color: 0xbb00ff });
    this.arcMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
    this.enemyBulletMat = new THREE.MeshBasicMaterial({ color: 0xff1144 });
    this.xpMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    this.ringMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
  }

  // ==========================================
  // PROJECTILES
  // ==========================================
  public spawnProjectile(
    isPlayer: boolean,
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    damage: number,
    radius: number,
    weaponId: string
  ): void {
    const isVoid = weaponId === 'void_cannon' || weaponId === 'singularity';
    const isArc = weaponId === 'arc_blades' || weaponId === 'thunder_reaper';

    const mat = !isPlayer
      ? this.enemyBulletMat
      : isVoid
      ? this.voidMat
      : isArc
      ? this.arcMat
      : this.pulseMat;

    const scale = isVoid ? 2.5 : 1.0;
    const mesh = new THREE.Mesh(this.bulletGeo, mat);
    mesh.position.copy(origin);
    mesh.scale.set(scale, scale, scale);
    this.scene.add(mesh);

    this.projectiles.push({
      id: Math.random().toString(),
      isPlayer,
      mesh,
      velocity: direction.clone().normalize().multiplyScalar(speed),
      damage,
      radius: radius * scale,
      lifetime: 3.5,
      isAoE: isVoid,
      aoeRadius: isVoid ? 4.5 : 0,
      color: isVoid ? '#bb00ff' : '#00f3ff',
      sourceWeapon: weaponId,
    });
  }

  // ==========================================
  // PARTICLES
  // ==========================================
  public spawnImpactBurst(pos: THREE.Vector3, colorHex: number = 0x00f3ff, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(this.particleGeo, mat);
      mesh.position.copy(pos);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 6
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        lifetime: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        scaleStart: 0.12,
        colorStart: new THREE.Color(colorHex),
      });
    }
  }

  public spawnExplosion(pos: THREE.Vector3, colorHex: number = 0xff3300): void {
    this.spawnImpactBurst(pos, colorHex, 24);
    this.triggerScreenShake(0.35);
    this.triggerHitstop(0.06);
  }

  // ==========================================
  // XP NANITE DATA CUBES
  // ==========================================
  public spawnXp(pos: THREE.Vector3, count: number = 2): void {
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.xpGeo, this.xpMat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 1.5,
        pos.y + 0.3,
        pos.z + (Math.random() - 0.5) * 1.5
      );
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      this.scene.add(mesh);

      this.xpCubes.push({
        mesh,
        position: mesh.position,
        value: 15,
        isMagnetized: false,
        active: true,
      });
    }
  }

  // ==========================================
  // BOSS ATTACK TELEGRAPHS
  // ==========================================
  public spawnGroundTelegraph(pos: THREE.Vector3, radius: number, duration: number): void {
    const mesh = new THREE.Mesh(this.ringGeo, this.ringMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, 0.05, pos.z);
    mesh.scale.set(radius, radius, 1);
    this.scene.add(mesh);

    this.telegraphs.push({
      mesh,
      duration,
      maxDuration: duration,
      radius,
      position: pos.clone(),
    });
  }

  // ==========================================
  // SHAKE & HITSTOP
  // ==========================================
  public triggerScreenShake(intensity: number): void {
    this.cameraShakeIntensity = Math.min(this.cameraShakeIntensity + intensity, 1.0);
  }

  public triggerHitstop(seconds: number): void {
    this.hitstopTimer = Math.max(this.hitstopTimer, seconds);
  }

  // ==========================================
  // FRAME UPDATE
  // ==========================================
  public update(
    dt: number,
    playerPosition: THREE.Vector3,
    magnetRadius: number,
    onCollectXp: (amount: number) => void
  ): {
    projectiles: Projectile[];
    shakeOffset: THREE.Vector3;
  } {
    // Clamped dt
    const safeDt = Math.min(dt, 0.05);

    // Screen Shake Decay
    const shakeOffset = new THREE.Vector3();
    if (this.cameraShakeIntensity > 0.005) {
      shakeOffset.set(
        (Math.random() - 0.5) * this.cameraShakeIntensity * 0.45,
        (Math.random() - 0.5) * this.cameraShakeIntensity * 0.45,
        (Math.random() - 0.5) * this.cameraShakeIntensity * 0.45
      );
      this.cameraShakeIntensity = THREE.MathUtils.damp(this.cameraShakeIntensity, 0, 8, safeDt);
    }

    // Hitstop deduction
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= safeDt;
      return { projectiles: this.projectiles, shakeOffset };
    }

    // 1. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.addScaledVector(p.velocity, safeDt);
      p.lifetime -= safeDt;

      if (p.lifetime <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // 2. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.velocity.y -= 9.8 * safeDt; // gravity
      pt.mesh.position.addScaledVector(pt.velocity, safeDt);
      pt.lifetime -= safeDt;

      const progress = Math.max(0, pt.lifetime / pt.maxLife);
      pt.mesh.scale.setScalar(pt.scaleStart * progress);

      if (pt.mesh.position.y < 0.05) {
        pt.mesh.position.y = 0.05;
        pt.velocity.y = -pt.velocity.y * 0.3; // bounce
      }

      if (pt.lifetime <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 3. Update XP Nanite Cubes
    for (let i = this.xpCubes.length - 1; i >= 0; i--) {
      const xp = this.xpCubes[i];
      if (!xp.active) continue;

      // Rotation
      xp.mesh.rotation.x += 2 * safeDt;
      xp.mesh.rotation.y += 3 * safeDt;

      const dist = xp.position.distanceTo(playerPosition);
      if (dist < magnetRadius) {
        xp.isMagnetized = true;
      }

      if (xp.isMagnetized) {
        // Accelerate toward player
        const dir = playerPosition.clone().sub(xp.position).normalize();
        xp.position.addScaledVector(dir, Math.max(12, 28 - dist) * safeDt);

        if (dist < 1.2) {
          xp.active = false;
          this.scene.remove(xp.mesh);
          this.xpCubes.splice(i, 1);
          this.spawnImpactBurst(playerPosition, 0x00ffff, 4);
          onCollectXp(xp.value);
        }
      }
    }

    // 4. Update Attack Telegraphs
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tel = this.telegraphs[i];
      tel.duration -= safeDt;
      const progress = 1 - tel.duration / tel.maxDuration;
      (tel.mesh.material as THREE.MeshBasicMaterial).opacity = 0.2 + progress * 0.6;

      if (tel.duration <= 0) {
        this.scene.remove(tel.mesh);
        this.telegraphs.splice(i, 1);
      }
    }

    return {
      projectiles: this.projectiles,
      shakeOffset,
    };
  }

  public removeProjectile(index: number): void {
    if (this.projectiles[index]) {
      this.scene.remove(this.projectiles[index].mesh);
      this.projectiles.splice(index, 1);
    }
  }

  public clearAll(): void {
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.particles.forEach((pt) => this.scene.remove(pt.mesh));
    this.xpCubes.forEach((xp) => this.scene.remove(xp.mesh));
    this.telegraphs.forEach((tel) => this.scene.remove(tel.mesh));
    this.projectiles = [];
    this.particles = [];
    this.xpCubes = [];
    this.telegraphs = [];
  }
}
