/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Enemy AI & Multi-Phase Boss (The Warden)
 */
import * as THREE from 'three';
import { ModelFactory } from '../graphics/ModelFactory';
import { VFXSystem } from '../graphics/VFXSystem';
import { SoundEngine } from '../audio/SoundEngine';

export type EnemyType = 'glitchling' | 'dasher' | 'turret' | 'brute';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  mesh: THREE.Group;
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  speed: number;
  attackCooldown: number;
  windupTimer: number;
  isWindup: boolean;
  radius: number;
  scoreValue: number;
  xpValue: number;
  damage: number;
  active: boolean;
}

export interface BossEntity {
  name: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  attackCooldown: number;
  activeAttack: 'idle' | 'stomp' | 'cannon' | 'sweep' | 'hyperbeam' | 'dead';
  attackTimer: number;
  active: boolean;
}

export class EnemyManager {
  private scene: THREE.Scene;
  public enemies: EnemyEntity[] = [];
  public warden: BossEntity | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  // ==========================================
  // SPAWN METHODS
  // ==========================================
  public spawnEnemy(type: EnemyType, pos: THREE.Vector3): EnemyEntity {
    let mesh: THREE.Group;
    let hp = 45;
    let speed = 4.2;
    let radius = 0.5;
    let scoreValue = 50;
    let xpValue = 20;
    let damage = 12;

    if (type === 'glitchling') {
      mesh = ModelFactory.createGlitchling();
      hp = 40;
      speed = 5.2;
      radius = 0.45;
      scoreValue = 50;
      xpValue = 15;
      damage = 10;
    } else if (type === 'dasher') {
      mesh = ModelFactory.createDasher();
      hp = 75;
      speed = 6.8;
      radius = 0.6;
      scoreValue = 100;
      xpValue = 35;
      damage = 22;
    } else if (type === 'turret') {
      mesh = ModelFactory.createPulseTurret();
      hp = 110;
      speed = 0; // stationary
      radius = 0.7;
      scoreValue = 120;
      xpValue = 40;
      damage = 16;
    } else {
      // brute
      mesh = ModelFactory.createCorruptedBrute();
      hp = 220;
      speed = 2.6;
      radius = 1.1;
      scoreValue = 250;
      xpValue = 80;
      damage = 34;
    }

    mesh.position.copy(pos);
    this.scene.add(mesh);

    const enemy: EnemyEntity = {
      id: Math.random().toString(),
      type,
      mesh,
      position: mesh.position,
      hp,
      maxHp: hp,
      speed,
      attackCooldown: Math.random() * 1.5,
      windupTimer: 0,
      isWindup: false,
      radius,
      scoreValue,
      xpValue,
      damage,
      active: true,
    };

    this.enemies.push(enemy);
    return enemy;
  }

  public spawnWarden(pos: THREE.Vector3): BossEntity {
    const mesh = ModelFactory.createTheWarden();
    mesh.position.copy(pos);
    this.scene.add(mesh);

    const warden: BossEntity = {
      name: 'THE WARDEN',
      mesh,
      position: mesh.position,
      hp: 1200,
      maxHp: 1200,
      phase: 1,
      attackCooldown: 2.0,
      activeAttack: 'idle',
      attackTimer: 0,
      active: true,
    };

    this.warden = warden;
    SoundEngine.get().playBossRoar();
    return warden;
  }

