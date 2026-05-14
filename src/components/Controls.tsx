import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Mic, 
  Music, 
  Type, 
  Maximize2, 
  Zap, 
  Layers, 
  Palette,
  ChevronUp,
  ChevronDown,
  X,
  Upload,
  Languages,
  Activity,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { useVJ } from '../context/VJContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface ControlsProps {
  onMicRequest: () => void;
  onFileDrop: (file: File) => void;
  isAudioReady: boolean;
  error?: string | null;
}

const Slider = ({ label, value, min, max, step = 0.1, onChange, unit = '' }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const handlePointerMoveRef = useRef<((moveEvent: PointerEvent) => void) | null>(null);
  const handlePointerUpRef = useRef<(() => void) | null>(null);

  const updateValue = (clientX: number) => {
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const percent = (clientX - rect.left) / rect.width;
      const constrainedPercent = Math.min(1, Math.max(0, percent));
      const val = min + (max - min) * constrainedPercent;
      const steppedVal = Math.round(val / step) * step;
      onChange(Math.min(max, Math.max(min, steppedVal)));
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientX);
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateValue(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    handlePointerMoveRef.current = handlePointerMove;
    handlePointerUpRef.current = handlePointerUp;
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="flex flex-col gap-1.5 mb-6 group/slider select-none">
      <div className="flex justify-between items-end mb-0.5">
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#888] font-mono group-hover/slider:text-[#10b981] transition-colors font-bold">
          {label}
        </span>
        <span className={cn(
          "text-[9px] font-mono transition-all px-1.5 py-0.5 rounded bg-black/40 border border-white/5",
          isDragging ? "text-[#10b981] border-[#10b981]/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "text-white/60"
        )}>
          {typeof value === 'number' ? (step < 1 ? value.toFixed(2) : Math.round(value)) : value}{unit}
        </span>
      </div>
      <div 
        ref={trackRef}
        onPointerDown={handlePointerDown}
        className="relative h-5 flex items-center group/track cursor-pointer touch-none"
      >
        {/* Background Track - Modular Grid Style */}
        <div className="absolute w-full h-[6px] bg-black/40 rounded-sm overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4px_100%]" />
          {/* Progress Fill */}
          <motion.div 
            className="absolute left-0 h-full bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            initial={false}
            animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
            transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 30, stiffness: 400, mass: 1 }}
          />
        </div>

        {/* Draggable Handle - Technical Indicator Style */}
        <motion.div
          className={cn(
            "absolute h-7 w-[2px] z-20 transition-all",
            isDragging ? "bg-white scale-x-150" : "bg-[#10b981] group-hover/track:bg-white"
          )}
          animate={{ left: `${((value - min) / (max - min)) * 100}%` }}
          transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 30, stiffness: 400, mass: 1 }}
        />
      </div>
    </div>
  );
};

