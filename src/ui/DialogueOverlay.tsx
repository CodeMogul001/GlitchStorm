/**
 * GLITCHSTORM: THE LAST SIGNAL
 * Comms Dialogue & Decision Overlay
 */
import React, { useState } from 'react';
import { DecisionChoice, DialogueSequence } from '../core/Types';
import { SoundEngine } from '../audio/SoundEngine';

interface DialogueOverlayProps {
  dialogue: DialogueSequence;
  onClose: () => void;
  onDecisionMade?: (choice: DecisionChoice) => void;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({
  dialogue,
  onClose,
  onDecisionMade,
}) => {
  const [lineIndex, setLineIndex] = useState(0);

  const currentLine = dialogue.lines[lineIndex];
  const isLastLine = lineIndex >= dialogue.lines.length - 1;
  const showDecision = isLastLine && dialogue.decisionPrompt;

  const handleNext = () => {
    if (showDecision) return; // user must pick a choice
    SoundEngine.get().playRadioComms();
    if (isLastLine) {
      if (dialogue.onComplete) dialogue.onComplete();
      onClose();
    } else {
      setLineIndex((prev) => prev + 1);
    }
  };

  const handleChoice = (id: DecisionChoice) => {
    SoundEngine.get().playInteract();
    if (onDecisionMade) onDecisionMade(id);
    if (dialogue.onComplete) dialogue.onComplete();
    onClose();
  };

  const getSpeakerColor = () => {
    if (currentLine.speaker === 'LYRA') return 'text-cyan-400 border-cyan-500/60 bg-cyan-950/80';
    if (currentLine.speaker === 'ZERO') return 'text-amber-400 border-amber-500/60 bg-amber-950/80';
    if (currentLine.speaker === 'DR. VOSS') return 'text-purple-400 border-purple-500/60 bg-purple-950/80';
    if (currentLine.speaker === 'THE WARDEN') return 'text-red-500 border-red-600/80 bg-red-950/80';
    return 'text-emerald-400 border-emerald-500/60 bg-emerald-950/80';
  };

  return (
    <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center pointer-events-auto px-4 font-mono select-none">
      <div className="w-full max-w-2xl bg-slate-950/95 border-2 border-cyan-500/80 shadow-[0_0_30px_rgba(0,0,0,0.95)] p-4 relative">
        {/* Top Header & Comms Waveform */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-black tracking-widest border ${getSpeakerColor()}`}>
              TRANSMISSION // {currentLine.speaker}
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider">SEC-LINK: ENCRYPTED</span>
          </div>

          {/* Animated Cyber Audio Waveform */}
          <div className="flex items-end gap-1 h-3">
            {[4, 8, 12, 6, 14, 10, 5, 12, 7].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-cyan-400/80 animate-pulse"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: '600ms',
                }}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex gap-4 items-start">
          {/* Portrait Icon */}
          <div className="w-14 h-14 bg-slate-900 border border-cyan-500/50 flex-shrink-0 flex items-center justify-center text-cyan-300 font-black text-xl">
            {currentLine.speaker === 'LYRA'
              ? 'Ψ'
              : currentLine.speaker === 'ZERO'
              ? 'Ø'
              : currentLine.speaker === 'DR. VOSS'
              ? 'Δ'
              : currentLine.speaker === 'THE WARDEN'
              ? 'Ω'
              : '⚡'}
          </div>

          <div className="flex-1">
            <p className="text-white text-sm sm:text-base leading-relaxed tracking-wide min-h-[3.5rem]">
              {currentLine.text}
            </p>
          </div>
        </div>

        {/* DECISION PROMPT (Meaningful Choice) */}
        {showDecision && (
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="text-amber-400 text-xs font-black tracking-widest mb-2">
              CRITICAL PROTOCOL: {dialogue.decisionPrompt!.question}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dialogue.decisionPrompt!.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  className="p-2.5 bg-slate-900/90 border border-amber-500/60 hover:border-amber-400 hover:bg-amber-500/20 text-left transition-all cursor-pointer group"
                >
                  <div className="text-amber-300 font-bold text-xs tracking-wider group-hover:text-amber-200">
                    {choice.label}
                  </div>
                  <div className="text-slate-300 text-[11px] mt-1">
                    {choice.description}
                  </div>
                  <div className="text-[10px] text-cyan-400/80 mt-1.5 italic">
                    {choice.consequenceHint}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next / Dismiss Button */}
        {!showDecision && (
          <div className="flex justify-end mt-3">
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-200 text-xs font-bold tracking-widest transition-all cursor-pointer"
            >
              {isLastLine ? 'CONTINUE [SPACE]' : 'NEXT >>'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
