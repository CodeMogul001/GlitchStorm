/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Tactical Upgrade Selection Modal
 */
import React from 'react';
import { UpgradeDef } from '../core/Types';
import { SoundEngine } from '../audio/SoundEngine';

interface UpgradeModalProps {
  level: number;
  choices: UpgradeDef[];
  onSelect: (upgrade: UpgradeDef) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ level, choices, onSelect }) => {
  const handlePick = (u: UpgradeDef) => {
    SoundEngine.get().playInteract();
    onSelect(u);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 font-mono select-none px-4 pointer-events-auto">
      <div className="w-full max-w-3xl bg-slate-950 border-2 border-cyan-500/80 p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-1">
            QUANTUM SYNCHRONIZATION ESTABLISHED
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
            UPGRADE SYSTEM // LEVEL {level}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Select one hardware enhancement to calibrate Subject ZERO’s combat core.
          </p>
        </div>

        {/* 3 Upgrade Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {choices.map((u) => (
            <div
              key={u.id}
              onClick={() => handlePick(u)}
              className="bg-slate-900/90 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/30 p-4 flex flex-col justify-between transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl">{u.icon}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    TIER 0{u.tier} / 0{u.maxTier}
                  </span>
                </div>

                <div className="text-white font-black text-sm tracking-wide group-hover:text-cyan-300 transition-colors">
                  {u.name}
                </div>

                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  {u.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[11px] font-bold text-amber-400 mb-3">
                  {u.statEffect}
                </div>
                <button className="w-full py-1.5 bg-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black border border-cyan-400 text-cyan-200 text-xs font-black tracking-wider transition-all">
                  INITIALIZE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
