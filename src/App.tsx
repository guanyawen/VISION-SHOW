/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAudio } from './hooks/useAudio';
import { Visualizer } from './components/Visualizer';
import { Controls } from './components/Controls';
import { VJProvider, useVJ } from './context/VJContext';
import { motion, AnimatePresence } from 'motion/react';
import { AudioWaveform as Waveform, Info, Mic, Upload } from 'lucide-react';
import { translations } from './translations';

const AppContent = () => {
  const { isAudioReady, stats, error, handleMicInput, handleFileUpload } = useAudio();
  const { config, setConfig } = useVJ();
  const [showSplash, setShowSplash] = useState(true);
  const t = translations[config.lang];

  return (
    <main className="relative w-full h-screen bg-[#050505] overflow-hidden">
      {/* VJ Visual Engine */}
      <Visualizer audioStats={stats} />

      {/* Control Interface */}
      <Controls 
        onMicRequest={handleMicInput} 
        onFileDrop={handleFileUpload}
        isAudioReady={isAudioReady} 
        error={error}
      />

      {/* Onboarding / Splash Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center p-8 select-none"
          >
            {/* Language switch on splash */}
            <div className="absolute top-8 right-8">
               <button 
                onClick={() => setConfig({ lang: config.lang === 'en' ? 'zh' : 'en' })}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-xs font-mono hover:bg-white/10 transition-all font-sans"
              >
                {config.lang === 'en' ? '切换至中文' : 'SWITCH TO ENGLISH'}
              </button>
            </div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl text-center"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-[1px] w-12 bg-white/20" />
                <Waveform className="text-white opacity-40 animate-pulse" size={32} />
                <div className="h-[1px] w-12 bg-white/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <button 
                  onClick={() => { handleMicInput(); setShowSplash(false); }}
                  className="group relative px-8 py-8 border-2 border-white/20 hover:border-[#10b981] transition-all bg-transparent overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[#10b981]/0 group-hover:bg-[#10b981]/5 transition-colors" />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <Mic className="text-white group-hover:text-[#10b981] transition-colors" size={24} />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em] text-white">
                      {t.startMic}
                    </span>
                  </div>
                </button>
                <div className="group relative px-8 py-8 border-2 border-white/10 border-dashed hover:border-white transition-all bg-transparent flex flex-col items-center justify-center gap-3">
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onChange={(e) => {
                      if(e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                        setShowSplash(false);
                      }
                    }}
                  />
                  <Upload className="text-[#444] group-hover:text-white transition-colors" size={24} />
                  <span className="text-[10px] font-black font-mono uppercase tracking-[0.3em] text-[#444] group-hover:text-white">
                    {t.dropAudio}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Credit */}
            <div className="absolute bottom-8 left-0 w-full flex justify-center opacity-20">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white">
                {t.ver} // CORE_INIT
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redundant status indicator removed as it's now in the HUD */}
    </main>
  );
};

export default function App() {
  return (
    <VJProvider>
      <AppContent />
    </VJProvider>
  );
}

