'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Star, BedDouble, ChevronDown, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Typewriter } from '@/components/ui/typewriter';
import { Button } from '@/components/ui/moving-border';

type Mode = 'sleep-now' | 'wake-at' | null;

interface CycleResult {
  time: string;
  cycles: number;
  duration: string;
  isOptimal: boolean;
}

export default function SleepCalculator() {
  const [mode, setMode] = useState<Mode>(null);
  
  // Custom Time Picker State
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [showPicker, setShowPicker] = useState(false);
  
  const [results, setResults] = useState<CycleResult[]>([]);

  // Set initial time to user's current local time
  useEffect(() => {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    
    // Round to nearest 5 minutes for the picker
    m = Math.round(m / 5) * 5;
    if (m === 60) {
      m = 0;
      h += 1;
    }
    
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;

    setHour(h.toString().padStart(2, '0'));
    setMinute(m.toString().padStart(2, '0'));
    setPeriod(p);
  }, []);

  // Function to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateSleepNow = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // Fall asleep time

    const newResults: CycleResult[] = [];
    // Calculate 6 to 1 cycles (9 hours to 1.5 hours)
    for (let i = 6; i >= 1; i--) {
      const wakeDate = new Date(now.getTime() + i * 90 * 60000);
      newResults.push({
        time: formatTime(wakeDate),
        cycles: i,
        duration: `${(i * 90) / 60} کاتژمێر`,
        isOptimal: i === 5 || i === 6,
      });
    }
    setResults(newResults);
    setMode('sleep-now');
  };

  const calculateWakeAt = () => {
    let h = parseInt(hour, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    const wakeDate = new Date();
    wakeDate.setHours(h, parseInt(minute, 10), 0, 0);

    // If wake time is in the past for today, assume tomorrow
    if (wakeDate.getTime() < new Date().getTime()) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }

    const newResults: CycleResult[] = [];
    // Calculate 6 to 1 cycles backwards
    for (let i = 6; i >= 1; i--) {
      const sleepDate = new Date(wakeDate.getTime() - i * 90 * 60000 - 15 * 60000);
      newResults.push({
        time: formatTime(sleepDate),
        cycles: i,
        duration: `${(i * 90) / 60} کاتژمێر`,
        isOptimal: i === 5 || i === 6,
      });
    }
    setResults(newResults);
    setMode('wake-at');
    setShowPicker(false);
  };

  const reset = () => {
    setMode(null);
    setResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-500/30 text-white bg-gradient-to-br from-indigo-950 to-slate-950">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-3xl flex flex-col items-center justify-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full"></div>
              <Moon className="w-20 h-20 text-indigo-300 relative z-10 drop-shadow-[0_0_15px_rgba(165,180,252,0.5)]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 py-2 leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200">
            حیسابکەری کاتی خەوتن
          </h1>
          <div className="text-indigo-200/80 max-w-lg mx-auto leading-relaxed h-24 md:h-20 flex flex-col items-center justify-center">
            <div className="text-lg md:text-xl font-medium mb-1">
              باشترین کاتەکانی خەوتن و هەستان بزانە،
            </div>
            <div className="text-base md:text-lg">
              <span>بۆ ئەوەی بەیانیان </span>
              <Typewriter
                text={[
                  "بە وزەیەکی زۆرەوە دەست بە ڕۆژەکەت بکەیت.",
                  "بە تەندروستییەکی باشترەوە لە خەو هەستیت.",
                  "بەبێ ماندوێتی و بێزاری ڕۆژەکەت بەڕێ بکەیت.",
                  "مێشکت ئارام بێت و سەرنجت زیاتر بێت."
                ]}
                speed={120}
                className="text-purple-300 font-medium"
                waitTime={4500}
                deleteSpeed={80}
                cursorChar="|"
              />
            </div>
          </div>
        </motion.div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {!mode ? (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full space-y-6"
              >
                <Button
                  onClick={calculateSleepNow}
                  borderRadius="1.5rem"
                  containerClassName="w-full h-auto mb-6"
                  className="bg-white/5 hover:bg-white/10 border-white/10 p-8 transition-all duration-700 flex items-center justify-between shadow-lg hover:shadow-indigo-500/10"
                  borderClassName="bg-[radial-gradient(var(--color-indigo-500)_40%,transparent_60%)]"
                >
                  <div className="flex items-center gap-6 w-full justify-between">
                    <div className="flex items-center gap-6">
                      <div className="bg-indigo-500/20 p-5 rounded-2xl text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all duration-700">
                        <BedDouble className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl font-semibold mb-2 text-white group-hover:text-indigo-100 transition-colors">ئێستا دەخەوم</h2>
                        <p className="text-indigo-200/60">بزانە چ کاتێک هەستیت باشترینە بۆ تەندروستیت</p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-indigo-400/30 group-hover:text-indigo-400/60 transition-colors">
                      <Moon className="w-12 h-12" />
                    </div>
                  </div>
                </Button>

                <div className="w-full relative rounded-3xl bg-white/5 border border-white/10 p-8 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="bg-purple-500/20 p-5 rounded-2xl text-purple-300">
                        <Sun className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <h2 className="text-2xl font-semibold mb-2 text-white">دەمەوێت لەم کاتەدا هەستم</h2>
                        <p className="text-purple-200/60">کاتی هەستانت لە خەو دیاری بکە</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                      <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="bg-black/30 border border-white/10 hover:border-purple-500/50 rounded-2xl px-6 py-4 text-3xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white w-full text-center font-mono tracking-wider flex items-center justify-center gap-4 transition-all shadow-inner"
                        dir="ltr"
                      >
                        <span className="text-purple-300 text-xl font-sans font-bold bg-purple-500/10 px-3 py-1 rounded-lg">{period === 'AM' ? 'پ.ن' : 'د.ن'}</span>
                        <span>{hour}:{minute}</span>
                        <ChevronDown className={`w-6 h-6 text-purple-400 transition-transform duration-700 ${showPicker ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showPicker && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="w-full overflow-hidden"
                          >
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-5 shadow-2xl w-full">
                              {/* AM/PM */}
                              <div className="flex gap-2 mb-5 bg-black/40 p-1.5 rounded-xl">
                                <button onClick={() => setPeriod('AM')} className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${period === 'AM' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>پێش نیوەڕۆ (AM)</button>
                                <button onClick={() => setPeriod('PM')} className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${period === 'PM' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>دوای نیوەڕۆ (PM)</button>
                              </div>

                              {/* Hours */}
                              <div className="mb-5">
                                <div className="text-slate-400 text-sm mb-3 font-medium px-1">کاتژمێر</div>
                                <div className="grid grid-cols-6 gap-2" dir="ltr">
                                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                                    <button key={h} onClick={() => setHour(h)} className={`py-2.5 rounded-xl font-mono text-lg transition-all ${hour === h ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-105'}`}>{h}</button>
                                  ))}
                                </div>
                              </div>

                              {/* Minutes */}
                              <div>
                                <div className="text-slate-400 text-sm mb-3 font-medium px-1">خولەک</div>
                                <div className="grid grid-cols-6 gap-2" dir="ltr">
                                  {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                                    <button key={m} onClick={() => setMinute(m)} className={`py-2.5 rounded-xl font-mono text-lg transition-all ${minute === m ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-105'}`}>{m}</button>
                                  ))}
                                </div>
                              </div>
                              
                              <button onClick={() => setShowPicker(false)} className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                                <ChevronDown className="w-5 h-5 rotate-180" />
                                داخستنی تەختەکلیل
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        onClick={calculateWakeAt}
                        borderRadius="1rem"
                        containerClassName="w-full h-auto mt-2"
                        className="bg-purple-600/80 hover:bg-purple-500/80 text-white px-8 py-4 transition-all duration-700 w-full shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 text-lg border-purple-500/50"
                        borderClassName="bg-[radial-gradient(var(--color-purple-400)_40%,transparent_60%)]"
                      >
                        ئەنجامەکان ببینە
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-semibold mb-3 text-white">
                    {mode === 'sleep-now' ? 'باشترین کاتەکان بۆ هەستان لە خەو:' : 'باشترین کاتەکان بۆ خەوتن:'}
                  </h2>
                  <p className="text-indigo-200/70 text-base">
                    ئەم کاتانە ١٥ خولەک کاتی خەولێکەوتنیان بۆ زیاد کراوە (تێکڕای کاتی خەولێکەوتنی مرۆڤ).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                  {results.map((result, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.6 }}
                      key={index}
                      className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-1000 hover:-translate-y-1 ${
                        result.isOptimal 
                          ? 'bg-indigo-600/20 border-indigo-400/40 shadow-[0_10_30px_rgba(99,102,241,0.15)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {result.isOptimal && (
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                          باشترین
                        </div>
                      )}
                      <div className="flex items-center justify-between h-full">
                        <div>
                          <div className="text-4xl font-bold mb-2 flex items-center gap-2 text-white tracking-tight" dir="ltr">
                            {result.time}
                          </div>
                          <div className="text-base text-indigo-200/80 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {result.duration} خەو
                          </div>
                        </div>
                        <div className="text-center flex flex-col items-center justify-center bg-black/20 rounded-2xl p-4 min-w-[90px]">
                          <div className="flex justify-center mb-2 text-indigo-300">
                            {result.isOptimal ? <Star className="w-7 h-7 fill-current drop-shadow-[0_0_8px_rgba(165,180,252,0.8)]" /> : <Moon className="w-7 h-7 opacity-70" />}
                          </div>
                          <div className="text-sm font-medium text-indigo-100">{result.cycles} سووڕی خەو</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={reset}
                    borderRadius="1rem"
                    containerClassName="h-auto"
                    className="bg-white/5 hover:bg-white/10 border-white/10 text-white px-10 py-4 transition-all duration-700 flex items-center gap-2 text-lg"
                    borderClassName="bg-[radial-gradient(var(--color-indigo-400)_40%,transparent_60%)]"
                  >
                    گەڕانەوە بۆ سەرەتا
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sleep Cycles Explanation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full mt-16 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-indigo-500/20 p-4 rounded-2xl text-indigo-300">
                <Brain className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">سووڕی خەو چییە؟</h2>
            </div>
            
            <div className="space-y-4 text-indigo-100/80 leading-relaxed text-lg text-justify">
              <p>
                خەوی مرۆڤ لە چەند سووڕێک پێکدێت کە هەر یەکەیان نزیکەی <strong className="text-indigo-300 font-bold">٩٠ خولەک</strong> دەخایەنێت. لە کاتی خەوتندا، مێشک بە چەند قۆناغێکدا تێدەپەڕێت (خەوی سووک، خەوی قووڵ، و خەوی خەون بینین یان REM).
              </p>
              <p>
                بۆ ئەوەی بەیانیان بەبێ ماندوێتی و بە وزەوە لە خەو هەستیت، زۆر گرنگە لە کۆتایی سووڕێکی خەودا خەبەرت ببێتەوە، نەک لە ناوەڕاستی خەوێکی قووڵدا. هەربۆیە باشترین خەو پێکدێت لە <strong className="text-purple-300 font-bold">٥ بۆ ٦ سووڕی تەواو</strong> (٧.٥ بۆ ٩ کاتژمێر).
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="py-8 text-center text-indigo-200/40 text-sm border-t border-white/5 mt-auto">
        <p>© 2026 مافەکان پارێزراون - دروستکراوە لەلایەن Marwan Fon</p>
      </footer>
    </div>
  );
}