  // ==========================================
  // UPDATE LOOP
  // ==========================================
  public update(
    dt: number,
    playerPosition: THREE.Vector3,
    isTimeCollapsed: boolean,
    vfx: VFXSystem,
    onPlayerDamage: (damage: number) => void,
    onEnemyKilled: (enemy: EnemyEntity) => void,
    onBossDefeated: () => void
  ): void {
    const timeScale = isTimeCollapsed ? 0.3 : 1.0;
    const safeDt = Math.min(dt, 0.05) * timeScale;

    // 1. Update Regular Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.active) continue;

      const distToPlayer = e.position.distanceTo(playerPosition);
      const dirToPlayer = playerPosition.clone().sub(e.position).normalize();

      // Look at player
      if (e.speed > 0) {
        const angle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        e.mesh.rotation.y = THREE.MathUtils.damp(e.mesh.rotation.y, angle, 10, safeDt);
      }

      if (e.attackCooldown > 0) e.attackCooldown -= safeDt;

      // Behavior per type
      if (e.type === 'glitchling') {
        // Swarm and scuttle
        if (distToPlayer > 1.8) {
          e.position.addScaledVector(dirToPlayer, e.speed * safeDt);
        } else if (e.attackCooldown <= 0) {
          // Leap bite
          e.attackCooldown = 1.6;
          onPlayerDamage(e.damage);
          vfx.spawnImpactBurst(e.position, 0xff0044, 8);
        }

        // Animate insect legs
        for (let j = 0; j < 4; j++) {
          const leg = e.mesh.getObjectByName(`leg_${j}`);
          if (leg) {
            leg.rotation.y = Math.sin(Date.now() * 0.015 + j) * 0.4;
          }
        }
      } else if (e.type === 'dasher') {
        // Skirmish & rapid charge
        if (e.isWindup) {
          e.windupTimer -= safeDt;
          if (e.windupTimer <= 0) {
            // High speed dash strike!
            e.isWindup = false;
            e.attackCooldown = 3.2;
            e.position.addScaledVector(dirToPlayer, 12);
            if (e.position.distanceTo(playerPosition) < 2.5) {
              onPlayerDamage(e.damage);
            }
            vfx.spawnImpactBurst(e.position, 0xff00ff, 12);
          }
        } else if (distToPlayer > 8) {
          e.position.addScaledVector(dirToPlayer, e.speed * safeDt);
        } else if (e.attackCooldown <= 0) {
          // Windup charging dash
          e.isWindup = true;
          e.windupTimer = 0.8;
          vfx.spawnGroundTelegraph(e.position, 1.8, 0.8);
        }
      } else if (e.type === 'turret') {
        // Aim head at player
        const head = e.mesh.getObjectByName('turret_head');
        if (head) {
          const angle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
          head.rotation.y = THREE.MathUtils.damp(head.rotation.y, angle, 6, safeDt);
        }

        if (distToPlayer < 35 && e.attackCooldown <= 0) {
          e.attackCooldown = 2.4;
          // Fire 2 rapid laser projectiles
          const origin = e.position.clone().add(new THREE.Vector3(0, 0.7, 0));
          vfx.spawnProjectile(false, origin, dirToPlayer, 28, e.damage, 0.25, 'turret');
          SoundEngine.get().playPulseRifleShot(false);
        }
      } else if (e.type === 'brute') {
        // Slow march + ground slam
        if (distToPlayer > 3.2) {
          e.position.addScaledVector(dirToPlayer, e.speed * safeDt);
        } else if (e.attackCooldown <= 0) {
          e.attackCooldown = 3.4;
          vfx.spawnGroundTelegraph(e.position, 4.5, 0.9);
          // Telegraphed hammer smash
          setTimeout(() => {
            if (!e.active) return;
            vfx.spawnExplosion(e.position, 0xff5500);
            if (e.position.distanceTo(playerPosition) < 5.0) {
              onPlayerDamage(e.damage);
            }
          }, 900);
        }
      }

      // Keep grounded
      e.position.y = 0;
    }

