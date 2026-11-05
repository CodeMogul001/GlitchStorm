/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Procedural Model Factory
 * Creates composite 3-12 part procedural models for ZERO, enemies, boss, and props.
 * Strictly adheres to Three.js composite group guidelines and zero 404 dependencies.
 */
import * as THREE from 'three';
import { MaterialsManager } from './Materials';

export interface RiggedCharacter {
  group: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  coreMesh: THREE.Mesh;
  weaponMount: THREE.Group;
  cape: THREE.Group;
  updateAnimation: (
    state: 'idle' | 'walk' | 'run' | 'sprint' | 'dash' | 'aim' | 'die',
    time: number,
    isAiming: boolean,
    dt: number,
    aimPitch?: number
  ) => void;
}

export class ModelFactory {
  // ==========================================
  // ZERO: THE SUPERHERO PROTAGONIST
  // ==========================================
  public static createZero(): RiggedCharacter {
    const mats = MaterialsManager.get();
    const group = new THREE.Group();
    group.name = 'ZERO_SUPERHERO';

    // Root is at bottom center (y=0)
    // 1. Torso & Upper Body (Muscular superhero build)
    const torso = new THREE.Group();
    torso.position.set(0, 1.05, 0);

    // Muscular Chest (Pectorals)
    const chestGeo = new THREE.BoxGeometry(0.54, 0.44, 0.32);
    const chest = new THREE.Mesh(chestGeo, mats.heroSuitMat);
    chest.position.set(0, 0.2, 0);
    chest.castShadow = true;
    torso.add(chest);

    // Heroic Cobalt Shoulder Armor / Epaulets
    [-0.28, 0.28].forEach((x) => {
      const epauletGeo = new THREE.BoxGeometry(0.18, 0.12, 0.3);
      const epaulet = new THREE.Mesh(epauletGeo, mats.heroAccentMat);
      epaulet.position.set(x, 0.38, 0);
      torso.add(epaulet);

      // Gold clasp
      const claspGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8);
      const clasp = new THREE.Mesh(claspGeo, mats.heroGoldMat);
      clasp.position.set(x, 0.44, 0.08);
      torso.add(clasp);
    });

    // Superhero Chest Insignia / Emblem
    const crestGeo = new THREE.OctahedronGeometry(0.14, 0);
    const crest = new THREE.Mesh(crestGeo, mats.heroGoldMat);
    crest.scale.set(1.4, 1.0, 0.25);
    crest.position.set(0, 0.22, 0.18);
    torso.add(crest);

