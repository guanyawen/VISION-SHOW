import React, { useMemo, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useVJ } from '../context/VJContext';
import { AudioStats } from '../hooks/useAudio';
import { cn } from '../lib/utils';
import { translations } from '../translations';

interface VisualizerProps {
  audioStats: AudioStats;
}

const VisualLine = ({ 
  line, 
  index, 
  config, 
  audioStats, 
  bassSpring, 
  trebleSpring, 
  volumeSpring,
  strobeOpacity,
  slices
}: { 
  line: string; 
  index: number; 
  config: any; 
  audioStats: AudioStats;
  bassSpring: any;
  trebleSpring: any;
  volumeSpring: any;
  strobeOpacity: any;
  slices: any[];
}) => {
  const lineScaleCosmic = useTransform(bassSpring, [0, 1], [1, 1.4]);
  const lineScaleParticle = useTransform(trebleSpring, [0, 1], [1, 1.1]);
  
  const aberrationX1 = useTransform(bassSpring, (v: number) => v * 15 * config.aberration);
  const aberrationY1 = useTransform(trebleSpring, (v: number) => v * 8 * config.aberration);
  const aberrationX2 = useTransform(bassSpring, (v: number) => -v * 15 * config.aberration);
  const aberrationY2 = useTransform(trebleSpring, (v: number) => -v * 8 * config.aberration);
  
  const floorScaleY = useTransform(bassSpring, [0, 1], [1.5, 2.2]);
  const floorX = useTransform(trebleSpring, (v: number) => Math.sin(Date.now() / 800) * v * 40);
  const midX = useTransform(trebleSpring, (v: number) => Math.cos(Date.now() / 1200) * v * 30);
  
  const topX = useTransform(trebleSpring, (v: number) => 
    Math.sin(Date.now() / (config.mode === 'industrial' ? 400 : 1000) + index) * v * (config.mode === 'industrial' ? 50 : 20) * config.chaos
  );

  return (
    <div className="relative">
      {/* Mode-Specific Layering */}
      
      {/* GLITCH MODE LAYERS */}
      {config.mode === 'glitch' && (
        <>
          <motion.div
            className="absolute inset-0 text-cyan-400 opacity-50 font-sans font-black uppercase italic overflow-hidden mix-blend-screen"
            animate={{ 
              x: [0, -5, 5, -2, 0],
              opacity: [0.5, 0.2, 0.8, 0.4, 0.5]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: 'reverse' }}
          >
            {line}
          </motion.div>
          <motion.div
            className="absolute inset-0 text-red-500 opacity-50 font-sans font-black uppercase italic overflow-hidden mix-blend-screen"
            animate={{ 
              x: [0, 5, -3, 2, 0],
              opacity: [0.5, 0.8, 0.3, 0.6, 0.5]
            }}
            transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
          >
            {line}
          </motion.div>
        </>
      )}

      {/* TECH MODE LAYERS */}
      {config.mode === 'tech' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
          style={{ WebkitTextStroke: '0.5px white', color: 'transparent' }}
        >
          <div className="absolute h-[150%] w-[1px] bg-white/20 -left-10" />
          <div className="absolute h-[1px] w-[250%] bg-white/20 top-1/2" />
          <span className="absolute -top-10 left-0 text-[8px] font-mono whitespace-nowrap">STATUS: MONITORING_FREQ_{Math.round(audioStats.volume * 100)}</span>
        </motion.div>
      )}

      {/* INDUSTRIAL MODE LAYERS */}
      {config.mode === 'industrial' && (
        <motion.div
          className="absolute inset-0 opacity-10 blur-[10px] scale-[1.2] brightness-200"
          animate={{ x: [-10, 10, -10], y: [5, -5, 5] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        >
          {line}
        </motion.div>
      )}

      {/* PARTICLE MODE LAYERS */}
      {config.mode === 'particle' && (
        <motion.div
          className="absolute pointer-events-none font-sans font-black uppercase italic opacity-20"
          style={{ 
            textShadow: `0 0 20px ${config.color}`,
            scale: lineScaleParticle
          }}
        >
          {line}
        </motion.div>
      )}

      {/* COSMIC MODE LAYERS */}
      {config.mode === 'cosmic' && (
        <motion.div
          className="absolute pointer-events-none font-sans font-black uppercase italic blur-[20px] opacity-30"
          style={{ 
            color: config.color,
            scale: lineScaleCosmic
          }}
        >
          {line}
        </motion.div>
      )}

      {/* NOISE MODE LAYERS */}
      {config.mode === 'noise' && (
        <motion.div
          className="absolute inset-0 opacity-50 contrast-150 saturate-0 mix-blend-overlay pointer-events-none"
          animate={{ 
            x: [-2, 2, -1], 
            y: [1, -1, 1],
            filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)']
          }}
          transition={{ duration: 0.05, repeat: Infinity }}
        >
          {line}
        </motion.div>
      )}

      {/* Slice Layers */}
      {(config.mode === 'default' || config.mode === 'liquid') && slices.map((s, si) => (
        <SliceLayer 
          key={si}
          line={line}
          slice={s}
          bassSpring={bassSpring}
          config={config}
        />
      ))}

      {/* Color Aberration (Cyan) */}
      <motion.div
        className="absolute opacity-40 font-sans font-black uppercase whitespace-nowrap pointer-events-none select-none mix-blend-screen text-cyan-400 blur-[1px]"
        style={{
          x: aberrationX1,
          y: aberrationY1,
        }}
      >
        {line}
      </motion.div>

      {/* Color Aberration (Red) */}
      <motion.div
        className="absolute opacity-40 font-sans font-black uppercase whitespace-nowrap pointer-events-none select-none mix-blend-screen text-red-500 blur-[1px]"
        style={{
          x: aberrationX2,
          y: aberrationY2,
        }}
      >
        {line}
      </motion.div>

      {/* Back Layer: Outlined & Stretched */}
      <motion.div
        className="absolute opacity-10 blur-[2px] font-sans font-black uppercase whitespace-nowrap pointer-events-none select-none"
        style={{
          WebkitTextStroke: '1px currentColor',
          color: 'transparent',
          scaleY: floorScaleY,
          skewX: 12,
          x: floorX,
          fontSize: `${config.fontSize * 1.1}vw`,
        }}
      >
        {line}
      </motion.div>

      {/* Mid Layer: Blurred & Distorted */}
      <motion.div
        className="absolute opacity-20 blur-[8px] font-sans font-black uppercase whitespace-nowrap pointer-events-none select-none"
        style={{
          scaleX: 1.2,
          x: midX,
        }}
      >
        {line}
      </motion.div>

      {/* Top Layer: Sharp & Variable */}
      <motion.div
        className={cn(
          "text-variable vj-stretch whitespace-nowrap font-sans font-black uppercase italic relative z-10",
          config.mode === 'industrial' && "skew-x-[-15deg] tracking-tighter",
          config.mode === 'liquid' && "tracking-widest"
        )}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, type: 'spring' }}
        style={{
          x: topX,
          scaleY: config.mode === 'industrial' ? 1.2 : 0.95,
          filter: config.mode === 'liquid' ? 'blur(0.8px)' : 'none'
        }}
      >
        {line}
      </motion.div>
    </div>
  );
};

