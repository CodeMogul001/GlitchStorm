/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Player Controller & ZERO Entity
 */
import * as THREE from 'three';
import { ModelFactory, RiggedCharacter } from '../graphics/ModelFactory';
import { WeaponController } from './Weapons';
import { VFXSystem } from '../graphics/VFXSystem';
import { SoundEngine } from '../audio/SoundEngine';
import { WallCollider } from '../graphics/EnvironmentBuilder';
import { UpgradeId, WeaponEvolutionId, WeaponId } from '../core/Types';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRegenRate: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  speed: number;
  dashCooldown: number;
  dashCooldownMax: number;
  timeCollapseCooldown: number;
  timeCollapseCooldownMax: number;
  realityFractureCooldown: number;
  realityFractureCooldownMax: number;
  isTimeCollapsed: boolean;
  timeCollapseTimer: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  autoFire: boolean;
}

export class Player {
  public character: RiggedCharacter;
  public camera: THREE.PerspectiveCamera;
  public weaponController: WeaponController;

  // Transform
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, -10);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public rotationY: number = 0;

  // Camera Orbit
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.2;
  public isAiming: boolean = false;
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();

  // Input states
  public keys: Record<string, boolean> = {};
  public mouseLeft: boolean = false;
  public mouseRight: boolean = false;

  // Combat & Stats
  public stats: PlayerStats = {
    hp: 120,
    maxHp: 120,
    shield: 80,
    maxShield: 80,
    shieldRegenRate: 15,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    speed: 7.5,
    dashCooldown: 0,
    dashCooldownMax: 2.2,
    timeCollapseCooldown: 0,
    timeCollapseCooldownMax: 12.0,
    realityFractureCooldown: 0,
    realityFractureCooldownMax: 20.0,
    isTimeCollapsed: false,
    timeCollapseTimer: 0,
    isInvulnerable: false,
    invulnerableTimer: 0,
    autoFire: false,
  };

  // Upgrades & Evolutions Cache
  public upgrades: Record<UpgradeId, number> = {
    overclock: 0,
    quantum_core: 0,
    velocity_boost: 0,
    data_magnet: 0,
    critical_protocol: 0,
    shield_matrix: 0,
  };
  public evolutions: WeaponEvolutionId[] = [];

  private animTimer: number = 0;
  private currentWeaponMesh: THREE.Group | null = null;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.character = ModelFactory.createZero();
    this.character.group.position.copy(this.position);
    scene.add(this.character.group);

    this.camera = camera;
    this.weaponController = new WeaponController(scene);

    this.refreshWeaponMesh();
  }

  public refreshWeaponMesh(): void {
    if (this.currentWeaponMesh) {
      this.character.weaponMount.remove(this.currentWeaponMesh);
    }
    this.currentWeaponMesh = ModelFactory.createWeaponModel(this.weaponController.currentWeaponId);
    this.character.weaponMount.add(this.currentWeaponMesh);
  }

  public applyUpgrade(id: UpgradeId): void {
    this.upgrades[id] = (this.upgrades[id] || 0) + 1;
    const tier = this.upgrades[id];

    if (id === 'velocity_boost') {
      this.stats.speed = 7.5 * (1 + tier * 0.12);
    } else if (id === 'shield_matrix') {
      this.stats.maxShield = 80 + tier * 30;
      this.stats.shield = this.stats.maxShield;
      this.stats.shieldRegenRate = 15 + tier * 6;
    } else if (id === 'overclock') {
      this.stats.dashCooldownMax = Math.max(1.0, 2.2 - tier * 0.25);
    }

    // Check evolutions
    this.checkEvolutions();
  }

  public checkEvolutions(): void {
    // Pulse Rifle + Overclock = PLASMA STORM
    if (this.upgrades.overclock >= 1 && !this.evolutions.includes('plasma_storm')) {
      this.evolutions.push('plasma_storm');
    }
    // Arc Blades + Critical Protocol = THUNDER REAPER
    if (this.upgrades.critical_protocol >= 1 && !this.evolutions.includes('thunder_reaper')) {
      this.evolutions.push('thunder_reaper');
    }
    // Void Cannon + Data Magnet = SINGULARITY
    if (this.upgrades.data_magnet >= 1 && !this.evolutions.includes('singularity')) {
      this.evolutions.push('singularity');
    }
  }

  public isWeaponEvolved(id: WeaponId): boolean {
    const def = this.weaponController.getDef();
    if (!def.evolutionId) return false;
    return this.evolutions.includes(def.evolutionId);
  }

  public addXp(amount: number, onLevelUp: () => void): void {
    this.stats.xp += amount;
    if (this.stats.xp >= this.stats.xpToNextLevel) {
      this.stats.xp -= this.stats.xpToNextLevel;
      this.stats.level++;
      this.stats.xpToNextLevel = Math.round(this.stats.xpToNextLevel * 1.35);
      // Heal 40% on level up
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 40);
      this.stats.shield = this.stats.maxShield;
      SoundEngine.get().playLevelUp();
      onLevelUp();
    }
  }

  public takeDamage(amount: number, vfx: VFXSystem): void {
    if (this.stats.isInvulnerable) return;

    let dmg = amount;
    if (this.stats.shield > 0) {
      if (this.stats.shield >= dmg) {
        this.stats.shield -= dmg;
        dmg = 0;
      } else {
        dmg -= this.stats.shield;
        this.stats.shield = 0;
      }
    }

    if (dmg > 0) {
      this.stats.hp = Math.max(0, this.stats.hp - dmg);
    }

    // i-frames
    this.stats.isInvulnerable = true;
    this.stats.invulnerableTimer = 0.45;

    vfx.spawnImpactBurst(this.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xff3355, 12);
    vfx.triggerScreenShake(0.22);
    vfx.triggerHitstop(0.04);
    SoundEngine.get().playPlayerHurt();
  }

  // Abilities
  public triggerDash(vfx: VFXSystem): boolean {
    if (this.stats.dashCooldown > 0) return false;
    this.stats.dashCooldown = this.stats.dashCooldownMax;
    this.stats.isInvulnerable = true;
    this.stats.invulnerableTimer = 0.4;

    // High velocity forward boost in camera yaw direction
    const forward = new THREE.Vector3(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw)).normalize();
    this.velocity.copy(forward).multiplyScalar(22);

    vfx.spawnImpactBurst(this.position, 0x00f3ff, 14);
    SoundEngine.get().playDash();
    return true;
  }

  public triggerTimeCollapse(): boolean {
    if (this.stats.timeCollapseCooldown > 0) return false;
    this.stats.timeCollapseCooldown = this.stats.timeCollapseCooldownMax;
    this.stats.isTimeCollapsed = true;
    this.stats.timeCollapseTimer = 4.5;

    SoundEngine.get().playTimeCollapse();
    return true;
  }

  public triggerRealityFracture(
    vfx: VFXSystem,
    onDetonate: (center: THREE.Vector3, radius: number, damage: number) => void
  ): boolean {
    if (this.stats.realityFractureCooldown > 0) return false;
    this.stats.realityFractureCooldown = this.stats.realityFractureCooldownMax;

    vfx.spawnExplosion(this.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 0x00ffff);
    vfx.triggerScreenShake(0.65);
    vfx.triggerHitstop(0.08);
    SoundEngine.get().playRealityFracture();

    onDetonate(this.position, 16, 180);
    return true;
  }

  // Input Handling
  public onKeyDown(code: string): void {
    this.keys[code] = true;
    if (code === 'KeyF') {
      this.stats.autoFire = !this.stats.autoFire;
    }
  }

  public onKeyUp(code: string): void {
    this.keys[code] = false;
  }

  public onMouseMove(movementX: number, movementY: number, sensitivity: number): void {
    const sens = 0.0024 * sensitivity;
    this.cameraYaw -= movementX * sens;
    this.cameraPitch -= movementY * sens;
    // Full freedom vertical angle: look nearly straight up (+82 deg) to nearly straight down (-82 deg)
    this.cameraPitch = Math.max(-1.42, Math.min(1.42, this.cameraPitch));
  }

  // ==========================================
  // UPDATE LOOP
  // ==========================================
  public update(
    dt: number,
    colliders: WallCollider[],
    vfx: VFXSystem,
    nearestEnemyPos: THREE.Vector3 | null
  ): void {
    const safeDt = Math.min(dt, 0.05);
    this.animTimer += safeDt;

    // Cooldown updates
    if (this.stats.dashCooldown > 0) this.stats.dashCooldown -= safeDt;
    if (this.stats.timeCollapseCooldown > 0) this.stats.timeCollapseCooldown -= safeDt;
    if (this.stats.realityFractureCooldown > 0) this.stats.realityFractureCooldown -= safeDt;

    if (this.stats.invulnerableTimer > 0) {
      this.stats.invulnerableTimer -= safeDt;
      if (this.stats.invulnerableTimer <= 0) this.stats.isInvulnerable = false;
    }

    if (this.stats.isTimeCollapsed) {
      this.stats.timeCollapseTimer -= safeDt;
      if (this.stats.timeCollapseTimer <= 0) this.stats.isTimeCollapsed = false;
    }

    // Shield Regen
    if (this.stats.shield < this.stats.maxShield) {
      this.stats.shield = Math.min(this.stats.maxShield, this.stats.shield + this.stats.shieldRegenRate * safeDt);
    }

    // Movement Intent
    let moveX = 0;
    let moveZ = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && moveZ > 0;
    const currentSpeed = isSprinting ? this.stats.speed * 1.55 : this.stats.speed;

    const forward = new THREE.Vector3(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw)).normalize();
    const right = new THREE.Vector3(forward.z, 0, -forward.x).normalize();

    const moveDir = new THREE.Vector3();
    if (moveX !== 0 || moveZ !== 0) {
      moveDir.addScaledVector(forward, moveZ).addScaledVector(right, -moveX).normalize();
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, moveDir.x * currentSpeed, 14, safeDt);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, moveDir.z * currentSpeed, 14, safeDt);
    } else {
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, 0, 16, safeDt);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, 0, 16, safeDt);
    }

    // Resolve Collision with World Colliders
    const nextPos = this.position.clone().addScaledVector(this.velocity, safeDt);
    const playerRadius = 0.45;
    const playerSphere = new THREE.Sphere(nextPos.clone().add(new THREE.Vector3(0, 1, 0)), playerRadius);

    for (const col of colliders) {
      if (col.box.intersectsSphere(playerSphere)) {
        // Simple slide collision: clamp on colliding axis
        if (this.position.x < col.box.min.x - playerRadius || this.position.x > col.box.max.x + playerRadius) {
          nextPos.x = this.position.x;
          this.velocity.x = 0;
        }
        if (this.position.z < col.box.min.z - playerRadius || this.position.z > col.box.max.z + playerRadius) {
          nextPos.z = this.position.z;
          this.velocity.z = 0;
        }
      }
    }

    this.position.copy(nextPos);
    this.character.group.position.copy(this.position);

    // Character rotation: align with camera yaw when aiming or moving
    if (this.isAiming || this.mouseLeft) {
      this.rotationY = this.cameraYaw;
    } else if (moveDir.lengthSq() > 0.01) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.rotationY = THREE.MathUtils.damp(this.rotationY, targetAngle, 15, safeDt);
    }
    this.character.group.rotation.y = this.rotationY;

    // Animation state
    let animState: 'idle' | 'walk' | 'run' | 'sprint' | 'dash' | 'aim' | 'die' = 'idle';
    if (this.stats.hp <= 0) {
      animState = 'die';
    } else if (this.velocity.length() > 12) {
      animState = 'dash';
    } else if (isSprinting && this.velocity.lengthSq() > 1) {
      animState = 'sprint';
    } else if (this.velocity.lengthSq() > 0.5) {
      animState = 'run';
    } else if (this.isAiming || this.mouseLeft) {
      animState = 'aim';
    }

    // Pass aim pitch to animate spine and gun arm tilting
    this.character.updateAnimation(
      animState,
      this.animTimer,
      this.isAiming || this.mouseLeft,
      safeDt,
      this.cameraPitch
    );

    // Update Drones and Weapons
    const hasDroneSwarm = this.weaponController.currentWeaponId === 'drone_swarm' || this.upgrades.quantum_core >= 1;
    this.weaponController.update(
      safeDt,
      this.position,
      hasDroneSwarm,
      nearestEnemyPos,
      vfx,
      (id) => this.isWeaponEvolved(id)
    );

    // Combat Firing: Manual Aiming (LMB) or Auto-Fire
    const shouldFire =
      this.mouseLeft ||
      (this.stats.autoFire && nearestEnemyPos && this.position.distanceTo(nearestEnemyPos) < this.weaponController.getDef().range);

    if (shouldFire && this.stats.hp > 0) {
      // 3D Crosshair Aiming: project ray from camera through center of screen
      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);

      // Target point 60m out in exact 3D look direction
      const aimTargetPoint = this.camera.position.clone().addScaledVector(camDir, 60);

      // Gun muzzle origin from superhero weapon mount in world coordinates
      const spawnOrigin = new THREE.Vector3();
      this.character.weaponMount.getWorldPosition(spawnOrigin);
      spawnOrigin.addScaledVector(camDir, 0.4);

      let fireDir: THREE.Vector3;
      if (this.mouseLeft || !this.stats.autoFire || !nearestEnemyPos) {
        // Precise 3D vector from gun barrel directly toward crosshair target
        fireDir = aimTargetPoint.clone().sub(spawnOrigin).normalize();
      } else {
        // Intelligent auto-fire locked onto enemy threat
        fireDir = nearestEnemyPos.clone().sub(spawnOrigin).normalize();
      }

      const critChance = 0.08 + this.upgrades.critical_protocol * 0.12;
      const dmgMult = 1.0 + this.upgrades.quantum_core * 0.15;

      this.weaponController.fire(
        spawnOrigin,
        fireDir,
        vfx,
        this.isWeaponEvolved(this.weaponController.currentWeaponId),
        dmgMult,
        critChance
      );
    }

    // Third-person Camera Positioning (Over-the-Shoulder)
    this.updateCamera(safeDt, colliders);
  }

  private updateCamera(dt: number, colliders: WallCollider[]): void {
    const shoulderOffset = this.isAiming ? 0.75 : 0.85;
    const cameraDistance = this.isAiming ? 2.4 : 3.8;
    const cameraHeight = this.isAiming ? 1.45 : 1.6;

    // Desired eye position relative to player
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
    const targetAnchor = this.position.clone().add(new THREE.Vector3(0, cameraHeight, 0)).addScaledVector(right, shoulderOffset);

    // Behind camera ray
    const backDir = new THREE.Vector3(
      -Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
      -Math.sin(this.cameraPitch),
      -Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch)
    ).normalize();

    let actualDistance = cameraDistance;
    // Check wall collision for camera
    const camTestSphere = new THREE.Sphere(targetAnchor.clone().addScaledVector(backDir, cameraDistance), 0.25);
    for (const col of colliders) {
      if (col.box.intersectsSphere(camTestSphere)) {
        actualDistance = Math.max(1.2, actualDistance - 0.8);
      }
    }

    const desiredCamPos = targetAnchor.clone().addScaledVector(backDir, actualDistance);
    this.camera.position.lerp(desiredCamPos, 1 - Math.exp(-22 * dt));

    this.cameraTarget.lerp(targetAnchor.clone().addScaledVector(backDir, -10), 1 - Math.exp(-25 * dt));
    this.camera.lookAt(this.cameraTarget);

    // FOV shift on aiming
    const targetFov = this.isAiming ? 50 : 65;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 12, dt);
    this.camera.updateProjectionMatrix();
  }
}
