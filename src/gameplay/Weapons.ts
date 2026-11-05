/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Weapons & Evolution Mechanics
 */
import * as THREE from 'three';
import { WeaponDef, WeaponId } from '../core/Types';
import { SoundEngine } from '../audio/SoundEngine';
import { VFXSystem } from '../graphics/VFXSystem';

export const WEAPON_REGISTRY: Record<WeaponId, WeaponDef> = {
  pulse_rifle: {
    id: 'pulse_rifle',
    name: 'Pulse Rifle',
    category: 'Rifle',
    description: 'Balanced automatic energy rifle with reliable fire rate and cyan tracers.',
    damage: 22,
    fireRate: 6.5,
    range: 45,
    ammoMax: 32,
    reloadTime: 1.4,
    projectileSpeed: 52,
    projectileColor: '#00f3ff',
    evolutionId: 'plasma_storm',
    evolutionName: 'PLASMA STORM',
    evolutionDesc: 'Hyper-velocity ionized plasma bolts with chain splash discharge.',
    pairedUpgradeId: 'overclock',
  },
  arc_blades: {
    id: 'arc_blades',
    name: 'Arc Blades',
    category: 'Melee/Arc',
    description: 'High-frequency electric blades that slice targets and chain lightning.',
    damage: 42,
    fireRate: 3.2,
    range: 9,
    ammoMax: 100, // Energy percent
    reloadTime: 0.8,
    projectileSpeed: 38,
    projectileColor: '#00ffaa',
    evolutionId: 'thunder_reaper',
    evolutionName: 'THUNDER REAPER',
    evolutionDesc: '360° vortex arc slice with guaranteed lethal critical surges.',
    pairedUpgradeId: 'critical_protocol',
  },
  void_cannon: {
    id: 'void_cannon',
    name: 'Void Cannon',
    category: 'Heavy',
    description: 'Heavy antimatter cannon firing dense gravitational implosion spheres.',
    damage: 95,
    fireRate: 1.1,
    range: 55,
    ammoMax: 6,
    reloadTime: 2.2,
    projectileSpeed: 32,
    projectileColor: '#bb00ff',
    evolutionId: 'singularity',
    evolutionName: 'SINGULARITY',
    evolutionDesc: 'Vortex singularity that drags enemies to the epicenter before detonating.',
    pairedUpgradeId: 'data_magnet',
  },
  drone_swarm: {
    id: 'drone_swarm',
    name: 'Drone Swarm',
    category: 'Deployable',
    description: 'Autonomous combat escort drones that orbit ZERO and eliminate flankers.',
    damage: 16,
    fireRate: 2.8,
    range: 22,
    ammoMax: 50,
    reloadTime: 1.0,
    projectileSpeed: 45,
    projectileColor: '#00ffff',
    pairedUpgradeId: 'quantum_core',
  },
};

export class WeaponController {
  public currentWeaponId: WeaponId = 'pulse_rifle';
  public ammoInClip: number = 32;
  public isReloading: boolean = false;
  public reloadTimer: number = 0;
  private shotCooldown: number = 0;

  // Drone swarm 3D visual anchors
  public droneMeshGroup: THREE.Group;
  private droneOrbitAngle: number = 0;
  private droneFireTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.droneMeshGroup = new THREE.Group();
    this.droneMeshGroup.name = 'ORBITAL_DRONES';
    scene.add(this.droneMeshGroup);

