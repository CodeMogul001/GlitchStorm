/**
 * GLITCHSTORM: THE LAST SIGNAL
 * World-Matched, Low-Occlusion In-Game HUD
 * Minimum 85% unobstructed playfield, zero backdrop-filter, tabular-nums readouts
 */
import React from 'react';
import { PlayerStats } from '../gameplay/Player';
import { WeaponDef, WeaponId } from '../core/Types';
import { WEAPON_REGISTRY } from '../gameplay/Weapons';

interface GameHUDProps {
  stats: PlayerStats;
  currentWeapon: WeaponDef;
  unlockedWeapons: WeaponId[];
  onSelectWeapon: (id: WeaponId) => void;
  ammo: number;
  isReloading: boolean;
  objectiveText: string;
  targetDistance: number | null;
  bossHp: { current: number; max: number; phase: number; name: string } | null;
  notification: string | null;
  isAiming: boolean;
  onOpenPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  currentWeapon,
  unlockedWeapons,
  onSelectWeapon,
  ammo,
  isReloading,
  objectiveText,
  targetDistance,
  bossHp,
  notification,
  isAiming,
  onOpenPause,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (stats.shield / stats.maxShield) * 100));
  const xpPercent = Math.max(0, Math.min(100, (stats.xp / stats.xpToNextLevel) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-mono text-xs">
      {/* Dynamic Reticle in Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div
          className={`transition-all duration-150 rounded-full flex items-center justify-center border ${
            isAiming
              ? 'w-6 h-6 border-cyan-400 bg-cyan-400/10'
              : 'w-10 h-10 border-cyan-500/40'
          }`}
        >
          <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#00f0ff]" />
        </div>
        {/* Cardinal tick marks */}
        <div className="absolute w-12 h-0.5 bg-cyan-500/30" />
        <div className="absolute h-12 w-0.5 bg-cyan-500/30" />
      </div>

      {/* TOP PERIMETER: XP Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/60 z-20">
        <div
          className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-amber-300 shadow-[0_0_10px_#00ffff]"
          style={{ width: `${xpPercent}%` }}
        />
      </div>

      {/* TOP-LEFT CLUSTER: Player Vitality & Quantum Core */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="bg-slate-950/90 border border-cyan-500/60 px-2 py-0.5 text-cyan-300 font-black tracking-wider text-[11px] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            ZERO // SUPERHERO
          </div>
          <div className="bg-slate-950/90 border border-amber-500/60 px-2 py-0.5 text-amber-400 font-bold tabular-nums">
            LVL {stats.level}
          </div>
          <button
            onClick={onOpenPause}
            className="px-2 py-0.5 bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Pause Game (Esc)"
          >
            ESC
          </button>
        </div>

        {/* Shield Bar */}
        <div className="w-48 sm:w-56 bg-slate-950/90 border border-cyan-900/80 p-1">
          <div className="flex justify-between text-[10px] text-cyan-400 mb-0.5 font-bold">
            <span>DEFLECTOR SHIELD</span>
            <span className="tabular-nums">
              {Math.round(stats.shield)} / {stats.maxShield}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] transition-all duration-100"
              style={{ width: `${shieldPercent}%` }}
            />
          </div>
        </div>

        {/* Health Bar */}
        <div className="w-48 sm:w-56 bg-slate-950/90 border border-rose-950/80 p-1">
          <div className="flex justify-between text-[10px] text-rose-400 mb-0.5 font-bold">
            <span>CHASSIS INTEGRITY</span>
            <span className="tabular-nums">
              {Math.round(stats.hp)} / {stats.maxHp}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-rose-500 shadow-[0_0_8px_#ff0055] transition-all duration-100"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* TOP-CENTER CLUSTER: Objective Ticker */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[85vw] sm:max-w-md text-center">
        <div className="bg-slate-950/90 border border-cyan-500/40 px-3.5 py-1.5 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-center gap-2 text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            ACTIVE DIRECTIVE
          </div>
          <div className="text-white font-medium text-xs mt-0.5 text-balance">
            {objectiveText}
          </div>
          {targetDistance !== null && (
            <div className="text-[10px] text-amber-400/90 mt-0.5 tabular-nums">
              NAV BEACON: {Math.round(targetDistance)}m
            </div>
          )}
        </div>
      </div>

      {/* BOSS HEALTH BAR (When Active) */}
      {bossHp && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-[88vw] max-w-xl">
          <div className="bg-slate-950/95 border-2 border-red-600/80 p-2 shadow-[0_0_25px_rgba(255,0,0,0.4)]">
            <div className="flex justify-between items-center text-red-400 font-black tracking-widest text-xs mb-1">
              <span>⚠ {bossHp.name}</span>
              <span className="text-amber-400 text-[10px]">PHASE 0{bossHp.phase} / 03</span>
              <span className="tabular-nums">
                {Math.round(bossHp.current)} / {bossHp.max}
              </span>
            </div>
            <div className="w-full h-3 bg-red-950/50 overflow-hidden border border-red-900">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-150 shadow-[0_0_12px_#ff0033]"
                style={{ width: `${Math.max(0, (bossHp.current / bossHp.max) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-30 bg-amber-500/20 border border-amber-400/80 text-amber-200 px-4 py-1.5 font-bold tracking-wider text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-bounce">
          {notification}
        </div>
      )}

      {/* BOTTOM-LEFT: Ability Cooldown Badges */}
      <div className="absolute bottom-5 left-4 z-20 flex gap-2 pointer-events-auto">
        {/* Dash */}
        <div className="bg-slate-950/90 border border-cyan-800 p-2 flex flex-col items-center w-16 text-center">
          <div className="text-[10px] text-cyan-400 font-bold">SPACE</div>
          <div className="text-white text-xs font-black my-0.5">DASH</div>
          <div className="text-[10px] tabular-nums text-cyan-300">
            {stats.dashCooldown > 0 ? `${stats.dashCooldown.toFixed(1)}s` : 'READY'}
          </div>
        </div>

        {/* Time Collapse */}
        <div className="bg-slate-950/90 border border-cyan-800 p-2 flex flex-col items-center w-16 text-center">
          <div className="text-[10px] text-cyan-400 font-bold">C KEY</div>
          <div className="text-white text-xs font-black my-0.5">SLOW</div>
          <div className="text-[10px] tabular-nums text-cyan-300">
            {stats.timeCollapseCooldown > 0 ? `${stats.timeCollapseCooldown.toFixed(1)}s` : 'READY'}
          </div>
        </div>

        {/* Reality Fracture Ultimate */}
        <div className="bg-slate-950/90 border border-amber-600 p-2 flex flex-col items-center w-20 text-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          <div className="text-[10px] text-amber-400 font-bold">Q ULT</div>
          <div className="text-amber-300 text-xs font-black my-0.5">FRACTURE</div>
          <div className="text-[10px] tabular-nums text-amber-400">
            {stats.realityFractureCooldown > 0
              ? `${stats.realityFractureCooldown.toFixed(1)}s`
              : 'ONLINE'}
          </div>
        </div>
      </div>

      {/* BOTTOM-RIGHT: Weapons & Ammo Cluster */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Weapon Quick Selector [1, 2, 3, 4] */}
        <div className="flex gap-1">
          {(['pulse_rifle', 'arc_blades', 'void_cannon', 'drone_swarm'] as WeaponId[]).map(
            (wId, idx) => {
              const def = WEAPON_REGISTRY[wId];
              const isUnlocked = unlockedWeapons.includes(wId);
              const isActive = currentWeapon.id === wId;
              return (
                <button
                  key={wId}
                  onClick={() => isUnlocked && onSelectWeapon(wId)}
                  disabled={!isUnlocked}
                  className={`px-2 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_#00f0ff]'
                      : isUnlocked
                      ? 'bg-slate-950/80 border-slate-700 text-slate-400 hover:border-slate-500'
                      : 'bg-slate-950/40 border-slate-900 text-slate-700 cursor-not-allowed'
                  }`}
                  title={`${def.name} [Key ${idx + 1}]`}
                >
                  {idx + 1} {def.name.split(' ')[0]}
                </button>
              );
            }
          )}
        </div>

        {/* Active Weapon Card */}
        <div className="bg-slate-950/95 border border-cyan-500/50 p-2.5 flex items-center gap-4 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <div>
            <div className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider">
              {currentWeapon.category} · {stats.autoFire ? 'AUTO-FIRE [F: ON]' : 'MANUAL [F: OFF]'}
            </div>
            <div className="text-white text-sm font-black tracking-wide">
              {currentWeapon.name}
            </div>
            <div className="text-[10px] text-slate-400">
              Mouse: Aim Anywhere (360°) · RMB: Zoom Aim · R: Reload
            </div>
          </div>

          <div className="text-right border-l border-slate-800 pl-3">
            <div className="text-xl font-black text-cyan-300 tabular-nums">
              {isReloading ? (
                <span className="text-amber-400 animate-pulse text-xs">RELOADING...</span>
              ) : (
                <>
                  {ammo} <span className="text-xs text-slate-500">/ {currentWeapon.ammoMax}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
