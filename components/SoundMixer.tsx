'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, CloudRain, CloudLightning, Wind, Waves, Trees, Moon, Activity, Timer, Flame } from 'lucide-react';
import { motion } from 'motion/react';

// --- Web Audio API Noise Generators ---
function createBufferSource(ctx: AudioContext, color: 'white' | 'pink' | 'brown') {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (color === 'white') {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (color === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // brown
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

interface SoundChannel {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  noiseColor: 'white' | 'pink' | 'brown';
  filterType?: BiquadFilterType;
  filterFreq?: number;
}

const CHANNELS: SoundChannel[] = [
  { name: 'باران', icon: CloudRain, noiseColor: 'white', filterType: 'bandpass', filterFreq: 1000 },
  { name: 'هەورەتریشقە', icon: CloudLightning, noiseColor: 'brown', filterType: 'lowpass', filterFreq: 200 },
  { name: 'زەریا', icon: Waves, noiseColor: 'pink', filterType: 'lowpass', filterFreq: 400 },
  { name: 'دارستان', icon: Trees, noiseColor: 'pink', filterType: 'bandpass', filterFreq: 1500 },
  { name: 'با', icon: Wind, noiseColor: 'pink', filterType: 'bandpass', filterFreq: 500 },
  { name: 'دەنگی سپی', icon: Activity, noiseColor: 'white' },
  { name: 'کەشوهەوای شەو', icon: Moon, noiseColor: 'brown', filterType: 'bandpass', filterFreq: 300 },
  { name: 'ئاگر', icon: Flame, noiseColor: 'pink', filterType: 'lowpass', filterFreq: 200 },
];

interface SoundMixerProps {
  globalSleepTarget?: Date | null;
}

export function SoundMixer({ globalSleepTarget }: SoundMixerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volumes, setVolumes] = useState<number[]>(Array(CHANNELS.length).fill(0));
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainsRef = useRef<GainNode[]>([]);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const buildGraph = useCallback((ctx: AudioContext, currentVolumes: number[]) => {
    gainsRef.current = [];
    sourcesRef.current = [];

    CHANNELS.forEach((ch, i) => {
      const source = createBufferSource(ctx, ch.noiseColor);
      const gain = ctx.createGain();
      gain.gain.value = currentVolumes[i]; // Use the currentVolumes passed to the function

      if (ch.filterType && ch.filterFreq) {
        const filter = ctx.createBiquadFilter();
        filter.type = ch.filterType;
        filter.frequency.value = ch.filterFreq;
        source.connect(filter);
        filter.connect(gain);
      } else {
        source.connect(gain);
      }

      gain.connect(ctx.destination);
      gainsRef.current.push(gain);
      sourcesRef.current.push(source);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = () => {
    if (isPlaying) {
      // Stop
      sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
      ctxRef.current?.close();
      ctxRef.current = null;
      sourcesRef.current = [];
      gainsRef.current = [];
      setIsPlaying(false);
      setTimeLeft(null);
    } else {
      // Start
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      buildGraph(ctx, volumes);
      sourcesRef.current.forEach(s => s.start());
      setIsPlaying(true);
      if (timerMinutes) {
        setTimeLeft(timerMinutes * 60);
      }
    }
  };

  const handleVolumeChange = (idx: number, val: number) => {
    const newVols = [...volumes];
    newVols[idx] = val;
    setVolumes(newVols);
    if (gainsRef.current[idx] && ctxRef.current) {
      gainsRef.current[idx].gain.setTargetAtTime(val, ctxRef.current.currentTime, 0.01);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft !== null) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            handlePlay(); // stop play when timer reaches 0
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (globalSleepTarget) {
      const now = new Date();
      if (globalSleepTarget > now) {
         const diffSecs = Math.floor((globalSleepTarget.getTime() - now.getTime()) / 1000);
         setTimeLeft(diffSecs);
         
         let currentVols: number[] = [...volumes];
         if (currentVols.every(v => v === 0)) {
            // Default relaxing mix
            currentVols[2] = 0.5; // Ocean
            currentVols[6] = 0.4; // Night
            currentVols[0] = 0.3; // Rain
            setVolumes(currentVols);
         }

         if (!isPlaying) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            ctxRef.current = ctx;
            buildGraph(ctx, currentVols);
            sourcesRef.current.forEach(s => s.start());
            setIsPlaying(true);
         }
      }
    }
  }, [globalSleepTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      sourcesRef.current.forEach(s => { try { s.stop(); } catch {} });
      ctxRef.current?.close();
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-all duration-1000 group-hover:bg-indigo-500/10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none transition-all duration-1000 group-hover:bg-purple-500/10"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Volume2 className="text-indigo-400" /> دەنگی ئارامکەرەوە
          </h2>
          
          <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-2 px-3">
              <Timer className="w-5 h-5 text-indigo-300" />
              <select 
                value={timerMinutes || ''}
                onChange={(e) => setTimerMinutes(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent text-indigo-100 outline-none cursor-pointer font-bold text-sm"
              >
                <option value="" className="bg-slate-800 text-white">بێ کات</option>
                <option value="15" className="bg-slate-800 text-white">15 خولەک</option>
                <option value="30" className="bg-slate-800 text-white">30 خولەک</option>
                <option value="60" className="bg-slate-800 text-white">60 خولەک</option>
              </select>
            </div>
            {timeLeft !== null && isPlaying && (
              <div className="text-indigo-300 font-mono font-bold text-sm bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20" dir="ltr">
                {formatTime(timeLeft)}
              </div>
            )}
            <button
              onClick={handlePlay}
              className={`p-3 rounded-xl transition-all shadow-lg text-white ${
                isPlaying 
                  ? 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/30 ring-2 ring-purple-500/50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CHANNELS.map((ch, idx) => {
            const Icon = ch.icon;
            const isActive = volumes[idx] > 0.05;
            return (
              <div key={idx} className={`p-4 rounded-2xl flex flex-col items-center gap-4 transition-all duration-500 ${isActive ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'bg-black/20 border-white/5 hover:bg-black/30'} border backdrop-blur-sm`}>
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2.5 rounded-xl transition-colors duration-500 ${isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/5 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-sm font-bold transition-colors duration-500 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {ch.name}
                  </div>
                </div>
                <div className="w-full relative py-2">
                  <input
                    type="range" min="0" max="1" step="0.02"
                    value={volumes[idx]}
                    onChange={(e) => handleVolumeChange(idx, parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer hover:accent-indigo-300 transition-all focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {isPlaying && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
            <span className="inline-block relative text-indigo-300/80 text-sm bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20 font-medium">
              <span className="absolute w-2 h-2 bg-indigo-400 rounded-full right-3 top-1/2 -translate-y-1/2 animate-ping"></span>
              <span className="absolute w-2 h-2 bg-indigo-400 rounded-full right-3 top-1/2 -translate-y-1/2"></span>
              لە کارکردندایە...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
