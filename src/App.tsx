/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Master Game Application & Scene Orchestration
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { GameSaveData, GameScreen, GameSettings, UpgradeDef, UpgradeId, WeaponId } from './core/Types';
import { DEFAULT_SETTINGS, SaveManager } from './core/SaveManager';
import { SoundEngine } from './audio/SoundEngine';
import { EnvironmentBuilder, InteractiveProp, WallCollider } from './graphics/EnvironmentBuilder';
import { VFXSystem } from './graphics/VFXSystem';
import { Player } from './gameplay/Player';
import { EnemyManager } from './gameplay/Enemies';
import { MissionManager } from './gameplay/MissionManager';
import { getRandomUpgradeChoices } from './gameplay/Progression';

// UI Overlays
import { MainMenu } from './ui/MainMenu';
import { GameHUD } from './ui/GameHUD';
import { DialogueOverlay } from './ui/DialogueOverlay';
import { UpgradeModal } from './ui/UpgradeModal';
import { PauseModal } from './ui/PauseModal';
import { MissionResultsModal } from './ui/MissionResultsModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // React State for UI overlays (kept separate from high-frequency WebGL render loop)
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [saveData, setSaveData] = useState<GameSaveData>(SaveManager.load());
  const [settings, setSettings] = useState<GameSettings>(saveData.settings || DEFAULT_SETTINGS);

  // HUD sync states
  const [hudStats, setHudStats] = useState({
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
  });
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponId>('pulse_rifle');
  const [ammo, setAmmo] = useState(32);
  const [isReloading, setIsReloading] = useState(false);
  const [objectiveText, setObjectiveText] = useState('Explore Sector 09 Cryo-Bay');
  const [targetDistance, setTargetDistance] = useState<number | null>(null);
  const [bossHp, setBossHp] = useState<{ current: number; max: number; phase: number; name: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAiming, setIsAiming] = useState(false);

  // Modals
  const [dialogueData, setDialogueData] = useState<any>(null);
  const [upgradeChoices, setUpgradeChoices] = useState<UpgradeDef[] | null>(null);

  // Mutable Game References in Ref container
  const gameRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    player: Player;
    vfx: VFXSystem;
    enemyManager: EnemyManager;
    missionManager: MissionManager;
    colliders: WallCollider[];
    props: InteractiveProp[];
    isSoftwareGl: boolean;
    clock: THREE.Clock;
    frameId: number;
    screen: GameScreen;
    titleCameraAngle: number;
  } | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  // Update settings handler
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    SaveManager.save({ settings: updated });
    SoundEngine.get().setVolumes(updated.masterVolume, updated.musicVolume, updated.sfxVolume);
  };

  // Switch weapon
  const handleSelectWeapon = (id: WeaponId) => {
    if (!gameRef.current) return;
    const { player } = gameRef.current;
    player.weaponController.switchWeapon(id);
    player.refreshWeaponMesh();
    setActiveWeaponId(id);
    setAmmo(player.weaponController.ammoInClip);
  };

  // Start / Resume Campaign
  const handleStartGame = (isNew: boolean) => {
    if (!gameRef.current) return;
    const g = gameRef.current;

    SoundEngine.get().ensureContext();
    SoundEngine.get().startMusic('combat');

    if (isNew) {
      SaveManager.resetProgress();
      setSaveData(SaveManager.load());
      g.missionManager = new MissionManager();
      g.player.position.set(0, 0, -10);
      g.player.stats.hp = g.player.stats.maxHp;
      g.player.stats.shield = g.player.stats.maxShield;
      g.enemyManager.clearAll();

      // Spawn initial Glitchling enemies in Cryo Bay
      g.enemyManager.spawnEnemy('glitchling', new THREE.Vector3(-4, 0, -6));
      g.enemyManager.spawnEnemy('glitchling', new THREE.Vector3(4, 0, -6));
      g.enemyManager.spawnEnemy('glitchling', new THREE.Vector3(-2, 0, -2));
      g.enemyManager.spawnEnemy('glitchling', new THREE.Vector3(2, 0, -2));

      // Play Lyra's Awakening Comms
      setTimeout(() => {
        g.missionManager.startFirstDialogue(() => {
          showNotification('Eliminate the corrupted Glitchlings!');
        });
        setDialogueData(g.missionManager.activeDialogue);
      }, 600);
    }

    g.screen = 'PLAYING';
    setScreen('PLAYING');
  };

  // Select Upgrade on Level Up
  const handleSelectUpgrade = (upgrade: UpgradeDef) => {
    if (!gameRef.current) return;
    const { player } = gameRef.current;

    player.applyUpgrade(upgrade.id);
    SaveManager.save({
      playerLevel: player.stats.level,
      playerXp: player.stats.xp,
      upgrades: player.upgrades,
      evolutionsUnlocked: player.evolutions,
    });

    setUpgradeChoices(null);
    showNotification(`Upgrade Installed: ${upgrade.name}!`);
  };

  // Restart Checkpoint
  const handleRestartCheckpoint = () => {
    if (!gameRef.current) return;
    const g = gameRef.current;
    g.player.stats.hp = g.player.stats.maxHp;
    g.player.stats.shield = g.player.stats.maxShield;

    // Reset to start of current mission
    if (g.missionManager.mission.id === 'm4_warden') {
      g.player.position.set(0, 0, 92);
      if (!g.enemyManager.warden) {
        g.enemyManager.spawnWarden(new THREE.Vector3(0, 0, 125));
      } else {
        g.enemyManager.warden.hp = g.enemyManager.warden.maxHp;
      }
    } else {
      g.player.position.set(0, 0, -10);
    }

    g.screen = 'PLAYING';
    setScreen('PLAYING');
  };

  // Return to Menu
  const handleReturnToMenu = () => {
    if (!gameRef.current) return;
    gameRef.current.screen = 'MENU';
    setScreen('MENU');
    SoundEngine.get().startMusic('menu');
  };

  // ==========================================
  // INITIALIZE THREE.JS RUNTIME
  // ==========================================
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Renderer
    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 3. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a10);
    scene.fog = new THREE.FogExp2(0x070a10, 0.018);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 300);

    // Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xddeeff, 2.8);
    keyLight.position.set(20, 35, 15);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x00f0ff, 0x111622, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x0099ff, 1.5);
    rimLight.position.set(-20, 10, -20);
    scene.add(rimLight);

    // 4. Construct World & Entities
    const { colliders, props } = EnvironmentBuilder.buildSector09(scene);
    const vfx = new VFXSystem(scene);
    const player = new Player(scene, camera);
    const enemyManager = new EnemyManager(scene);
    const missionManager = new MissionManager();

    const clock = new THREE.Clock();

    gameRef.current = {
      renderer,
      scene,
      camera,
      player,
      vfx,
      enemyManager,
      missionManager,
      colliders,
      props,
      isSoftwareGl,
      clock,
      frameId: 0,
      screen: 'MENU',
      titleCameraAngle: 0,
    };

    // Pre-warm shaders
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ==========================================
    // INPUT LISTENERS
    // ==========================================
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      const g = gameRef.current;

      // Global Pause
      if (e.code === 'Escape') {
        if (g.screen === 'PLAYING') {
          g.screen = 'PAUSED';
          setScreen('PAUSED');
        } else if (g.screen === 'PAUSED') {
          g.screen = 'PLAYING';
          setScreen('PLAYING');
        }
        return;
      }

      // Title Screen Start via Enter / Space
      if (g.screen === 'MENU' && (e.code === 'Space' || e.code === 'Enter')) {
        handleStartGame(false);
        return;
      }

      if (g.screen !== 'PLAYING') return;

      g.player.onKeyDown(e.code);

      // Dash (Space)
      if (e.code === 'Space') {
        g.player.triggerDash(g.vfx);
      }

      // Time Collapse (C)
      if (e.code === 'KeyC') {
        if (g.player.triggerTimeCollapse()) {
          showNotification('TIME COLLAPSE: REALITY SLOWED 70%');
        }
      }

      // Reality Fracture (Q)
      if (e.code === 'KeyQ') {
        g.player.triggerRealityFracture(g.vfx, (center, radius, dmg) => {
          // Detonate all nearby enemies
          for (let i = g.enemyManager.enemies.length - 1; i >= 0; i--) {
            const enemy = g.enemyManager.enemies[i];
            if (enemy.active && enemy.position.distanceTo(center) < radius) {
              g.enemyManager.damageEnemy(enemy.id, dmg, g.vfx, (killed) => {
                g.missionManager.onEnemyKilled(killed.type, (msg) => showNotification(msg));
                g.player.addXp(killed.xpValue, () => {
                  const choices = getRandomUpgradeChoices(g.player.upgrades);
                  setUpgradeChoices(choices);
                });
              });
            }
          }
          if (g.enemyManager.warden && g.enemyManager.warden.active) {
            g.enemyManager.damageBoss(dmg, g.vfx, () => {
              handleBossDefeated();
            });
          }
        });
      }

      // Reload (R)
      if (e.code === 'KeyR') {
        g.player.weaponController.reload();
      }

      // Weapon Select (1-4)
      if (e.code === 'Digit1') handleSelectWeapon('pulse_rifle');
      if (e.code === 'Digit2') handleSelectWeapon('arc_blades');
      if (e.code === 'Digit3') handleSelectWeapon('void_cannon');
      if (e.code === 'Digit4') handleSelectWeapon('drone_swarm');

      // Interaction (E)
      if (e.code === 'KeyE') {
        // Check closest prop within range
        const pPos = g.player.position;
        for (const prop of g.props) {
          if (pPos.distanceTo(prop.position) < prop.radius) {
            g.missionManager.checkPropInteraction(
              prop,
              pPos,
              g.enemyManager,
              (msg) => showNotification(msg),
              (dialogue) => setDialogueData(dialogue)
            );
            break;
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameRef.current) {
        gameRef.current.player.onKeyUp(e.code);
      }
    };

    let lastClientX = 0;
    let lastClientY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (!gameRef.current || gameRef.current.screen !== 'PLAYING') return;
      if (e.button === 0) gameRef.current.player.mouseLeft = true;
      if (e.button === 2) {
        gameRef.current.player.mouseRight = true;
        gameRef.current.player.isAiming = true;
        setIsAiming(true);
      }

      // Automatically request pointer lock on click for full 360-degree mouse aiming
      if (
        mountRef.current &&
        document.pointerLockElement !== renderer.domElement &&
        renderer.domElement.requestPointerLock
      ) {
        try {
          renderer.domElement.requestPointerLock();
        } catch {
          // pointer lock fallback
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!gameRef.current) return;
      if (e.button === 0) gameRef.current.player.mouseLeft = false;
      if (e.button === 2) {
        gameRef.current.player.mouseRight = false;
        gameRef.current.player.isAiming = false;
        setIsAiming(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!gameRef.current || gameRef.current.screen !== 'PLAYING') return;

      let dx = e.movementX;
      let dy = e.movementY;

      // If pointer is not locked, calculate delta from previous mouse coordinates
      if (!document.pointerLockElement) {
        if (lastClientX !== 0 || lastClientY !== 0) {
          dx = e.clientX - lastClientX;
          dy = e.clientY - lastClientY;
        }
      }
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      if (dx !== undefined && dy !== undefined && (Math.abs(dx) > 0 || Math.abs(dy) > 0)) {
        gameRef.current.player.onMouseMove(dx, dy, settings.mouseSensitivity);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // suppress default right-click menu
    };

    const handleResize = () => {
      if (!mountRef.current || !gameRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      gameRef.current.camera.aspect = w / h;
      gameRef.current.camera.updateProjectionMatrix();
      gameRef.current.renderer.setSize(w, h);
    };

    const handleBlur = () => {
      if (gameRef.current) {
        gameRef.current.player.keys = {};
        gameRef.current.player.mouseLeft = false;
        gameRef.current.player.mouseRight = false;
        gameRef.current.player.isAiming = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);

    // ==========================================
    // BOSS DEFEATED CLIMAX HANDLER
    // ==========================================
    const handleBossDefeated = () => {
      showNotification('CRITICAL VICTORY: THE WARDEN DESTROYED!');
      SoundEngine.get().playLevelUp();

      // Advance to Mission 5
      setTimeout(() => {
        if (!gameRef.current) return;
        gameRef.current.missionManager.advanceToMission(4);
        showNotification('Directive: Proceed to Extraction Pad at North End.');
      }, 2000);
    };

    // ==========================================
    // ANIMATION & GAME LOOP (60 FPS Simulation)
    // ==========================================
    let lastUiSync = 0;

    const tick = () => {
      if (!gameRef.current) return;
      const g = gameRef.current;
      const rawDt = g.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      // Title Screen Pan
      if (g.screen === 'MENU') {
        g.titleCameraAngle += 0.25 * dt;
        g.camera.position.set(
          Math.sin(g.titleCameraAngle) * 6,
          2.2,
          Math.cos(g.titleCameraAngle) * 6 - 10
        );
        g.camera.lookAt(0, 1.2, -10);
        g.renderer.render(g.scene, g.camera);
        g.frameId = requestAnimationFrame(tick);
        return;
      }

      // Playing State
      if (g.screen === 'PLAYING') {
        const pPos = g.player.position;

        // Nearest threat
        const nearestEnemy = g.enemyManager.getNearestEnemyPosition(pPos);

        // Update Player
        g.player.update(dt, g.colliders, g.vfx, nearestEnemy);

        // Check if player died
        if (g.player.stats.hp <= 0) {
          g.screen = 'GAMEOVER';
          setScreen('GAMEOVER');
        }

        // Update Enemies & Boss
        g.enemyManager.update(
          dt,
          pPos,
          g.player.stats.isTimeCollapsed,
          g.vfx,
          (dmg) => g.player.takeDamage(dmg, g.vfx),
          (killed) => {
            const data = SaveManager.load();
            SaveManager.save({ enemiesDefeated: data.enemiesDefeated + 1 });
            g.missionManager.onEnemyKilled(killed.type, (msg) => showNotification(msg));
            g.player.addXp(killed.xpValue, () => {
              const choices = getRandomUpgradeChoices(g.player.upgrades);
              setUpgradeChoices(choices);
            });
          },
          () => handleBossDefeated()
        );

        // Update Projectiles & VFX
        const magnetRadius = 5.0 + g.player.upgrades.data_magnet * 5.0;
        const { projectiles, shakeOffset } = g.vfx.update(dt, pPos, magnetRadius, (xpVal) => {
          g.player.addXp(xpVal, () => {
            const choices = getRandomUpgradeChoices(g.player.upgrades);
            setUpgradeChoices(choices);
          });
        });

        // Apply shake offset to camera
        g.camera.position.add(shakeOffset);

        // Check Projectile Collisions
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          const bSphere = new THREE.Sphere(p.mesh.position, p.radius);

          if (p.isPlayer) {
            // Check Boss
            if (g.enemyManager.warden && g.enemyManager.warden.active) {
              const wSphere = new THREE.Sphere(
                g.enemyManager.warden.position.clone().add(new THREE.Vector3(0, 2.5, 0)),
                2.2
              );
              if (bSphere.intersectsSphere(wSphere)) {
                g.enemyManager.damageBoss(p.damage, g.vfx, () => handleBossDefeated());
                g.vfx.removeProjectile(i);
                continue;
              }
            }

            // Check Enemies
            let hit = false;
            for (const enemy of g.enemyManager.enemies) {
              if (!enemy.active) continue;
              const eSphere = new THREE.Sphere(
                enemy.position.clone().add(new THREE.Vector3(0, 0.6, 0)),
                enemy.radius
              );
              if (bSphere.intersectsSphere(eSphere)) {
                g.enemyManager.damageEnemy(enemy.id, p.damage, g.vfx, (killed) => {
                  const data = SaveManager.load();
                  SaveManager.save({ enemiesDefeated: data.enemiesDefeated + 1 });
                  g.missionManager.onEnemyKilled(killed.type, (msg) => showNotification(msg));
                  g.player.addXp(killed.xpValue, () => {
                    const choices = getRandomUpgradeChoices(g.player.upgrades);
                    setUpgradeChoices(choices);
                  });
                });
                hit = true;
                break;
              }
            }
            if (hit) {
              g.vfx.removeProjectile(i);
              continue;
            }
          } else {
            // Enemy projectile hits player
            const pSphere = new THREE.Sphere(pPos.clone().add(new THREE.Vector3(0, 1.0, 0)), 0.6);
            if (bSphere.intersectsSphere(pSphere)) {
              g.player.takeDamage(p.damage, g.vfx);
              g.vfx.removeProjectile(i);
              continue;
            }
          }
        }

        // Check Mission 4 trigger: If player enters boss arena
        if (pPos.z > 95 && !g.missionManager.bossEncounterStarted) {
          g.missionManager.bossEncounterStarted = true;
          g.missionManager.advanceToMission(3);
          g.enemyManager.spawnWarden(new THREE.Vector3(0, 0, 125));
          SoundEngine.get().startMusic('boss');
          showNotification('WARNING: SECTOR 09 CHIEF WARDEN ENGAGED!');
        }

        // Throttle UI synchronization to 15 Hz for peak performance
        const now = performance.now();
        if (now - lastUiSync > 66) {
          lastUiSync = now;
          setHudStats({ ...g.player.stats });
          setAmmo(g.player.weaponController.ammoInClip);
          setIsReloading(g.player.weaponController.isReloading);
          setObjectiveText(g.missionManager.getStepProgressText());

          const target = g.missionManager.getActiveTarget();
          if (target) {
            setTargetDistance(pPos.distanceTo(new THREE.Vector3(target.x, target.y, target.z)));
          } else {
            setTargetDistance(null);
          }

          if (g.enemyManager.warden && g.enemyManager.warden.active) {
            setBossHp({
              current: g.enemyManager.warden.hp,
              max: g.enemyManager.warden.maxHp,
              phase: g.enemyManager.warden.phase,
              name: g.enemyManager.warden.name,
            });
          } else {
            setBossHp(null);
          }
        }
      }

      // Render Scene
      g.renderer.render(g.scene, g.camera);
      g.frameId = requestAnimationFrame(tick);
    };

    gameRef.current.frameId = requestAnimationFrame(tick);

    // Start title music on first click
    const startAudioPrompt = () => {
      SoundEngine.get().ensureContext();
      SoundEngine.get().startMusic('menu');
      window.removeEventListener('click', startAudioPrompt);
    };
    window.addEventListener('click', startAudioPrompt);

    return () => {
      cancelAnimationFrame(gameRef.current?.frameId || 0);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('click', startAudioPrompt);

      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [settings.mouseSensitivity, showNotification]);

  // Handle Dialogue Decision
  const handleDecisionMade = (choice: any) => {
    if (!gameRef.current) return;
    gameRef.current.missionManager.recordDecision(choice, (msg) => showNotification(msg));
  };

  // Complete Dialogue
  const handleDialogueComplete = () => {
    setDialogueData(null);
    if (!gameRef.current) return;
    const mId = gameRef.current.missionManager.mission.id;
    if (mId === 'm5_last_signal') {
      // Victory / Chapter Complete!
      gameRef.current.screen = 'VICTORY';
      setScreen('VICTORY');
      setSaveData(SaveManager.load());
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-mono">
      {/* 3D WebGL Canvas Isolated Mount */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* TITLE SCREEN / MAIN MENU */}
      {screen === 'MENU' && (
        <MainMenu
          hasSave={SaveManager.hasExistingSave()}
          saveData={saveData}
          onStartGame={handleStartGame}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* IN-GAME HUD (When Playing) */}
      {screen === 'PLAYING' && (
        <GameHUD
          stats={hudStats}
          currentWeapon={
            gameRef.current
              ? gameRef.current.player.weaponController.getDef()
              : ({} as any)
          }
          unlockedWeapons={saveData.unlockedWeapons}
          onSelectWeapon={handleSelectWeapon}
          ammo={ammo}
          isReloading={isReloading}
          objectiveText={objectiveText}
          targetDistance={targetDistance}
          bossHp={bossHp}
          notification={notification}
          isAiming={isAiming}
          onOpenPause={() => {
            if (gameRef.current) {
              gameRef.current.screen = 'PAUSED';
              setScreen('PAUSED');
            }
          }}
        />
      )}

      {/* DIALOGUE & COMMS OVERLAY */}
      {dialogueData && (
        <DialogueOverlay
          dialogue={dialogueData}
          onClose={handleDialogueComplete}
          onDecisionMade={handleDecisionMade}
        />
      )}

      {/* TACTICAL UPGRADE MODAL */}
      {upgradeChoices && (
        <UpgradeModal
          level={hudStats.level}
          choices={upgradeChoices}
          onSelect={handleSelectUpgrade}
        />
      )}

      {/* PAUSE MODAL */}
      {screen === 'PAUSED' && gameRef.current && (
        <PauseModal
          mission={gameRef.current.missionManager.mission}
          onResume={() => {
            if (gameRef.current) {
              gameRef.current.screen = 'PLAYING';
              setScreen('PLAYING');
            }
          }}
          onRestartCheckpoint={handleRestartCheckpoint}
          onReturnToMenu={handleReturnToMenu}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {/* VICTORY & GAME OVER SCREENS */}
      {(screen === 'VICTORY' || screen === 'GAMEOVER') && (
        <MissionResultsModal
          type={screen}
          saveData={saveData}
          onRestart={handleRestartCheckpoint}
          onReturnToMenu={handleReturnToMenu}
        />
      )}
    </div>
  );
}
