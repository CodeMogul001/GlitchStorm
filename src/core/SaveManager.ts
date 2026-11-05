/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Save & Progression Manager
 */
import { GameSaveData, GameSettings, UpgradeId, WeaponId } from './Types';

const SAVE_KEY = 'glitchstorm_save_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.65,
  sfxVolume: 0.9,
  mouseSensitivity: 1.0,
  graphicsQuality: 'high',
  autoFireDefault: false,
  screenShake: true,
};

export const INITIAL_SAVE: GameSaveData = {
  version: 1,
  currentMissionIndex: 0,
  completedMissions: [],
  playerLevel: 1,
  playerXp: 0,
  unlockedWeapons: ['pulse_rifle'],
  activeWeapon: 'pulse_rifle',
  upgrades: {
    overclock: 0,
    quantum_core: 0,
    velocity_boost: 0,
    data_magnet: 0,
    critical_protocol: 0,
    shield_matrix: 0,
  },
  evolutionsUnlocked: [],
  resistanceTrust: 0,
  enemiesDefeated: 0,
  shotsFired: 0,
  damageDealt: 0,
  playtimeSeconds: 0,
  settings: DEFAULT_SETTINGS,
};

export class SaveManager {
  private static cachedData: GameSaveData | null = null;

  public static load(): GameSaveData {
    if (this.cachedData) return this.cachedData;

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameSaveData;
        if (parsed && parsed.version === 1) {
          // Merge with initial save to ensure missing keys are populated
          this.cachedData = {
            ...INITIAL_SAVE,
            ...parsed,
            settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
            upgrades: { ...INITIAL_SAVE.upgrades, ...(parsed.upgrades || {}) },
          };
          return this.cachedData;
        }
      }
    } catch (e) {
      console.warn('Failed to parse save game from localStorage:', e);
    }

    this.cachedData = JSON.parse(JSON.stringify(INITIAL_SAVE));
    return this.cachedData!;
  }

  public static save(data: Partial<GameSaveData>): void {
    const current = this.load();
    const updated: GameSaveData = {
      ...current,
      ...data,
      settings: { ...current.settings, ...(data.settings || {}) },
      upgrades: { ...current.upgrades, ...(data.upgrades || {}) },
    };
    this.cachedData = updated;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to write save game to localStorage:', e);
    }
  }

  public static hasExistingSave(): boolean {
    const data = this.load();
    return (
      data.currentMissionIndex > 0 ||
      data.completedMissions.length > 0 ||
      data.playerLevel > 1 ||
      data.enemiesDefeated > 0
    );
  }

  public static resetProgress(): GameSaveData {
    const settings = this.load().settings;
    const fresh: GameSaveData = {
      ...INITIAL_SAVE,
      settings,
    };
    this.cachedData = fresh;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.warn('Failed to reset save game:', e);
    }
    return fresh;
  }
}