    // Center Glowing Energy Core in Emblem
    const coreGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, mats.playerCoreCyanMat);
    coreMesh.position.set(0, 0.22, 0.21);
    torso.add(coreMesh);

    // Athletic Tapered Abdomen
    const absGeo = new THREE.CylinderGeometry(0.2, 0.17, 0.26, 8);
    const abs = new THREE.Mesh(absGeo, mats.heroAccentMat);
    abs.position.set(0, -0.1, 0);
    torso.add(abs);

    // Superhero Utility Belt with Gold Buckle & Power Capsules
    const beltGeo = new THREE.BoxGeometry(0.42, 0.1, 0.3);
    const belt = new THREE.Mesh(beltGeo, mats.heroSuitMat);
    belt.position.set(0, -0.24, 0);
    torso.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.12, 0.11, 0.34);
    const buckle = new THREE.Mesh(buckleGeo, mats.heroGoldMat);
    buckle.position.set(0, -0.24, 0.02);
    torso.add(buckle);

    // Gold belt pouches
    [-0.18, 0.18].forEach((x) => {
      const pouchGeo = new THREE.BoxGeometry(0.07, 0.08, 0.08);
      const pouch = new THREE.Mesh(pouchGeo, mats.heroGoldMat);
      pouch.position.set(x, -0.24, 0.14);
      torso.add(pouch);
    });

    // Pelvis
    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.18, 0.26);
    const pelvis = new THREE.Mesh(pelvisGeo, mats.heroSuitMat);
    pelvis.position.set(0, -0.34, 0);
    torso.add(pelvis);

    // 2. Flowing Superhero Cape
    const cape = new THREE.Group();
    cape.position.set(0, 0.36, -0.17);

    // 3 articulated cape segments for natural flowing physics
    const capeSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.02), mats.heroCapeMat);
    capeSeg1.position.set(0, -0.22, 0);
    cape.add(capeSeg1);

    const capeSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.02), mats.heroCapeMat);
    capeSeg2.position.set(0, -0.45, -0.02);
    capeSeg1.add(capeSeg2);

    const capeSeg3 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.02), mats.heroCapeMat);
    capeSeg3.position.set(0, -0.48, -0.02);
    capeSeg2.add(capeSeg3);

    torso.add(cape);

    // 3. Superhero Head & Cowl Mask
    const head = new THREE.Group();
    head.position.set(0, 0.55, 0);

    // Heroic Cowl
    const cowlGeo = new THREE.SphereGeometry(0.17, 16, 16);
    const cowl = new THREE.Mesh(cowlGeo, mats.heroSuitMat);
    head.add(cowl);

    // Superhero Cowl Horns / Ear Fins
    [-0.14, 0.14].forEach((x) => {
      const earGeo = new THREE.ConeGeometry(0.04, 0.16, 4);
      const ear = new THREE.Mesh(earGeo, mats.heroSuitMat);
      ear.position.set(x, 0.18, -0.02);
      ear.rotation.z = x > 0 ? -0.25 : 0.25;
      ear.rotation.x = -0.2;
      head.add(ear);
    });

    // Exposed Hero Jaw / Chin
    const jawGeo = new THREE.BoxGeometry(0.14, 0.12, 0.14);
    const jaw = new THREE.Mesh(jawGeo, mats.heroSkinMat);
    jaw.position.set(0, -0.08, 0.08);
    head.add(jaw);

    // Piercing Glowing White/Cyan Superhero Eye Slits
    [-0.055, 0.055].forEach((x) => {
      const eyeGeo = new THREE.BoxGeometry(0.045, 0.022, 0.03);
      const eye = new THREE.Mesh(eyeGeo, mats.heroEyesMat);
      eye.position.set(x, 0.03, 0.16);
      eye.rotation.z = x > 0 ? -0.15 : 0.15;
      head.add(eye);
    });

    torso.add(head);

    // 4. Left Arm (Muscular Superhero Arm + Gauntlet)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 0.35, 0);

    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), mats.heroAccentMat);
    leftArm.add(lShoulder);

    const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.28, 8), mats.heroSuitMat);
    lBicep.position.set(0, -0.16, 0);
    leftArm.add(lBicep);

    // Superhero Gauntlet with Gold Trim
    const lGauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.13), mats.heroAccentMat);
    lGauntlet.position.set(0, -0.38, 0.03);
    leftArm.add(lGauntlet);

    const lGauntletFin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.08), mats.heroGoldMat);
    lGauntletFin.position.set(-0.07, -0.38, 0);
    leftArm.add(lGauntletFin);

    torso.add(leftArm);

    // 5. Right Arm & Weapon Mount (Gun Arm)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 0.35, 0);

    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), mats.heroAccentMat);
    rightArm.add(rShoulder);

    const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.28, 8), mats.heroSuitMat);
    rBicep.position.set(0, -0.16, 0);
    rightArm.add(rBicep);

    const rGauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.13), mats.heroAccentMat);
    rGauntlet.position.set(0, -0.38, 0.03);
    rightArm.add(rGauntlet);

    const rGauntletFin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.08), mats.heroGoldMat);
    rGauntletFin.position.set(0.07, -0.38, 0);
    rightArm.add(rGauntletFin);

    const weaponMount = new THREE.Group();
    weaponMount.position.set(0, -0.48, 0.12);
    rightArm.add(weaponMount);

    torso.add(rightArm);

    // 6. Left Leg (Athletic Superhero Leg + Boot)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.16, 0.65, 0);

    const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.38, 8), mats.heroSuitMat);
    lThigh.position.set(0, -0.18, 0);
    leftLeg.add(lThigh);

    const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mats.heroAccentMat);
    lKnee.position.set(0, -0.38, 0.02);
    leftLeg.add(lKnee);

    const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 8), mats.heroSuitMat);
    lShin.position.set(0, -0.52, 0);
    leftLeg.add(lShin);

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.24), mats.heroAccentMat);
    lBoot.position.set(0, -0.66, 0.04);
    leftLeg.add(lBoot);

    const lBootTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.25), mats.heroGoldMat);
    lBootTrim.position.set(0, -0.59, 0.04);
    leftLeg.add(lBootTrim);

    group.add(leftLeg);

    // 7. Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.16, 0.65, 0);

    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.38, 8), mats.heroSuitMat);
    rThigh.position.set(0, -0.18, 0);
    rightLeg.add(rThigh);

    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mats.heroAccentMat);
    rKnee.position.set(0, -0.38, 0.02);
    rightLeg.add(rKnee);

    const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 8), mats.heroSuitMat);
    rShin.position.set(0, -0.52, 0);
    rightLeg.add(rShin);

    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.24), mats.heroAccentMat);
    rBoot.position.set(0, -0.66, 0.04);
    rightLeg.add(rBoot);

    const rBootTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.25), mats.heroGoldMat);
    rBootTrim.position.set(0, -0.59, 0.04);
    rightLeg.add(rBootTrim);

    group.add(rightLeg);

    group.add(torso);

    // ==========================================
    // PROCEDURAL SUPERHERO ANIMATION & VERTICAL AIM
    // ==========================================
    const updateAnimation = (
      state: 'idle' | 'walk' | 'run' | 'sprint' | 'dash' | 'aim' | 'die',
      time: number,
      isAiming: boolean,
      _dt: number,
      aimPitch: number = 0
    ) => {
      if (state === 'die') {
        torso.position.y = THREE.MathUtils.damp(torso.position.y, 0.3, 8, _dt);
        torso.rotation.x = THREE.MathUtils.damp(torso.rotation.x, -Math.PI / 2.2, 8, _dt);
        return;
      }

      // Dynamic Cape Flow Physics
      const capeWave = Math.sin(time * 5) * 0.15;
      const moveSpeedFactor = state === 'sprint' ? 0.9 : state === 'run' ? 0.6 : state === 'walk' ? 0.3 : 0.08;
      cape.rotation.x = THREE.MathUtils.damp(cape.rotation.x, 0.2 + moveSpeedFactor + capeWave, 10, _dt);
      capeSeg1.rotation.x = THREE.MathUtils.damp(capeSeg1.rotation.x, moveSpeedFactor * 0.5 + capeWave * 0.5, 10, _dt);
      capeSeg2.rotation.x = THREE.MathUtils.damp(capeSeg2.rotation.x, moveSpeedFactor * 0.8 + capeWave * 0.8, 10, _dt);

      if (state === 'idle') {
        // Heroic breathing
        const breath = Math.sin(time * 2.2) * 0.02;
        torso.position.y = 1.05 + breath;
        chest.scale.set(1 + breath * 0.5, 1 + breath * 0.5, 1 + breath * 0.5);

        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 10, _dt);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 10, _dt);

        if (!isAiming) {
          leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, Math.sin(time * 2) * 0.05, 8, _dt);
          rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.3, 8, _dt);
          rightArm.rotation.y = THREE.MathUtils.damp(rightArm.rotation.y, -0.2, 8, _dt);
        }
      } else if (state === 'walk' || state === 'run' || state === 'sprint') {
        const speedMultiplier = state === 'sprint' ? 14 : state === 'run' ? 10 : 6;
        const swing = Math.sin(time * speedMultiplier);
        const legAngle = swing * (state === 'sprint' ? 0.75 : 0.5);

        leftLeg.rotation.x = legAngle;
        rightLeg.rotation.x = -legAngle;

        torso.position.y = 1.05 + Math.abs(Math.sin(time * speedMultiplier * 2)) * 0.06;
        torso.rotation.y = THREE.MathUtils.damp(torso.rotation.y, swing * 0.08, 12, _dt);

        if (!isAiming) {
          leftArm.rotation.x = -legAngle * 0.9;
          rightArm.rotation.x = legAngle * 0.9;
        }
      } else if (state === 'dash') {
        torso.position.y = 0.9;
        torso.rotation.x = 0.35;
        leftLeg.rotation.x = -0.6;
        rightLeg.rotation.x = 0.6;
      }

      // Vertical Aiming: Hero pitches spine, head, and weapon arm to point anywhere!
      if (isAiming) {
        // Upper spine pitches smoothly up/down with camera pitch
        torso.rotation.x = THREE.MathUtils.damp(torso.rotation.x, -aimPitch * 0.5, 15, _dt);
        head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -aimPitch * 0.4, 15, _dt);

        // Right gun arm points directly in 3D aim direction
        rightArm.rotation.x = THREE.MathUtils.damp(
          rightArm.rotation.x,
          -Math.PI / 2.05 + aimPitch,
          18,
          _dt
        );
        rightArm.rotation.y = THREE.MathUtils.damp(rightArm.rotation.y, -0.2, 18, _dt);

        // Left support arm aligns with rifle or combat stance
        leftArm.rotation.x = THREE.MathUtils.damp(
          leftArm.rotation.x,
          -Math.PI / 2.2 + aimPitch * 0.7,
          18,
          _dt
        );
        leftArm.rotation.y = THREE.MathUtils.damp(leftArm.rotation.y, 0.45, 18, _dt);
      } else {
        head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -aimPitch * 0.25, 12, _dt);
        if (state !== 'dash') {
          torso.rotation.x = THREE.MathUtils.damp(torso.rotation.x, 0, 10, _dt);
        }
      }
    };

    return {
      group,
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      coreMesh,
      weaponMount,
      cape,
      updateAnimation,
    };
  }

  // ==========================================
  // WEAPON 3D MODELS
  // ==========================================
  public static createWeaponModel(id: string): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();

    if (id === 'pulse_rifle' || id === 'plasma_storm') {
      const isEvolved = id === 'plasma_storm';
      // Rifle receiver
      const bodyGeo = new THREE.BoxGeometry(0.1, 0.14, 0.55);
      const body = new THREE.Mesh(bodyGeo, mats.catwalkMetalMat);
      body.position.set(0, 0, 0.15);
      g.add(body);

      // Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8);
      const barrel = new THREE.Mesh(barrelGeo, mats.playerArmorMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.03, 0.52);
      g.add(barrel);

      // Energy core / magazine
      const magGeo = new THREE.BoxGeometry(0.06, 0.16, 0.1);
      const mag = new THREE.Mesh(magGeo, isEvolved ? mats.playerCoreGoldMat : mats.playerCoreCyanMat);
      mag.position.set(0, -0.12, 0.12);
      g.add(mag);

      // Optic scope
      const scopeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.18);
      const scope = new THREE.Mesh(scopeGeo, mats.playerVisorMat);
      scope.position.set(0, 0.12, 0.15);
      g.add(scope);
    } else if (id === 'arc_blades' || id === 'thunder_reaper') {
      // Twin forearm plasma blades
      const hiltGeo = new THREE.BoxGeometry(0.08, 0.08, 0.2);
      const hilt = new THREE.Mesh(hiltGeo, mats.playerArmorMat);
      g.add(hilt);

      const bladeGeo = new THREE.ConeGeometry(0.06, 0.65, 4);
      const blade = new THREE.Mesh(bladeGeo, mats.dasherBladeMat);
      blade.rotation.x = -Math.PI / 2;
      blade.position.set(0, 0, 0.42);
      g.add(blade);
    } else if (id === 'void_cannon' || id === 'singularity') {
      // Heavy shoulder cannon
      const bodyGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.7, 10);
      const body = new THREE.Mesh(bodyGeo, mats.catwalkMetalMat);
      body.rotation.x = Math.PI / 2;
      body.position.set(0, 0, 0.2);
      g.add(body);

      const coreOrbGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const coreOrb = new THREE.Mesh(coreOrbGeo, mats.dasherBladeMat);
      coreOrb.position.set(0, 0, 0.1);
      g.add(coreOrb);

      const emitterGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 16);
      const emitter = new THREE.Mesh(emitterGeo, mats.playerCoreCyanMat);
      emitter.position.set(0, 0, 0.55);
      g.add(emitter);
    } else {
      // Drone swarm transmitter / gauntlet orb
      const orbGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const orb = new THREE.Mesh(orbGeo, mats.playerCoreCyanMat);
      g.add(orb);
    }

    return g;
  }

  // ==========================================
  // ENEMIES
  // ==========================================
  public static createGlitchling(): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'GLITCHLING';

    // Body chassis
    const bodyGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const body = new THREE.Mesh(bodyGeo, mats.glitchlingBodyMat);
    body.position.set(0, 0.45, 0);
    body.castShadow = true;
    g.add(body);

    // Eye visor (glowing red)
    const eyeGeo = new THREE.BoxGeometry(0.24, 0.08, 0.12);
    const eye = new THREE.Mesh(eyeGeo, mats.glitchlingEyeMat);
    eye.position.set(0, 0.48, 0.32);
    g.add(eye);

    // 4 Articulated insectoid legs
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const legRoot = new THREE.Group();
      legRoot.position.set(Math.cos(angle) * 0.25, 0.4, Math.sin(angle) * 0.25);

      const upperLegGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.4, 6);
      const upper = new THREE.Mesh(upperLegGeo, mats.catwalkMetalMat);
      upper.position.set(Math.cos(angle) * 0.18, 0.1, Math.sin(angle) * 0.18);
      upper.rotation.z = Math.cos(angle) * 0.6;
      upper.rotation.x = Math.sin(angle) * 0.6;
      legRoot.add(upper);

      const lowerLegGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.45, 6);
      const lower = new THREE.Mesh(lowerLegGeo, mats.playerJointMat);
      lower.position.set(Math.cos(angle) * 0.32, -0.2, Math.sin(angle) * 0.32);
      legRoot.add(lower);

      legRoot.name = `leg_${i}`;
      g.add(legRoot);
    }

    return g;
  }

  public static createDasher(): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'DASHER';

    // Aerodynamic chassis
    const bodyGeo = new THREE.ConeGeometry(0.35, 1.1, 5);
    const body = new THREE.Mesh(bodyGeo, mats.dasherBodyMat);
    body.rotation.x = -Math.PI / 2.2;
    body.position.set(0, 0.7, 0);
    body.castShadow = true;
    g.add(body);

    // Forward energy horn / blade
    const bladeGeo = new THREE.BoxGeometry(0.05, 0.15, 0.7);
    const blade = new THREE.Mesh(bladeGeo, mats.dasherBladeMat);
    blade.position.set(0, 0.72, 0.6);
    g.add(blade);

    // Side thruster pods
    [-0.35, 0.35].forEach((x) => {
      const podGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.5, 8);
      const pod = new THREE.Mesh(podGeo, mats.playerArmorMat);
      pod.rotation.x = Math.PI / 2;
      pod.position.set(x, 0.7, -0.2);
      g.add(pod);
    });

    return g;
  }

  public static createPulseTurret(): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'PULSE_TURRET';

    // Heavy tripod base
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.3, 8);
    const base = new THREE.Mesh(baseGeo, mats.catwalkMetalMat);
    base.position.set(0, 0.15, 0);
    g.add(base);

    // Swivel head
    const head = new THREE.Group();
    head.name = 'turret_head';
    head.position.set(0, 0.5, 0);

    const domeGeo = new THREE.SphereGeometry(0.38, 10, 8);
    const dome = new THREE.Mesh(domeGeo, mats.turretBodyMat);
    head.add(dome);

    // Dual gun barrels
    [-0.14, 0.14].forEach((x) => {
      const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const barrel = new THREE.Mesh(barrelGeo, mats.playerJointMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(x, 0.05, 0.45);
      head.add(barrel);
    });

    // Optical targeting sensor
    const sensorGeo = new THREE.BoxGeometry(0.12, 0.08, 0.1);
    const sensor = new THREE.Mesh(sensorGeo, mats.glitchlingEyeMat);
    sensor.position.set(0, 0.22, 0.25);
    head.add(sensor);

    g.add(head);
    return g;
  }

  public static createCorruptedBrute(): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'CORRUPTED_BRUTE';

    // Massive torso
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.1, 0.8);
    const torso = new THREE.Mesh(torsoGeo, mats.bruteArmorMat);
    torso.position.set(0, 1.6, 0);
    torso.castShadow = true;
    g.add(torso);

    // Glowing core heat vent
    const ventGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const vent = new THREE.Mesh(ventGeo, mats.bruteGlowMat);
    vent.position.set(0, 1.6, 0.41);
    g.add(vent);

    // Heavy hydraulic fists
    [-0.85, 0.85].forEach((x) => {
      const armGeo = new THREE.BoxGeometry(0.4, 0.8, 0.4);
      const arm = new THREE.Mesh(armGeo, mats.catwalkMetalMat);
      arm.position.set(x, 1.4, 0.2);
      g.add(arm);

      const fistGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
      const fist = new THREE.Mesh(fistGeo, mats.bruteArmorMat);
      fist.position.set(x, 0.8, 0.3);
      g.add(fist);
    });

    // Sturdy legs
    [-0.4, 0.4].forEach((x) => {
      const legGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.1, 8);
      const leg = new THREE.Mesh(legGeo, mats.playerArmorMat);
      leg.position.set(x, 0.55, 0);
      g.add(leg);
    });

    return g;
  }

  // ==========================================
  // BOSS: THE WARDEN
  // ==========================================
  public static createTheWarden(): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'THE_WARDEN';

    // Giant torso chassis (3.6m tall)
    const torso = new THREE.Group();
    torso.name = 'warden_torso';
    torso.position.set(0, 2.8, 0);

    const chestGeo = new THREE.BoxGeometry(2.4, 1.8, 1.6);
    const chest = new THREE.Mesh(chestGeo, mats.wardenHullMat);
    chest.castShadow = true;
    torso.add(chest);

    // Heavy shoulder armor pads
    [-1.5, 1.5].forEach((x) => {
      const padGeo = new THREE.BoxGeometry(0.9, 1.1, 1.4);
      const pad = new THREE.Mesh(padGeo, mats.wardenArmorPlateMat);
      pad.position.set(x, 0.6, 0);
      torso.add(pad);
    });

    // Central ominous glowing eye / power core
    const eyeGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const eye = new THREE.Mesh(eyeGeo, mats.wardenCoreRedMat);
    eye.position.set(0, 0.1, 0.82);
    torso.add(eye);

    // Twin heavy particle cannons mounted on shoulders
    [-1.6, 1.6].forEach((x) => {
      const cannonGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 12);
      const cannon = new THREE.Mesh(cannonGeo, mats.playerJointMat);
      cannon.rotation.x = Math.PI / 2;
      cannon.position.set(x, 0.9, 0.8);
      torso.add(cannon);
    });

    g.add(torso);

    // Heavy reverse-joint walker legs
    [-0.9, 0.9].forEach((x) => {
      const hipGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const hip = new THREE.Mesh(hipGeo, mats.wardenArmorPlateMat);
      hip.position.set(x, 1.8, 0);
      g.add(hip);

      const upperLegGeo = new THREE.CylinderGeometry(0.24, 0.2, 1.4, 8);
      const upperLeg = new THREE.Mesh(upperLegGeo, mats.wardenHullMat);
      upperLeg.position.set(x, 1.1, -0.3);
      upperLeg.rotation.x = -0.4;
      g.add(upperLeg);

      const lowerLegGeo = new THREE.CylinderGeometry(0.2, 0.28, 1.5, 8);
      const lowerLeg = new THREE.Mesh(lowerLegGeo, mats.playerJointMat);
      lowerLeg.position.set(x, 0.6, 0.2);
      lowerLeg.rotation.x = 0.5;
      g.add(lowerLeg);

      const footGeo = new THREE.BoxGeometry(0.7, 0.25, 1.1);
      const foot = new THREE.Mesh(footGeo, mats.wardenArmorPlateMat);
      foot.position.set(x, 0.12, 0.2);
      g.add(foot);
    });

    return g;
  }

  // ==========================================
  // INTERACTIVE PROPS & OBJECTIVES
  // ==========================================
  public static createPowerRelay(active: boolean = false): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'POWER_RELAY';

    // Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 0.5, 8);
    const base = new THREE.Mesh(baseGeo, mats.catwalkMetalMat);
    base.position.set(0, 0.25, 0);
    g.add(base);

    // 4 Containment pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const pilGeo = new THREE.BoxGeometry(0.12, 1.6, 0.12);
      const pil = new THREE.Mesh(pilGeo, mats.playerArmorMat);
      pil.position.set(Math.cos(angle) * 0.45, 1.05, Math.sin(angle) * 0.45);
      g.add(pil);
    }

    // Rotating Energy Core
    const coreGeo = new THREE.OctahedronGeometry(0.28);
    const core = new THREE.Mesh(coreGeo, active ? mats.relayActiveMat : mats.relayInactiveMat);
    core.name = 'relay_core';
    core.position.set(0, 1.1, 0);
    g.add(core);

    return g;
  }

  public static createArchiveTerminal(): THREE.Group {
    const mats = MaterialsManager.get();
    const g = new THREE.Group();
    g.name = 'ARCHIVE_TERMINAL';

    // Console base
    const baseGeo = new THREE.BoxGeometry(1.2, 0.9, 0.7);
    const base = new THREE.Mesh(baseGeo, mats.serverRackMat);
    base.position.set(0, 0.45, 0);
    g.add(base);

    // Angled screen
    const screenGeo = new THREE.BoxGeometry(1.0, 0.6, 0.1);
    const screen = new THREE.Mesh(screenGeo, mats.playerVisorMat);
    screen.position.set(0, 1.0, 0.05);
    screen.rotation.x = -0.4;
    g.add(screen);

    // Hologram floating disk
    const holoGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 16);
    const holo = new THREE.Mesh(holoGeo, mats.terminalHoloMat);
    holo.position.set(0, 1.45, 0);
    holo.name = 'holo_disk';
    g.add(holo);

    return g;
  }
}