    // Build 2 micro escort drones
    for (let i = 0; i < 2; i++) {
      const drone = new THREE.Group();
      drone.name = `drone_${i}`;

      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12),
        new THREE.MeshBasicMaterial({ color: 0x00ffff })
      );
      drone.add(core);

      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.02, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.3 })
      );
      drone.add(wing);

      this.droneMeshGroup.add(drone);
    }
  }

  public getDef(): WeaponDef {
    return WEAPON_REGISTRY[this.currentWeaponId];
  }

  public switchWeapon(id: WeaponId): void {
    if (this.currentWeaponId === id) return;
    this.currentWeaponId = id;
    const def = this.getDef();
    this.ammoInClip = def.ammoMax;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.shotCooldown = 0.2;
    SoundEngine.get().playReload();
  }

  public reload(): void {
    const def = this.getDef();
    if (this.isReloading || this.ammoInClip === def.ammoMax) return;
    this.isReloading = true;
    this.reloadTimer = def.reloadTime;
    SoundEngine.get().playReload();
  }

  public update(
    dt: number,
    playerPosition: THREE.Vector3,
    hasSwarmUnlocked: boolean,
    nearestEnemyPos: THREE.Vector3 | null,
    vfx: VFXSystem,
    isEvolved: (id: WeaponId) => boolean,
    onEnemyDamaged?: (dmg: number, targetPos: THREE.Vector3) => void
  ): void {
    if (this.shotCooldown > 0) {
      this.shotCooldown -= dt;
    }

    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        this.ammoInClip = this.getDef().ammoMax;
      }
    }

    // Update Drones
    if (hasSwarmUnlocked) {
      this.droneMeshGroup.visible = true;
      this.droneOrbitAngle += 2.8 * dt;

      this.droneMeshGroup.children.forEach((child, idx) => {
        const offsetAngle = this.droneOrbitAngle + (idx * Math.PI);
        child.position.set(
          playerPosition.x + Math.cos(offsetAngle) * 1.8,
          playerPosition.y + 1.6 + Math.sin(this.droneOrbitAngle * 2 + idx) * 0.2,
          playerPosition.z + Math.sin(offsetAngle) * 1.8
        );
      });

      // Drone auto-firing at nearest enemy
      this.droneFireTimer -= dt;
      if (this.droneFireTimer <= 0 && nearestEnemyPos) {
        const dist = playerPosition.distanceTo(nearestEnemyPos);
        if (dist < 20) {
          this.droneFireTimer = 0.55;
          const dronePos = this.droneMeshGroup.children[0].position.clone();
          const dir = nearestEnemyPos.clone().sub(dronePos).normalize();
          vfx.spawnProjectile(true, dronePos, dir, 45, 18, 0.25, 'drone_swarm');
          SoundEngine.get().playDroneLaser();
          if (onEnemyDamaged) onEnemyDamaged(18, nearestEnemyPos);
        }
      }
    } else {
      this.droneMeshGroup.visible = false;
    }
  }

  public canFire(): boolean {
    return !this.isReloading && this.shotCooldown <= 0 && this.ammoInClip > 0;
  }

  public fire(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    vfx: VFXSystem,
    evolved: boolean,
    damageMultiplier: number = 1.0,
    critChance: number = 0.1
  ): boolean {
    if (!this.canFire()) {
      if (this.ammoInClip <= 0 && !this.isReloading) {
        this.reload();
      }
      return false;
    }

    const def = this.getDef();
    this.ammoInClip--;
    this.shotCooldown = 1 / def.fireRate;

    // Critical roll
    const isCrit = Math.random() < critChance;
    const finalDamage = Math.round(def.damage * damageMultiplier * (isCrit ? 1.8 : 1.0) * (evolved ? 1.5 : 1.0));

    // Spawn Projectile / Attack
    if (this.currentWeaponId === 'pulse_rifle') {
      vfx.spawnProjectile(
        true,
        origin,
        direction,
        def.projectileSpeed,
        finalDamage,
        0.25,
        this.currentWeaponId
      );
      SoundEngine.get().playPulseRifleShot(evolved);
      vfx.triggerScreenShake(0.08);
    } else if (this.currentWeaponId === 'arc_blades') {
      // Forward conical lightning slash
      vfx.spawnProjectile(
        true,
        origin,
        direction,
        def.projectileSpeed,
        finalDamage,
        0.8,
        this.currentWeaponId
      );
      SoundEngine.get().playArcBladeSlash(evolved);
      vfx.triggerScreenShake(0.12);
    } else if (this.currentWeaponId === 'void_cannon') {
      vfx.spawnProjectile(
        true,
        origin,
        direction,
        def.projectileSpeed,
        finalDamage,
        0.6,
        this.currentWeaponId
      );
      SoundEngine.get().playVoidCannonShot(evolved);
      vfx.triggerScreenShake(0.28);
      vfx.triggerHitstop(0.04);
    }

    return true;
  }
}
