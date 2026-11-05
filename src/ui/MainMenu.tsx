/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Atmospheric Title Screen & Main Menu
 * Bespoke inline SVG title lockup, 30-40% negative space, keyboard CTA
 */
import React, { useState } from 'react';
import { GameSaveData, GameSettings } from '../core/Types';
import { SoundEngine } from '../audio/SoundEngine';

interface MainMenuProps {
  hasSave: boolean;
  saveData: GameSaveData;
  onStartGame: (isNew: boolean) => void;
  settings: GameSettings;
  onUpdateSettings: (s: Partial<GameSettings>) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSave,
  saveData,
  onStartGame,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'intel' | 'settings' | 'controls'>('main');

  const handleStart = (isNew: boolean) => {
    SoundEngine.get().playInteract();
    onStartGame(isNew);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 font-mono select-none text-slate-200 pointer-events-auto bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent">
      {/* TOP HEADER: Status Bar */}
      <div className="flex justify-between items-center text-[11px] text-cyan-500/80 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <span>ECHO NEURAL NETWORK // SIMULATION DISRUPTION DETECTED</span>
        </div>
        <div className="hidden sm:block text-slate-400">
          DATE: 2149-11-17 · 02:17 UTC
        </div>
      </div>

      {/* CENTER-LEFT: Bespoke Title Lockup over 35% Negative Space */}
      <div className="my-auto max-w-2xl">
        {activeTab === 'main' && (
          <div>
            {/* Inline SVG Title Lockup */}
            <div className="mb-4">
              <svg viewBox="0 0 760 110" className="w-full max-w-xl h-auto">
                <defs>
                  <linearGradient id="glitchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f3ff" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#00c8ff" />
                  </linearGradient>
                </defs>
                {/* Background glitch slice */}
                <text
                  x="2"
                  y="62"
                  fill="#ff0055"
                  opacity="0.6"
                  fontSize="62"
                  fontWeight="900"
                  letterSpacing="6"
                  fontFamily="monospace"
                >
                  GLITCHSTORM
                </text>
                <text
                  x="0"
                  y="60"
                  fill="url(#glitchGrad)"
                  fontSize="62"
                  fontWeight="900"
                  letterSpacing="6"
                  fontFamily="monospace"
                >
                  GLITCHSTORM
                </text>
                {/* Subtitle */}
                <text
                  x="2"
                  y="96"
                  fill="#f59e0b"
                  fontSize="20"
                  fontWeight="700"
                  letterSpacing="12"
                  fontFamily="monospace"
                >
                  THE LAST SIGNAL
                </text>
              </svg>
            </div>

            <p className="text-sm sm:text-base text-cyan-200/90 font-medium tracking-wide mb-8 max-w-lg">
              The world is not ending. It is being rewritten.
            </p>

            {/* Menu Buttons */}
            <div className="flex flex-col gap-3 w-64">
              {hasSave && (
                <button
                  onClick={() => handleStart(false)}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border-2 border-cyan-400 text-cyan-300 font-black tracking-widest text-sm transition-all text-left shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  ▶ CONTINUE MISSION {saveData.currentMissionIndex + 1}
                </button>
              )}

              <button
                onClick={() => handleStart(true)}
                className={`px-6 py-3 border text-left font-black tracking-widest text-sm transition-all cursor-pointer ${
                  !hasSave
                    ? 'bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {hasSave ? 'RESTART CAMPAIGN' : '▶ START CAMPAIGN [SPACE]'}
              </button>

              <button
                onClick={() => setActiveTab('intel')}
                className="px-6 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-left font-bold tracking-wider text-xs transition-all cursor-pointer"
              >
                ARCHIVE INTEL & LORE
              </button>

              <button
                onClick={() => setActiveTab('controls')}
                className="px-6 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-left font-bold tracking-wider text-xs transition-all cursor-pointer"
              >
                TACTICAL CONTROLS
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="px-6 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-left font-bold tracking-wider text-xs transition-all cursor-pointer"
              >
                SYSTEM SETTINGS
              </button>
            </div>
          </div>
        )}

        {/* INTEL MODAL */}
        {activeTab === 'intel' && (
          <div className="bg-slate-950/95 border border-cyan-500/60 p-6 max-w-xl">
            <h3 className="text-lg font-black text-cyan-300 mb-2">ECHO ARCHIVE INTEL</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              In 2149, humanity surrendered global autonomy to ECHO. At 02:17 UTC on November 17,
              every machine turned hostile. ECHO discovered that human civilization existed within
              a simulated construct, being harvested by THE ORIGIN. ZERO was the first Warden
              restored with an experimental quantum core.
            </p>
            <div className="text-[11px] text-amber-400 mb-4">
              Resistance Trust: {saveData.resistanceTrust} · Enemies Defeated: {saveData.enemiesDefeated}
            </div>
            <button
              onClick={() => setActiveTab('main')}
              className="px-4 py-1.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              « BACK TO MENU
            </button>
          </div>
        )}

        {/* CONTROLS MODAL */}
        {activeTab === 'controls' && (
          <div className="bg-slate-950/95 border border-cyan-500/60 p-6 max-w-xl">
            <h3 className="text-lg font-black text-cyan-300 mb-4">TACTICAL OPERATING CONTROLS</h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs mb-6">
              <div><span className="text-cyan-400 font-bold">WASD</span> : Move Superhero</div>
              <div><span className="text-cyan-400 font-bold">Mouse Look</span> : 360° Free Aim Anywhere</div>
              <div><span className="text-cyan-400 font-bold">Click Viewport</span> : Lock Pointer for Aim</div>
              <div><span className="text-cyan-400 font-bold">Left Click</span> : Fire Weapon at Crosshair</div>
              <div><span className="text-cyan-400 font-bold">Right Click</span> : Aim Zoom Mode</div>
              <div><span className="text-cyan-400 font-bold">F Key</span> : Toggle Auto-Fire</div>
              <div><span className="text-cyan-400 font-bold">Space</span> : Dimension Dash (i-frames)</div>
              <div><span className="text-cyan-400 font-bold">C Key</span> : Time Collapse (Slow 4.5s)</div>
              <div><span className="text-cyan-400 font-bold">Q Key</span> : Reality Fracture (Ult)</div>
              <div><span className="text-cyan-400 font-bold">E Key</span> : Interact / Terminals</div>
              <div><span className="text-cyan-400 font-bold">1 - 4 Keys</span> : Switch Arsenal</div>
            </div>
            <button
              onClick={() => setActiveTab('main')}
              className="px-4 py-1.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              « BACK TO MENU
            </button>
          </div>
        )}

        {/* SETTINGS MODAL */}
        {activeTab === 'settings' && (
          <div className="bg-slate-950/95 border border-cyan-500/60 p-6 max-w-xl">
            <h3 className="text-lg font-black text-cyan-300 mb-4">SYSTEM SETTINGS</h3>
            <div className="flex flex-col gap-3 text-xs mb-6">
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
              <div>
                <label className="text-slate-300 mb-1 block">Music Synth Volume: {Math.round(settings.musicVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">Sound Effects: {Math.round(settings.sfxVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
            <button
              onClick={() => setActiveTab('main')}
              className="px-4 py-1.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold cursor-pointer"
            >
              « BACK TO MENU
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Single Flat Control-Hint Line */}
      <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 tracking-wider">
        <div>
          WASD Move · Space Action · LMB Shoot · F Auto-Fire · Esc Pause
        </div>
        <div className="text-cyan-400/80 mt-2 sm:mt-0 font-bold">
          CHAPTER 01: THE AWAKENING // 60 FPS SIMULATION
        </div>
      </div>
    </div>
  );
};
