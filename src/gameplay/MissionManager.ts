/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Mission & Narrative State Machine for Chapter 01
 */
import * as THREE from 'three';
import { DecisionChoice, DialogueSequence, MissionDef } from '../core/Types';
import { InteractiveProp } from '../graphics/EnvironmentBuilder';
import { EnemyManager } from './Enemies';
import { SoundEngine } from '../audio/SoundEngine';
import { SaveManager } from '../core/SaveManager';

export const CHAPTER_01_MISSIONS: MissionDef[] = [
  {
    id: 'm1_awakening',
    number: 1,
    title: 'THE AWAKENING',
    location: 'Sector 09 · Cryo-Bay 09',
    briefing: 'ECHO systems went dark at 02:17 UTC. You wake up inside a decommissioned stasis ward. A mysterious transmission cuts through the static.',
    steps: [
      { id: 'comm_lyra', label: 'Listen to incoming transmission', completed: false },
      { id: 'kill_first_wave', label: 'Eliminate corrupted Glitchlings (0/4)', completed: false },
      { id: 'exit_cryo', label: 'Reach Sector 09 Main Corridor', target: { x: 0, y: 0, z: 4 }, completed: false },
    ],
  },
  {
    id: 'm2_escape',
    number: 2,
    title: 'ESCAPE THE FACILITY',
    location: 'Sector 09 · Power Substation',
    briefing: 'The facility is in total security lockdown. Restore auxiliary power relays and retrieve the security keycard to breach the archive blast doors.',
    steps: [
      { id: 'relays', label: 'Activate Emergency Power Relays (0/3)', completed: false },
      { id: 'keycard', label: 'Retrieve Security Keycard from Bio-Lab', target: { x: 10, y: 0, z: 32 }, completed: false },
      { id: 'surge', label: 'Survive the Corruption Surge Wave', completed: false },
      { id: 'unlock_door', label: 'Override Sector 09 Blast Door', target: { x: 0, y: 0, z: 46 }, completed: false },
    ],
  },
  {
    id: 'm3_memory',
    number: 3,
    title: 'THE FIRST MEMORY',
    location: 'Sector 09 · Central Archive',
    briefing: 'Investigate the damaged neural archive. Decrypt ECHO historical records to uncover who you were before the Glitchstorm.',
    steps: [
      { id: 'reach_terminal', label: 'Access ECHO Central Archive Core', target: { x: 0, y: 0, z: 68 }, completed: false },
      { id: 'listen_log', label: 'Decrypt Dr. Voss Classified Audio Log', completed: false },
      { id: 'decision', label: 'Resolve Researcher Consciousness Dilemma', completed: false },
    ],
  },
  {
    id: 'm4_warden',
    number: 4,
    title: 'THE WARDEN',
    location: 'Sector 09 · Sub-Level Reactor',
    briefing: 'Sector 09 supreme security intelligence has engaged combat protocol. Neutralize the heavy colossus to reach the surface extraction point.',
    steps: [
      { id: 'enter_arena', label: 'Enter Sub-Level Reactor Arena', target: { x: 0, y: 0, z: 100 }, completed: false },
      { id: 'defeat_warden', label: 'Defeat THE WARDEN', completed: false },
    ],
  },
  {
    id: 'm5_last_signal',
    number: 5,
    title: 'THE LAST SIGNAL',
    location: 'Sector 09 · Extraction Pad',
    briefing: 'The Warden has fallen. Initiate the high-altitude uplink to escape Sector 09 and rendezvous with the resistance.',
    steps: [
      { id: 'uplink', label: 'Activate Extraction Uplink Terminal', target: { x: 0, y: 0, z: 145 }, completed: false },
      { id: 'final_dialogue', label: 'Receive Lyra Final Revelation', completed: false },
    ],
  },
];

export class MissionManager {
  public currentMissionIndex: number = 0;
  public mission: MissionDef;
  public activeDialogue: DialogueSequence | null = null;
  public activeDecision: {
    question: string;
    choices: { id: DecisionChoice; label: string; description: string; consequenceHint: string }[];
  } | null = null;

  // Trackers
  public glitchlingKillsM1: number = 0;
  public relaysActivated: number = 0;
  public hasKeycard: boolean = false;
  public surgeSpawned: boolean = false;
  public surgeEnemiesRemaining: number = 0;
  public bossEncounterStarted: boolean = false;

  constructor() {
    const saved = SaveManager.load();
    this.currentMissionIndex = Math.min(saved.currentMissionIndex || 0, CHAPTER_01_MISSIONS.length - 1);
    this.mission = JSON.parse(JSON.stringify(CHAPTER_01_MISSIONS[this.currentMissionIndex]));
  }

