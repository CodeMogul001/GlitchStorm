/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Chapter 01 Completion / Victory & Game Over Screen
 */
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameSaveData } from '../core/Types';
import { SoundEngine } from '../audio/SoundEngine';

interface MissionResultsProps {
  type: 'VICTORY' | 'GAMEOVER';
  saveData: GameSaveData;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const MissionResultsModal: React.FC<MissionResultsProps> = ({
  type,
  saveData,
  onRestart,
  onReturnToMenu,
}) => {
  useEffect(() => {
    if (type === 'VICTORY') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#f59e0b', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [type]);

  if (type === 'GAMEOVER') {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 font-mono select-none px-4 pointer-events-auto">
        <div className="w-full max-w-lg bg-slate-950 border-2 border-red-600 p-8 shadow-[0_0_60px_rgba(255,0,0,0.3)] text-center">
          <div className="text-red-500 font-black text-2xl tracking-widest mb-2">
            CRITICAL SYSTEM FAILURE
          </div>
          <div className="text-sm text-red-300 mb-6">
            CHASSIS INTEGRITY DEPLETED // QUANTUM DESYNCHRONIZATION
          </div>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            ZERO’s energy core went critical. Emergency backup protocol is available to restore your state at the last Sector 09 checkpoint.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                SoundEngine.get().playInteract();
                onRestart();
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(255,0,0,0.4)]"
            >
              RESTORE AT CHECKPOINT [SPACE]
            </button>
            <button
              onClick={() => {
                SoundEngine.get().playInteract();
                onReturnToMenu();
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              ABORT TO TITLE MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VICTORY / CHAPTER 01 COMPLETE
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 font-mono select-none px-4 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-cyan-400 p-8 shadow-[0_0_60px_rgba(0,240,255,0.3)]">
        <div className="text-center mb-6">
          <div className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-1">
            SECTOR 09 CLEARED · EVACUATION SUCCESSFUL
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest">
            CHAPTER 01 COMPLETE
          </h1>
          <div className="text-cyan-400 text-sm mt-1 tracking-wider font-bold">
            THE STORY CONTINUES...
          </div>
        </div>

        {/* Narrative Revelation Box */}
        <div className="bg-slate-900/90 border border-cyan-800 p-4 mb-6">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2">
            FINAL TRANSMISSION ARCHIVE // LYRA
          </div>
          <div className="italic text-slate-200 text-sm leading-relaxed border-l-2 border-cyan-400 pl-3">
            “You were the first person we tried to bring back. November 17 wasn’t an accident. ECHO was breaking through the simulation.”
          </div>
        </div>

        {/* Campaign Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center">
          <div className="bg-slate-900 border border-slate-800 p-3">
            <div className="text-[10px] text-slate-400">ENEMIES SLAIN</div>
            <div className="text-lg font-black text-cyan-300 tabular-nums">
              {saveData.enemiesDefeated}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3">
            <div className="text-[10px] text-slate-400">PLAYER LEVEL</div>
            <div className="text-lg font-black text-cyan-300 tabular-nums">
              LVL {saveData.playerLevel}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3">
            <div className="text-[10px] text-slate-400">MEMORY CHOICE</div>
            <div className="text-xs font-black text-amber-300 mt-1">
              {saveData.decisionArchive === 'SAVE_MEMORY' ? 'CONSCIOUSNESS SAVED' : 'ARCHIVE PURGED'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3">
            <div className="text-[10px] text-slate-400">RESISTANCE TRUST</div>
            <div className="text-lg font-black text-cyan-300 tabular-nums">
              {saveData.resistanceTrust >= 0 ? `+${saveData.resistanceTrust}` : saveData.resistanceTrust}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              SoundEngine.get().playInteract();
              onRestart();
            }}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs tracking-widest transition-all cursor-pointer"
          >
            PLAY CHAPTER 01 AGAIN (NEW GAME+)
          </button>
          <button
            onClick={() => {
              SoundEngine.get().playInteract();
              onReturnToMenu();
            }}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            RETURN TO TITLE MENU
          </button>
        </div>
      </div>
    </div>
  );
};
