import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioStats {
  volume: number;
  bass: number;
  mid: number;
  treble: number;
  lowEnergy: number; // For kicks
  highEnergy: number; // For snares/hats
  frequencies: Uint8Array;
  waveforms: Uint8Array;
}

export const useAudio = () => {
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AudioStats>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    lowEnergy: 0,
    highEnergy: 0,
    frequencies: new Uint8Array(0),
    waveforms: new Uint8Array(0),
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | AudioBufferSourceNode | null>(null);
  const requestRef = useRef<number | null>(null);

  const initAudio = useCallback(async (stream?: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    if (stream) {
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
    }

    setIsAudioReady(true);
    startAnalysis();
  }, []);

  const startAnalysis = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const freqData = new Uint8Array(analyser.frequencyBinCount);
    const waveData = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(waveData);

      // Analyze ranges
      const binCount = analyser.frequencyBinCount;
      const bassRange = Math.floor(binCount * 0.05); // 0-50Hz approx
      const midRange = Math.floor(binCount * 0.3); // 50-300Hz approx
      // Treble is high

      let bassSum = 0;
      for (let i = 0; i < bassRange; i++) bassSum += freqData[i];
      const bass = bassSum / (bassRange || 1) / 255;

      let midSum = 0;
      for (let i = bassRange; i < midRange; i++) midSum += freqData[i];
      const mid = midSum / (midRange - bassRange || 1) / 255;

      let trebleSum = 0;
      for (let i = midRange; i < binCount; i++) trebleSum += freqData[i];
      const treble = trebleSum / (binCount - midRange || 1) / 255;

      let volumeSum = 0;
      for (let i = 0; i < binCount; i++) volumeSum += freqData[i];
      const volume = volumeSum / binCount / 255;

      // Energy calculation for triggers
      // Low energy specifically for the punch
      const lowEnergy = Math.max(0, (bass - 0.7) / 0.3);
      const highEnergy = Math.max(0, (treble - 0.5) / 0.5);

      setStats({
        volume,
        bass,
        mid,
        treble,
        lowEnergy,
        highEnergy,
        frequencies: freqData,
        waveforms: waveData,
      });

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
  }, []);

  const handleMicInput = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support microphone access.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      initAudio(stream);
    } catch (err: any) {
      console.error("Mic access denied", err);
      if (err.name === 'NotAllowedError') {
        setError("Permission Denied: Please allow microphone access in your browser settings and refresh.");
      } else if (err.name === 'NotFoundError') {
        setError("No Microphone Found: Please check your audio input devices.");
      } else {
        setError(`Microphone Error: ${err.message || 'Unknown Error'}`);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    const analyser = analyserRef.current || ctx.createAnalyser();
    if (!analyserRef.current) {
      analyser.fftSize = 1024;
      analyserRef.current = analyser;
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    source.start(0);
    sourceRef.current = source;

    setIsAudioReady(true);
    startAnalysis();
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    isAudioReady,
    stats,
    error,
    handleMicInput,
    handleFileUpload,
  };
};