    // 2. Update Boss: THE WARDEN
    if (this.warden && this.warden.active) {
      this.updateWarden(safeDt, playerPosition, vfx, onPlayerDamage, onBossDefeated);
    }
  }

  private updateWarden(
    dt: number,
    playerPos: THREE.Vector3,
    vfx: VFXSystem,
    onPlayerDamage: (dmg: number) => void,
    onBossDefeated: () => void
  ): void {
    const w = this.warden!;
    const distToPlayer = w.position.distanceTo(playerPos);
    const dirToPlayer = playerPos.clone().sub(w.position).normalize();

    // Rotate toward player
    const angle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
    w.mesh.rotation.y = THREE.MathUtils.damp(w.mesh.rotation.y, angle, 3.5, dt);

    // Phase Transitions
    const hpPercent = w.hp / w.maxHp;
    if (hpPercent <= 0.3 && w.phase < 3) {
      w.phase = 3;
      SoundEngine.get().playBossRoar();
      vfx.spawnExplosion(w.position, 0xff0044);
      // Spawn swarming minions
      this.spawnEnemy('glitchling', w.position.clone().add(new THREE.Vector3(-4, 0, 4)));
      this.spawnEnemy('glitchling', w.position.clone().add(new THREE.Vector3(4, 0, 4)));
    } else if (hpPercent <= 0.65 && w.phase < 2) {
      w.phase = 2;
      SoundEngine.get().playBossRoar();
      vfx.spawnExplosion(w.position, 0xff8800);
    }

    // Boss Attack State Machine
    if (w.attackCooldown > 0) {
      w.attackCooldown -= dt;
    } else {
      // Pick attack
      const roll = Math.random();
      if (w.phase === 3 && roll < 0.4) {
        // Hyper-beam sweep
        w.activeAttack = 'hyperbeam';
        w.attackTimer = 2.5;
        w.attackCooldown = 4.0;
        SoundEngine.get().playRealityFracture();
      } else if (roll < 0.6) {
        // Particle Cannons
        w.activeAttack = 'cannon';
        w.attackTimer = 1.4;
        w.attackCooldown = 3.2;
      } else {
        // Stomp / Mortar
        w.activeAttack = 'stomp';
        w.attackTimer = 1.0;
        w.attackCooldown = 3.5;
        vfx.spawnGroundTelegraph(playerPos, 5.0, 1.2);
      }
    }

    // Execute active attack
    if (w.activeAttack === 'cannon') {
      w.attackTimer -= dt;
      if (Math.random() < 0.25) {
        const cannonPos = w.position.clone().add(new THREE.Vector3(0, 3.2, 0));
        vfx.spawnProjectile(false, cannonPos, dirToPlayer, 34, 18, 0.4, 'boss_cannon');
        SoundEngine.get().playPulseRifleShot(true);
      }
      if (w.attackTimer <= 0) w.activeAttack = 'idle';
    } else if (w.activeAttack === 'stomp') {
      w.attackTimer -= dt;
      if (w.attackTimer <= 0) {
        w.activeAttack = 'idle';
        vfx.spawnExplosion(playerPos, 0xff0033);
        if (w.position.distanceTo(playerPos) < 6.5) {
          onPlayerDamage(35);
        }
      }
    } else if (w.activeAttack === 'hyperbeam') {
      w.attackTimer -= dt;
      vfx.spawnImpactBurst(playerPos, 0xff0044, 4);
      if (distToPlayer < 24 && Math.random() < 0.3) {
        onPlayerDamage(12);
      }
      if (w.attackTimer <= 0) w.activeAttack = 'idle';
    }

    // Slow stalking advance
    if (distToPlayer > 10 && w.activeAttack === 'idle') {
      w.position.addScaledVector(dirToPlayer, (w.phase === 3 ? 3.5 : 2.2) * dt);
    }
  }

  // Damage handling for projectiles hitting enemies
  public damageEnemy(
    enemyId: string,
    amount: number,
    vfx: VFXSystem,
    onKilled: (enemy: EnemyEntity) => void
  ): boolean {
    const enemy = this.enemies.find((e) => e.id === enemyId);
    if (!enemy || !enemy.active) return false;

    enemy.hp -= amount;
    vfx.spawnImpactBurst(enemy.position.clone().add(new THREE.Vector3(0, 0.6, 0)), 0x00f3ff, 8);
    SoundEngine.get().playHit();

    if (enemy.hp <= 0) {
      enemy.active = false;
      this.scene.remove(enemy.mesh);
      vfx.spawnExplosion(enemy.position, 0xff3300);
      vfx.spawnXp(enemy.position, enemy.type === 'brute' ? 5 : 2);
      SoundEngine.get().playEnemyExplode();
      onKilled(enemy);
      return true;
    }
    return false;
  }

  public damageBoss(amount: number, vfx: VFXSystem, onBossDefeated: () => void): void {
    if (!this.warden || !this.warden.active) return;
    this.warden.hp -= amount;
    vfx.spawnImpactBurst(this.warden.position.clone().add(new THREE.Vector3(0, 2.5, 0)), 0xff0055, 12);
    SoundEngine.get().playHit();

    if (this.warden.hp <= 0) {
      this.warden.active = false;
      this.warden.hp = 0;
      vfx.spawnExplosion(this.warden.position, 0xff0033);
      vfx.spawnXp(this.warden.position, 12);
      SoundEngine.get().playEnemyExplode();
      this.scene.remove(this.warden.mesh);
      onBossDefeated();
    }
  }

  public getNearestEnemyPosition(playerPos: THREE.Vector3): THREE.Vector3 | null {
    let nearest: THREE.Vector3 | null = null;
    let minDist = Infinity;

    if (this.warden && this.warden.active) {
      const d = playerPos.distanceTo(this.warden.position);
      if (d < minDist) {
        minDist = d;
        nearest = this.warden.position;
      }
    }

    for (const e of this.enemies) {
      if (!e.active) continue;
      const d = playerPos.distanceTo(e.position);
      if (d < minDist) {
        minDist = d;
        nearest = e.position;
      }
    }

    return nearest;
  }

  public clearAll(): void {
    for (const e of this.enemies) {
      this.scene.remove(e.mesh);
    }
    this.enemies = [];
    if (this.warden) {
      this.scene.remove(this.warden.mesh);
      this.warden = null;
    }
  }
}
