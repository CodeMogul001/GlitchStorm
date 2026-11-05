/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Tactical Pause Menu & Checkpoint Recovery
 */
import React from 'react';
import { GameSettings, MissionDef } from '../core/Types';
import { SoundEngine } from '../audio/SoundEngine';

interface PauseModalProps {
  mission: MissionDef;
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onReturnToMenu: () => void;
  settings: GameSettings;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  mission,
  onResume,
  onRestartCheckpoint,
  onReturnToMenu,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 font-mono select-none px-4 pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-950 border-2 border-cyan-500/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
          <div className="text-white font-black text-xl tracking-wider">
            TACTICAL SIMULATION PAUSED
          </div>
          <button
            onClick={onResume}
            className="text-cyan-400 hover:text-white text-xs font-bold px-2 py-1 border border-cyan-800 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Current Objective Status */}
        <div className="bg-slate-900/80 border border-slate-800 p-3 mb-6">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
            MISSION 0{mission.number} // {mission.title}
          </div>
          <div className="text-xs text-slate-300">
            {mission.location}
          </div>
          <div className="mt-2 text-[11px] text-amber-300 font-medium">
            Active Directive: {mission.steps.find((s) => !s.completed)?.label || 'All objectives clear'}
          </div>
        </div>

        {/* Volume & Audio Quick Adjust */}
        <div className="flex flex-col gap-3 mb-6 text-xs">
          <div>
            <label className="text-slate-300 mb-1 block">Master Volume: {Math.round(settings.masterVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              SoundEngine.get().playInteract();
              onResume();
            }}
            className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-400 text-cyan-200 font-black text-xs tracking-widest transition-all cursor-pointer"
          >
            RESUME SIMULATION [ESC]
          </button>

          <button
            onClick={() => {
              SoundEngine.get().playInteract();
              onRestartCheckpoint();
            }}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs tracking-wider transition-all cursor-pointer"
          >
            RESTART MISSION CHECKPOINT
          </button>

          <button
            onClick={() => {
              SoundEngine.get().playInteract();
              onReturnToMenu();
            }}
            className="w-full py-2 bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 font-bold text-xs tracking-wider transition-all cursor-pointer"
          >
            RETURN TO TITLE MENU
          </button>
        </div>
      </div>
    </div>
  );
};