export const Controls: React.FC<ControlsProps> = ({ onMicRequest, onFileDrop, isAudioReady, error }) => {
  const { config, setConfig } = useVJ();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'text' | 'visual' | 'audio'>('text');
  const [isMinimized, setIsMinimized] = useState(false);
  const t = translations[config.lang];

  const randomize = () => {
    setConfig({
      fontSize: Math.floor(Math.random() * (35 - 10 + 1) + 10),
      weight: Math.floor(Math.random() * (900 - 100 + 1) + 100),
      spacing: parseFloat((Math.random() * (0.4 - (-0.1)) + (-0.1)).toFixed(2)),
      width: parseFloat((Math.random() * (4 - 0.5) + 0.5).toFixed(1)),
      chaos: parseFloat(Math.random().toFixed(2)),
      glow: parseFloat((Math.random() * 1.5).toFixed(1)),
      slice: parseFloat((Math.random() * 1.5).toFixed(1)),
      aberration: parseFloat((Math.random() * 1.5).toFixed(1)),
      wave: parseFloat((Math.random() * 1.5).toFixed(1)),
    });
  };

  return (
    <div className="w-full h-full">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-8 left-8 z-[100] size-12 bg-black/80 backdrop-blur-xl border border-[#10b981]/30 rounded-xl flex items-center justify-center text-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-[#10b981] hover:text-black transition-all"
          >
            <Settings size={20} className="animate-[spin_4s_linear_infinite]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-8 top-8 w-80 h-[calc(100vh-4rem)] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] flex flex-col z-[100] pointer-events-auto"
          >
            {/* Title Bar - Fixed Panel */}
            <div className="h-10 bg-white/[0.03] border-b border-white/10 flex items-center justify-between px-4 select-none">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-[#10b981] animate-pulse" />
                <span className="text-[10px] font-black font-mono tracking-[0.3em] text-white opacity-60 uppercase">{t.engineTitle} // L-01</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/30 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex flex-col"
                >
                  {/* Tabs Selector - Vertical Layout for better space */}
                  <div className="flex border-b border-white/10 bg-black/40">
                    {[
                      { id: 'text', icon: Type, label: t.tabText },
                      { id: 'visual', icon: Sliders, label: t.tabVisual },
                      { id: 'audio', icon: AudioWaveform, label: t.tabAudio }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex-1 h-12 flex flex-col items-center justify-center gap-1 transition-all border-r border-white/5 last:border-0",
                          activeTab === tab.id 
                            ? "bg-[#10b981]/10 text-[#10b981]" 
                            : "text-[#555] hover:text-white/60 hover:bg-white/[0.02]"
                        )}
                      >
                        <tab.icon size={14} className={cn(activeTab === tab.id ? "opacity-100" : "opacity-40")} />
                        <span className="text-[10px] uppercase font-bold tracking-widest leading-none scale-75">{tab.label}</span>
                        {activeTab === tab.id && (
                          <motion.div layoutId="activeTab" className="absolute bottom-0 w-full h-[2px] bg-[#10b981]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar-minimal space-y-6">
                    {activeTab === 'text' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-widest text-[#555] font-mono font-bold">{t.headlineText}</span>
                            <span className="text-[8px] font-mono text-white/20">UTF-8 // STRING</span>
                          </div>
                          <div className="relative group">
                            <textarea 
                              value={config.text}
                              onChange={(e) => setConfig({ text: e.target.value })}
                              className="w-full bg-black/60 border border-white/10 rounded p-3 text-sm font-sans focus:outline-none focus:border-[#10b981]/50 transition-all min-h-[100px] resize-none text-white tracking-wide"
                              placeholder="INPUT_DATA..."
                            />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="size-1 rounded-full bg-white/10" />
                              <div className="size-1 rounded-full bg-white/10" />
                              <div className="size-1 rounded-full bg-[#10b981]" />
                            </div>
                          </div>
                        </div>
                        <Slider label="Scale" value={config.fontSize} min={5} max={40} step={1} unit="vw" onChange={(v: number) => setConfig({ fontSize: v })} />
                        <Slider label="Density" value={config.weight} min={100} max={900} step={10} onChange={(v: number) => setConfig({ weight: v })} />
                        <Slider label="Tracking" value={config.spacing} min={-0.2} max={0.5} step={0.01} onChange={(v: number) => setConfig({ spacing: v })} />
                      </motion.div>
                    )}

                    {activeTab === 'visual' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Style Engine Selector */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-widest text-[#555] font-mono font-bold">FX PROFILES</span>
                            <span className="text-[8px] font-mono text-[#10b981] bg-[#10b981]/10 px-1 rounded">READY</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { id: 'default', label: t.modeDefault },
                              { id: 'liquid', label: t.modeLiquid },
                              { id: 'glitch', label: t.modeGlitch },
                              { id: 'tech', label: t.modeTech },
                              { id: 'particle', label: t.modeParticle },
                              { id: 'industrial', label: t.modeIndustrial },
                              { id: 'cosmic', label: t.modeCosmic },
                              { id: 'noise', label: t.modeNoise }
                            ].map(m => (
                              <button
                                key={m.id}
                                onClick={() => setConfig({ mode: m.id as any })}
                                className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded border transition-all text-[10px] font-mono uppercase tracking-tighter group/mode",
                                  config.mode === m.id 
                                    ? "bg-[#10b981] text-black border-[#10b981] font-black" 
                                    : "bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:text-white/80"
                                )}
                              >
                                <span>{m.label}</span>
                                <div className={cn(
                                  "size-1 rounded-full",
                                  config.mode === m.id ? "bg-black" : "bg-white/10 group-hover/mode:bg-white/40"
                                )} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-[1px] bg-white/5" />

                        <div className="space-y-2">
                           <Slider label="Stretch" value={config.width} min={0.2} max={5} step={0.1} onChange={(v: number) => setConfig({ width: v })} />
                           <Slider label="Chaos" value={config.chaos} min={0} max={1} step={0.05} onChange={(v: number) => setConfig({ chaos: v })} />
                           <Slider label="Glow" value={config.glow} min={0} max={2} step={0.1} onChange={(v: number) => setConfig({ glow: v })} />
                           <Slider label="Aberration" value={config.aberration} min={0} max={2} step={0.1} onChange={(v: number) => setConfig({ aberration: v })} />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { key: 'strobe', label: 'STRB' },
                            { key: 'noise', label: 'GRIN' },
                            { key: 'trail', label: 'XPLD' }
                          ].map(opt => (
                            <button 
                              key={opt.key}
                              onClick={() => setConfig({ [opt.key]: !config[opt.key as keyof typeof config] })}
                              className={cn(
                                "py-2 rounded text-[9px] font-black transition-all border flex flex-col items-center justify-center gap-1",
                                config[opt.key as keyof typeof config] 
                                  ? "border-[#10b981] bg-[#10b981] text-black" 
                                  : "border-white/10 bg-white/[0.02] text-white/40"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-widest text-[#555] font-mono font-bold">CHROMA</span>
                            <div className="flex gap-1">
                              {['#FFFFFF', '#10b981', '#f43f5e', '#3b82f6'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => setConfig({ color: c })}
                                  className={cn(
                                    "size-4 rounded-full border transition-transform",
                                    config.color === c ? "scale-110 border-white ring-2 ring-white/20" : "border-white/10 hover:scale-105"
                                  )}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="relative group">
                            <input 
                              type="color"
                              value={config.color}
                              onChange={(e) => setConfig({ color: e.target.value })}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <div className="w-full h-11 bg-black/40 border border-white/10 rounded flex items-center justify-between px-4 group-hover:bg-black/60 transition-all">
                              <div className="flex items-center gap-3">
                                <Palette size={14} className="text-[#10b981]" />
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">{config.color}</span>
                              </div>
                              <span className="text-[8px] font-mono text-[#555]">HEX_VAL</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'audio' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative group p-4 bg-white/[0.03] border border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-white/[0.06] transition-all cursor-pointer">
                            <input 
                              type="file" 
                              accept="audio/*" 
                              className="absolute inset-0 opacity-0 cursor-pointer z-20"
                              onChange={(e) => e.target.files?.[0] && onFileDrop(e.target.files[0])}
                            />
                            <Upload className="text-[#555] group-hover:text-white transition-colors" size={20} />
                            <span className="text-[9px] uppercase font-bold tracking-widest text-[#555] group-hover:text-white">IMPORT</span>
                          </div>

                          <button 
                            onClick={onMicRequest}
                            className={cn(
                              "relative group p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all border",
                              isAudioReady 
                                ? "bg-[#10b981] border-[#10b981] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                                : "bg-white/[0.03] border-white/10 text-[#555] hover:text-white hover:border-white/30"
                            )}
                          >
                            <Mic size={20} className={cn(isAudioReady && "animate-pulse")} />
                            <span className="text-[9px] uppercase font-bold tracking-widest">LIVE_MIC</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] uppercase tracking-widest text-[#555] font-mono font-bold">SIGNAL ANALYSIS</span>
                            <span className={cn(
                              "text-[9px] font-mono",
                              isAudioReady ? "text-[#10b981]" : "text-white/20"
                            )}>{isAudioReady ? 'OK' : 'WAITING'}</span>
                          </div>
                          
                          <div className="grid grid-cols-24 gap-[1px] h-16 bg-black/60 rounded border border-white/5 p-1.5 overflow-hidden">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <div key={i} className="bg-white/[0.02] relative h-full flex flex-col justify-end">
                                <motion.div 
                                  className={cn(
                                    "w-full rounded-t-[1px]",
                                    i < 4 ? "bg-red-500/80" : i < 16 ? "bg-[#10b981]/80" : "bg-blue-500/80"
                                  )}
                                  animate={{ 
                                    height: isAudioReady ? `${Math.random() * 90 + 5}%` : '0%' 
                                  }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-[8px] font-mono text-[#444] tracking-tighter">
                            <span>20HZ</span>
                            <span>BASS</span>
                            <span>MID</span>
                            <span>HIGH</span>
                            <span>20KHZ</span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#10b981]/5 border border-[#10b981]/10 rounded flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className={cn("size-2 rounded-full", isAudioReady ? "bg-[#10b981] animate-pulse" : "bg-white/10")} />
                             <span className="text-[9px] font-mono text-[#10b981]/80">GATE_THRESHOLD</span>
                           </div>
                           <span className="text-[9px] font-mono text-white/40">-48DB</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Actions / Footer */}
                  <div className="p-4 bg-black/40 border-t border-white/10 flex items-center gap-2">
                    <button 
                      onClick={randomize}
                      className="flex-1 h-10 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10b981] transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={14} />
                      {t.randomize}
                    </button>
                    <button 
                      onClick={() => setConfig({ lang: config.lang === 'en' ? 'zh' : 'en' })}
                      className="size-10 bg-white/[0.05] border border-white/10 text-white/40 hover:text-white transition-colors flex items-center justify-center font-mono text-xs"
                    >
                      {config.lang === 'en' ? 'CN' : 'EN'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
