/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Tactical Upgrades, Evolutions & Progression Registry
 */
import { UpgradeDef, UpgradeId } from '../core/Types';

export const UPGRADE_REGISTRY: Record<UpgradeId, UpgradeDef> = {
  overclock: {
    id: 'overclock',
    name: 'OVERCLOCK',
    tier: 1,
    maxTier: 3,
    description: 'Bypasses energy regulators. Boosts weapon fire rate by +25% and reduces Dash cooldown.',
    icon: '⚡',
    statEffect: '+25% Fire Rate · -0.25s Dash CD',
  },
  quantum_core: {
    id: 'quantum_core',
    name: 'QUANTUM CORE',
    tier: 1,
    maxTier: 3,
    description: 'Harmonizes ZERO’s internal anomaly. Increases all energy damage by +20% and powers escort drones.',
    icon: '🔮',
    statEffect: '+20% Damage · Powers Escort Drones',
  },
  velocity_boost: {
    id: 'velocity_boost',
    name: 'VELOCITY BOOST',
    tier: 1,
    maxTier: 3,
    description: 'Calibrates sub-dermal servomotors. Increases movement and sprint speed by +15%.',
    icon: '👟',
    statEffect: '+15% Move Speed',
  },
  data_magnet: {
    id: 'data_magnet',
    name: 'DATA MAGNET',
    tier: 1,
    maxTier: 3,
    description: 'Generates a localized nanite vacuum field. Extends XP data cube collection range by +5 meters.',
    icon: '🧲',
    statEffect: '+5m XP Vacuum Radius',
  },
  critical_protocol: {
    id: 'critical_protocol',
    name: 'CRITICAL PROTOCOL',
    tier: 1,
    maxTier: 3,
    description: 'Calibrates weak-point optical targeting. Increases critical hit chance by +15% for 1.8x damage.',
    icon: '🎯',
    statEffect: '+15% Crit Chance (1.8x Dmg)',
  },
  shield_matrix: {
    id: 'shield_matrix',
    name: 'SHIELD MATRIX',
    tier: 1,
    maxTier: 3,
    description: 'Reinforces the personal deflective barrier. Adds +30 Max Shield and accelerates regeneration.',
    icon: '🛡️',
    statEffect: '+30 Max Shield · +6/s Regen',
  },
};

export function getRandomUpgradeChoices(
  currentTiers: Record<UpgradeId, number>,
  count: number = 3
): UpgradeDef[] {
  const allIds: UpgradeId[] = [
    'overclock',
    'quantum_core',
    'velocity_boost',
    'data_magnet',
    'critical_protocol',
    'shield_matrix',
  ];

  // Filter upgrades that haven't reached max tier
  const available = allIds
    .map((id) => {
      const def = UPGRADE_REGISTRY[id];
      const tier = currentTiers[id] || 0;
      return { ...def, tier: tier + 1 };
    })
    .filter((u) => u.tier <= u.maxTier);

  // Shuffle
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
