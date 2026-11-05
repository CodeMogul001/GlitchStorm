/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Core Type Definitions
 */

export type GameScreen = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export type WeaponId = 'pulse_rifle' | 'arc_blades' | 'void_cannon' | 'drone_swarm';

export type WeaponEvolutionId = 'plasma_storm' | 'thunder_reaper' | 'singularity';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: 'Rifle' | 'Melee/Arc' | 'Heavy' | 'Deployable';
  description: string;
  damage: number;
  fireRate: number; // shots per sec
  range: number;
  ammoMax: number;
  reloadTime: number;
  projectileSpeed: number;
  projectileColor: string;
  evolutionId?: WeaponEvolutionId;
  evolutionName?: string;
  evolutionDesc?: string;
  pairedUpgradeId: UpgradeId;
}

export type UpgradeId =
  | 'overclock'
  | 'quantum_core'
  | 'velocity_boost'
  | 'data_magnet'
  | 'critical_protocol'
  | 'shield_matrix';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  tier: number;
  maxTier: number;
  description: string;
  icon: string;
  statEffect: string;
}

export type MissionId = 'm1_awakening' | 'm2_escape' | 'm3_memory' | 'm4_warden' | 'm5_last_signal';

export interface MissionStep {
  id: string;
  label: string;
  target?: { x: number; y: number; z: number };
  completed: boolean;
}

export interface MissionDef {
  id: MissionId;
  number: number;
  title: string;
  location: string;
  briefing: string;
  steps: MissionStep[];
}

export type DecisionChoice = 'SAVE_MEMORY' | 'PURGE_ARCHIVE';

export interface GameSaveData {
  version: number;
  currentMissionIndex: number;
  completedMissions: string[];
  playerLevel: number;
  playerXp: number;
  unlockedWeapons: WeaponId[];
  activeWeapon: WeaponId;
  upgrades: Record<UpgradeId, number>;
  evolutionsUnlocked: WeaponEvolutionId[];
  decisionArchive?: DecisionChoice;
  resistanceTrust: number;
  enemiesDefeated: number;
  shotsFired: number;
  damageDealt: number;
  playtimeSeconds: number;
  checkpointId?: string;
  settings: GameSettings;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mouseSensitivity: number;
  graphicsQuality: 'ultra' | 'high' | 'performance';
  autoFireDefault: boolean;
  screenShake: boolean;
}

export interface DialogueLine {
  id: string;
  speaker: 'ZERO' | 'LYRA' | 'ECHO SYSTEM' | 'DR. VOSS' | 'THE WARDEN';
  text: string;
  portrait?: 'zero' | 'lyra' | 'echo' | 'voss' | 'warden';
  glitchEffect?: boolean;
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
  onComplete?: () => void;
  decisionPrompt?: {
    question: string;
    choices: {
      id: DecisionChoice;
      label: string;
      description: string;
      consequenceHint: string;
    }[];
  };
}
