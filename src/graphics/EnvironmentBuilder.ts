/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Sector 09 Environment Builder
 * Full 3D industrial sci-fi complex with collision bounding boxes
 */
import * as THREE from 'three';
import { MaterialsManager } from './Materials';
import { ModelFactory } from './ModelFactory';

export interface WallCollider {
  box: THREE.Box3;
  mesh?: THREE.Mesh;
}

export interface InteractiveProp {
  id: string;
  type: 'relay' | 'terminal' | 'keycard' | 'door';
  position: THREE.Vector3;
  radius: number;
  object: THREE.Object3D;
  activated: boolean;
  label: string;
}

export class EnvironmentBuilder {
  public static buildSector09(scene: THREE.Scene): {
    colliders: WallCollider[];
    props: InteractiveProp[];
    spawnPoint: THREE.Vector3;
    bossArenaCenter: THREE.Vector3;
  } {
    const mats = MaterialsManager.get();
    const colliders: WallCollider[] = [];
    const props: InteractiveProp[] = [];

    // Helper to add wall with collision
    const addWall = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      material: THREE.Material = mats.wallMat
    ) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      colliders.push({ box, mesh });
      return mesh;
    };

    // Helper to add floor plate
    const addFloor = (x: number, z: number, w: number, d: number) => {
      const geo = new THREE.BoxGeometry(w, 0.4, d);
      const mesh = new THREE.Mesh(geo, mats.floorMat);
      mesh.position.set(x, -0.2, z);
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Repeat texture based on size
      if (mats.floorGridTexture) {
        mats.floorGridTexture.repeat.set(w / 8, d / 8);
      }
    };

    // Helper to add server rack
    const addServerTower = (x: number, z: number) => {
      const geo = new THREE.BoxGeometry(1.6, 4.0, 1.2);
      const mesh = new THREE.Mesh(geo, mats.serverRackMat);
      mesh.position.set(x, 2.0, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      colliders.push({ box, mesh });
    };

    // ==========================================
    // ZONE 1: CRYO-BAY 09 (Z: -20 to 0, X: -10 to 10)
    // ==========================================
    addFloor(0, -10, 24, 24);

    // Cryo Bay Walls
    addWall(0, 3, -22, 24, 6, 1); // North wall
    addWall(-12, 3, -10, 1, 6, 24); // West wall
    addWall(12, 3, -10, 1, 6, 24); // East wall
    // South wall with doorway
    addWall(-7, 3, 2, 10, 6, 1);
    addWall(7, 3, 2, 10, 6, 1);

    // Cryo Stasis Pods in Cryo-Bay
    for (let i = -3; i <= 3; i += 2) {
      if (i === 0) continue;
      const podBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 2.8, 12), mats.catwalkMetalMat);
      podBase.position.set(i * 3, 1.4, -18);
      scene.add(podBase);
      colliders.push({ box: new THREE.Box3().setFromObject(podBase) });

      const podGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 12), mats.glassShieldMat);
      podGlass.position.set(i * 3, 1.6, -18);
      scene.add(podGlass);
    }

    // ==========================================
    // ZONE 2: MAIN CORRIDOR & POWER SUBSTATION (Z: 2 to 45, X: -15 to 15)
    // ==========================================
    addFloor(0, 24, 34, 44);

    // Corridor Boundaries
    addWall(-17, 3, 24, 1, 6, 44); // West wall
    addWall(17, 3, 24, 1, 6, 44); // East wall

    // Server arrays in corridor
    addServerTower(-12, 12);
    addServerTower(-12, 18);
    addServerTower(-12, 24);
    addServerTower(12, 12);
    addServerTower(12, 18);
    addServerTower(12, 24);

    // 3 Emergency Power Relays in Zone 2
    const relayPositions = [
      new THREE.Vector3(-8, 0, 10),
      new THREE.Vector3(8, 0, 20),
      new THREE.Vector3(-6, 0, 32),
    ];

    relayPositions.forEach((pos, idx) => {
      const relayGroup = ModelFactory.createPowerRelay(false);
      relayGroup.position.copy(pos);
      scene.add(relayGroup);

      props.push({
        id: `relay_${idx + 1}`,
        type: 'relay',
        position: pos.clone().add(new THREE.Vector3(0, 1, 0)),
        radius: 2.8,
        object: relayGroup,
        activated: false,
        label: `Power Relay 0${idx + 1} [Press E]`,
      });

      colliders.push({ box: new THREE.Box3().setFromObject(relayGroup) });
    });

    // Bio-Lab Keycard Terminal
    const keycardTerminal = ModelFactory.createArchiveTerminal();
    keycardTerminal.position.set(10, 0, 32);
    scene.add(keycardTerminal);
    props.push({
      id: 'keycard_terminal',
      type: 'keycard',
      position: new THREE.Vector3(10, 1.2, 32),
      radius: 2.6,
      object: keycardTerminal,
      activated: false,
      label: 'Security Keycard Terminal [Press E]',
    });
    colliders.push({ box: new THREE.Box3().setFromObject(keycardTerminal) });

    // Blast door dividing Zone 2 and Zone 3
    const doorMesh = addWall(0, 3, 46, 12, 6, 1.2, mats.hazardDoorMat);
    doorMesh.name = 'SECTOR_BLAST_DOOR';
    props.push({
      id: 'blast_door',
      type: 'door',
      position: new THREE.Vector3(0, 1.5, 46),
      radius: 4.5,
      object: doorMesh,
      activated: false,
      label: 'Sector 09 Blast Door [Locked - Requires Power & Key]',
    });

    // ==========================================
    // ZONE 3: CENTRAL RESEARCH ARCHIVE (Z: 47 to 85, X: -20 to 20)
    // ==========================================
    addFloor(0, 66, 42, 40);

    // Archive walls
    addWall(-21, 4, 66, 1, 8, 40);
    addWall(21, 4, 66, 1, 8, 40);

    // Circular Holographic Data Core in Center
    const holoCoreBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.0, 0.6, 16), mats.catwalkMetalMat);
    holoCoreBase.position.set(0, 0.3, 66);
    scene.add(holoCoreBase);
    colliders.push({ box: new THREE.Box3().setFromObject(holoCoreBase) });

    const archiveTerminal = ModelFactory.createArchiveTerminal();
    archiveTerminal.position.set(0, 0.6, 68);
    scene.add(archiveTerminal);
    props.push({
      id: 'archive_terminal',
      type: 'terminal',
      position: new THREE.Vector3(0, 1.5, 68),
      radius: 3.2,
      object: archiveTerminal,
      activated: false,
      label: 'ECHO Central Archive Core [Press E]',
    });

    // Archive Server Monoliths
    for (let z = 54; z <= 78; z += 8) {
      addServerTower(-16, z);
      addServerTower(16, z);
    }

    // Doorway into Boss Arena
    addWall(-14, 4, 86, 14, 8, 1);
    addWall(14, 4, 86, 14, 8, 1);

    // ==========================================
    // ZONE 4: SUB-LEVEL REACTOR ARENA (THE WARDEN) (Z: 87 to 150, X: -35 to 35)
    // ==========================================
    const arenaCenterZ = 120;
    addFloor(0, arenaCenterZ, 70, 68);

    // Arena Perimeter Walls
    addWall(0, 5, 154, 70, 10, 2); // North Arena Wall
    addWall(-35, 5, arenaCenterZ, 2, 10, 68); // West Arena Wall
    addWall(35, 5, arenaCenterZ, 2, 10, 68); // East Arena Wall

    // 4 Massive Energy Pillars in Arena
    const pillarCoords = [
      [-16, arenaCenterZ - 16],
      [16, arenaCenterZ - 16],
      [-16, arenaCenterZ + 16],
      [16, arenaCenterZ + 16],
    ];

    pillarCoords.forEach(([px, pz]) => {
      const pilGeo = new THREE.CylinderGeometry(1.6, 2.0, 10, 12);
      const pil = new THREE.Mesh(pilGeo, mats.catwalkMetalMat);
      pil.position.set(px, 5, pz);
      pil.castShadow = true;
      pil.receiveShadow = true;
      scene.add(pil);
      colliders.push({ box: new THREE.Box3().setFromObject(pil) });

      // Glowing power coil around pillar
      const coilGeo = new THREE.TorusGeometry(1.9, 0.12, 8, 16);
      const coil = new THREE.Mesh(coilGeo, mats.playerCoreCyanMat);
      coil.position.set(px, 4, pz);
      coil.rotation.x = Math.PI / 2;
      scene.add(coil);
    });

    // Extraction Teleport Pad at North End of Arena (Mission 5 Target)
    const padGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.4, 16);
    const pad = new THREE.Mesh(padGeo, mats.playerVisorMat);
    pad.position.set(0, 0.2, 145);
    scene.add(pad);

    props.push({
      id: 'extraction_pad',
      type: 'terminal',
      position: new THREE.Vector3(0, 1.2, 145),
      radius: 4.0,
      object: pad,
      activated: false,
      label: 'Extraction Uplink Terminal [Press E]',
    });

    return {
      colliders,
      props,
      spawnPoint: new THREE.Vector3(0, 0, -10),
      bossArenaCenter: new THREE.Vector3(0, 0, arenaCenterZ),
    };
  }
}