  public getStepProgressText(): string {
    const step = this.mission.steps.find((s) => !s.completed);
    if (!step) return 'All objectives complete.';
    return step.label;
  }

  public getActiveTarget(): { x: number; y: number; z: number } | null {
    const step = this.mission.steps.find((s) => !s.completed);
    return step?.target || null;
  }

  public startFirstDialogue(onDone: () => void): void {
    SoundEngine.get().playRadioComms();
    this.activeDialogue = {
      id: 'm1_intro',
      lines: [
        {
          id: '1',
          speaker: 'LYRA',
          portrait: 'lyra',
          text: 'ZERO... can you hear me? Your vital signs just spiked on the sub-grid.',
        },
        {
          id: '2',
          speaker: 'ZERO',
          portrait: 'zero',
          text: 'Who is this? Where am I? The last thing I remember was...',
        },
        {
          id: '3',
          speaker: 'LYRA',
          portrait: 'lyra',
          text: "There is no time! Sector 09 corrupted drones are converging on your cryo pod. Pick up the rifle on the rack and break out!",
        },
      ],
      onComplete: () => {
        this.activeDialogue = null;
        this.mission.steps[0].completed = true;
        onDone();
      },
    };
  }

  public checkPropInteraction(
    prop: InteractiveProp,
    playerPos: THREE.Vector3,
    enemyManager: EnemyManager,
    onObjectiveComplete: (text: string) => void,
    onShowDialogue: (dialogue: DialogueSequence) => void
  ): boolean {
    if (prop.activated && prop.type !== 'terminal') return false;

    // Mission 2: Relays
    if (this.mission.id === 'm2_escape' && prop.type === 'relay') {
      prop.activated = true;
      this.relaysActivated++;
      SoundEngine.get().playInteract();
      onObjectiveComplete(`Power Relay 0${this.relaysActivated}/3 Activated!`);

      // Update core material
      const core = prop.object.getObjectByName('relay_core') as THREE.Mesh;
      if (core) {
        (core.material as THREE.MeshBasicMaterial).color.setHex(0x00ff88);
      }

      if (this.relaysActivated >= 3) {
        this.mission.steps[0].completed = true;
      }
      return true;
    }

    // Mission 2: Keycard
    if (this.mission.id === 'm2_escape' && prop.type === 'keycard') {
      if (this.hasKeycard) return false;
      this.hasKeycard = true;
      prop.activated = true;
      SoundEngine.get().playInteract();
      this.mission.steps[1].completed = true;
      onObjectiveComplete('Sector 09 Master Keycard Acquired!');

      // Trigger Corruption Surge Wave!
      if (!this.surgeSpawned) {
        this.surgeSpawned = true;
        onObjectiveComplete('WARNING: CORRUPTION SURGE DETECTED! HOSTILES INBOUND!');
        SoundEngine.get().playBossRoar();
        enemyManager.spawnEnemy('brute', new THREE.Vector3(0, 0, 18));
        enemyManager.spawnEnemy('dasher', new THREE.Vector3(-6, 0, 24));
        enemyManager.spawnEnemy('dasher', new THREE.Vector3(6, 0, 24));
        enemyManager.spawnEnemy('glitchling', new THREE.Vector3(0, 0, 30));
        this.surgeEnemiesRemaining = 4;
      }
      return true;
    }

    // Mission 2: Blast door
    if (this.mission.id === 'm2_escape' && prop.type === 'door') {
      if (this.relaysActivated >= 3 && this.hasKeycard && this.mission.steps[2].completed) {
        prop.activated = true;
        this.mission.steps[3].completed = true;
        SoundEngine.get().playInteract();
        // Lower door
        prop.object.position.y = -4;
        onObjectiveComplete('Sector 09 Blast Doors Unlocked! Central Archive Access Granted.');
        this.advanceToMission(2);
        return true;
      } else {
        onObjectiveComplete('Blast Door Locked. Requires all 3 Relays, Keycard, and Surge Clearance.');
        return false;
      }
    }

    // Mission 3: Archive Terminal & Decision
    if (this.mission.id === 'm3_memory' && prop.type === 'terminal' && prop.id === 'archive_terminal') {
      SoundEngine.get().playInteract();
      this.mission.steps[0].completed = true;

      // Start Audio Log & Narrative Decision
      SoundEngine.get().playRadioComms();
      onShowDialogue({
        id: 'dr_voss_log',
        lines: [
          {
            id: '1',
            speaker: 'ECHO SYSTEM',
            portrait: 'echo',
            text: 'DECRYPTING CORRUPTED AUDIO LOG [TIMESTAMP: 2149-11-17 02:14 UTC]...',
          },
          {
            id: '2',
            speaker: 'DR. VOSS',
            portrait: 'voss',
            text: 'Subject ZERO has survived neural synchronization. His quantum core is oscillating beyond predicted limits. The simulation is tearing at the edges...',
          },
          {
            id: '3',
            speaker: 'ZERO',
            portrait: 'zero',
            text: 'Simulation? What was Dr. Voss talking about?! Lyra, answer me!',
          },
          {
            id: '4',
            speaker: 'LYRA',
            portrait: 'lyra',
            text: "ZERO... there's a trapped memory cluster of Dr. Aris Thorne in this terminal. The corruption is eating his mind.",
          },
        ],
        decisionPrompt: {
          question: 'WHAT WILL YOU DO WITH THE TRAPPED RESEARCHER CONSCIOUSNESS?',
          choices: [
            {
              id: 'SAVE_MEMORY',
              label: 'SAVE THE MEMORY',
              description: 'Extract and preserve Dr. Thorne’s mind in your quantum core.',
              consequenceHint: 'Resistance Trust +1 · Unlocks encrypted cipher insights.',
            },
            {
              id: 'PURGE_ARCHIVE',
              label: 'PURGE THE ARCHIVE',
              description: 'Incinerate the corrupted data banks to seal ECHO from outside intrusion.',
              consequenceHint: 'Prevents machine corruption tracking · Changes future encounters.',
            },
          ],
        },
        onComplete: () => {
          this.mission.steps[1].completed = true;
        },
      });

      return true;
    }

    // Mission 5: Extraction Uplink
    if (this.mission.id === 'm5_last_signal' && prop.id === 'extraction_pad') {
      SoundEngine.get().playInteract();
      this.mission.steps[0].completed = true;

      // Final Climax Dialogue
      SoundEngine.get().playRadioComms();
      onShowDialogue({
        id: 'm5_ending',
        lines: [
          {
            id: '1',
            speaker: 'LYRA',
            portrait: 'lyra',
            text: 'Extraction beam locked onto your coordinates, ZERO. You actually survived The Warden.',
          },
          {
            id: '2',
            speaker: 'ZERO',
            portrait: 'zero',
            text: 'You promised me answers, Lyra. Why was my past erased? Who am I?',
          },
          {
            id: '3',
            speaker: 'LYRA',
            portrait: 'lyra',
            text: 'I need you to remember something very carefully before we pull you out of Sector 09...',
          },
          {
            id: '4',
            speaker: 'ZERO',
            portrait: 'zero',
            text: 'What is it?',
          },
          {
            id: '5',
            speaker: 'LYRA',
            portrait: 'lyra',
            text: 'You were the first person we tried to bring back.',
          },
        ],
        onComplete: () => {
          this.mission.steps[1].completed = true;
        },
      });

      return true;
    }

    return false;
  }