const SliceLayer = ({ line, slice, bassSpring, config }: { line: string; slice: any; bassSpring: any; config: any }) => {
  const x = useTransform(bassSpring, (v: number) => slice.offset * v * config.slice * 2.5);
  
  return (
    <motion.div
      className="absolute left-0 right-0 whitespace-nowrap font-sans font-black uppercase italic pointer-events-none"
      style={{
        clipPath: `inset(${slice.top}% 0 ${100 - slice.bottom}% 0)`,
        x,
        opacity: 0.6,
        fontSize: `${config.fontSize}vw`,
      }}
    >
      {line}
    </motion.div>
  );
};

export const Visualizer: React.FC<VisualizerProps> = ({ audioStats }) => {
  const { config } = useVJ();
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[config.lang];

  // Smooth springs for audio reactivity
  const volumeSpring = useSpring(0, { damping: 20, stiffness: 100 });
  const bassSpring = useSpring(0, { damping: 15, stiffness: 200 });
  const trebleSpring = useSpring(0, { damping: 10, stiffness: 300 });

  useEffect(() => {
    volumeSpring.set(audioStats.volume);
    bassSpring.set(audioStats.bass);
    trebleSpring.set(audioStats.treble);
  }, [audioStats, volumeSpring, bassSpring, trebleSpring]);

  // Derived reactive values
  const scale = useTransform(bassSpring, [0, 1], [1, 1 + config.chaos * 2]);
  const weight = useTransform(volumeSpring, [0, 1], [config.weight, Math.min(900, config.weight + 400 * config.chaos)]);
  const slant = useTransform(trebleSpring, [0, 1], [config.slant, config.slant + 10 * config.chaos]);
  const stretch = useTransform(bassSpring, [0, 1], [config.width, config.width + config.chaos * 3]);

  // Displacement values for liquefy filter
  const displaceScale = useTransform(volumeSpring, [0, 1], [0, 60 * config.chaos * config.wave]);

  // Slices generation for the "split" effect seen in the video
  const SLICE_COUNT = 5;
  const slices = useMemo(() => {
    return Array.from({ length: SLICE_COUNT }).map((_, i) => ({
      top: (i / SLICE_COUNT) * 100,
      bottom: ((i + 1) / SLICE_COUNT) * 100,
      offset: (i % 2 === 0 ? 1 : -1) * (i + 1) * 20
    }));
  }, []);

  // Split text for individual animation if needed
  const lines = useMemo(() => config.text.split('\n'), [config.text]);

  const strobeOpacity = useTransform(bassSpring, [0.7, 0.8], [1, 0.1]);
  const underlineScale = useTransform(bassSpring, [0, 1], [0.5, 1.2]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none"
      style={{ backgroundColor: config.background }}
    >
      <svg className="absolute w-0 h-0 invisible">
        <filter id="liquefy" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="2"
            result="noise"
          >
            <animate attributeName="baseFrequency" values="0.015;0.02;0.015" dur="15s" repeatCount="indefinite" />
          </feTurbulence>
          <motion.feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale={displaceScale} 
          />
        </filter>
      </svg>

      {/* Theme Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]" />

      {/* Overlays & Backgrounds per mode */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {config.mode === 'cosmic' && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:40px_40px]" />
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/40 rounded-full blur-[150px]" 
            />
          </div>
        )}
        {config.mode === 'tech' && (
          <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4vw_4vw]" />
        )}
        {config.mode === 'noise' && (
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        )}
        {config.mode === 'industrial' && (
          <motion.div 
            animate={{ opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 0.1, repeat: Infinity }}
            className="absolute inset-0 bg-white mix-blend-difference" 
          />
        )}
        {config.mode === 'particle' && (
           <div className="absolute inset-0 overflow-hidden">
             {Array.from({ length: 20 }).map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute size-1 bg-white rounded-full opacity-20"
                 animate={{ 
                   y: ['100vh', '-10vh'],
                   x: `${Math.random() * 100}vw`
                 }}
                 transition={{ 
                   duration: Math.random() * 5 + 5, 
                   repeat: Infinity, 
                   ease: "linear",
                   delay: Math.random() * 5
                 }}
               />
             ))}
           </div>
        )}
      </div>

      {/* Main Typography Stage */}
      <div className="flex-1 w-full flex items-center justify-center relative scale-[1.05]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${config.text}-${config.mode}`}
            className={cn(
              "relative z-10 flex flex-col items-center justify-center text-center",
              config.mode === 'industrial' && "brightness-150 contrast-125"
            )}
            style={{
              color: config.color,
              fontSize: `${config.fontSize}vw`,
              letterSpacing: `${config.spacing}em`,
              lineHeight: 0.9,
              filter: `url(#liquefy) ${config.blur > 0 ? `blur(${config.blur}px)` : ''}`,
              textShadow: config.glow > 0 ? `0 0 ${config.glow * (config.mode === 'cosmic' ? 80 : 40)}px ${config.color}88` : 'none',
              opacity: config.strobe ? strobeOpacity : 1,
              // Custom CSS properties for variable font
              // @ts-ignore
              '--wght': weight,
              '--slnt': slant,
              '--stretch': stretch,
            } as any}
          >
            {lines.map((line, i) => (
              <VisualLine 
                key={i}
                line={line}
                index={i}
                config={config}
                audioStats={audioStats}
                bassSpring={bassSpring}
                trebleSpring={trebleSpring}
                volumeSpring={volumeSpring}
                strobeOpacity={strobeOpacity}
                slices={slices}
              />
            ))}
            {/* Visual Underline Detail from theme */}
            <motion.div 
              className="absolute -bottom-8 w-full h-1 bg-[#10b981] shadow-[0_0_20px_#10b981]"
              style={{ scaleX: underlineScale }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Visualizer Floor - Responsive Frequency Bars */}
        <div className="absolute bottom-12 w-full px-12 flex items-end justify-between gap-1 h-32 opacity-40">
          {Array.from({ length: 32 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn("flex-1", i % 4 === 0 ? "bg-[#10b981]" : "bg-white/40")}
              animate={{ 
                height: `${Math.max(10, (audioStats.frequencies[i * 4] || 10) / 2.5)}%` 
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          ))}
        </div>
      </div>

      {/* Overlays */}
      <div className={cn("vj-scanlines", !config.noise && "hidden")} />
      <div className={cn("vj-grain", !config.noise && "hidden")} />
      <div className={cn("crt-curve", config.mode !== 'noise' && "hidden")} />
    </div>
  );
};