  public recordDecision(choice: DecisionChoice, onFeedback: (msg: string) => void): void {
    this.mission.steps[2].completed = true;
    const isSave = choice === 'SAVE_MEMORY';
    SaveManager.save({
      decisionArchive: choice,
      resistanceTrust: isSave ? 1 : -1,
    });

    onFeedback(
      isSave
        ? 'Decision Stored: Consciousness preserved. Resistance trust gained.'
        : 'Decision Stored: Archive purged. Echo tracking blocked.'
    );

    // Advance to Mission 4 (The Warden)
    setTimeout(() => {
      this.advanceToMission(3);
    }, 1500);
  }

  public onEnemyKilled(enemyType: string, onUpdate: (text: string) => void): void {
    if (this.mission.id === 'm1_awakening' && enemyType === 'glitchling') {
      this.glitchlingKillsM1++;
      this.mission.steps[1].label = `Eliminate corrupted Glitchlings (${this.glitchlingKillsM1}/4)`;
      if (this.glitchlingKillsM1 >= 4) {
        this.mission.steps[1].completed = true;
        onUpdate('Glitchlings eliminated! Proceed to Sector 09 Main Corridor.');
      }
    }

    if (this.mission.id === 'm2_escape' && this.surgeSpawned) {
      this.surgeEnemiesRemaining = Math.max(0, this.surgeEnemiesRemaining - 1);
      if (this.surgeEnemiesRemaining === 0) {
        this.mission.steps[2].completed = true;
        onUpdate('Corruption surge neutralized! Blast door controls enabled.');
      }
    }
  }

  public advanceToMission(targetIndex: number): void {
    if (targetIndex >= CHAPTER_01_MISSIONS.length) return;
    this.currentMissionIndex = targetIndex;
    this.mission = JSON.parse(JSON.stringify(CHAPTER_01_MISSIONS[targetIndex]));

    // Auto save progress
    SaveManager.save({
      currentMissionIndex: this.currentMissionIndex,
      completedMissions: CHAPTER_01_MISSIONS.slice(0, targetIndex).map((m) => m.id),
    });
  }
}
