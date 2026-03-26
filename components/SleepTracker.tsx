'use client';

import { useState, useEffect } from 'react';
import { Activity, Clock, Moon, Sun, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SleepEntry {
  date: string;
  durationHours: number;
  score: number;
  message: string;
}

const HOURS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];

export function SleepTracker() {
  const [history, setHistory] = useState<SleepEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Sleep time picker state
  const [sHour, setSHour] = useState('10');
  const [sMinute, setSMinute] = useState('00');
  const [sPeriod, setSPeriod] = useState<'AM'|'PM'>('PM');
  const [showSleepPicker, setShowSleepPicker] = useState(false);

  // Wake time picker state
  const [wHour, setWHour] = useState('06');
  const [wMinute, setWMinute] = useState('00');
  const [wPeriod, setWPeriod] = useState<'AM'|'PM'>('AM');
  const [showWakePicker, setShowWakePicker] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sleep-history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleSave = () => {
    let sH24 = parseInt(sHour, 10);
    if (sPeriod === 'PM' && sH24 !== 12) sH24 += 12;
    if (sPeriod === 'AM' && sH24 === 12) sH24 = 0;

    let wH24 = parseInt(wHour, 10);
    if (wPeriod === 'PM' && wH24 !== 12) wH24 += 12;
    if (wPeriod === 'AM' && wH24 === 12) wH24 = 0;

    let dh = wH24 - sH24;
    let dm = parseInt(wMinute, 10) - parseInt(sMinute, 10);
    if (dm < 0) { dh -= 1; dm += 60; }
    if (dh < 0) { dh += 24; }
    
    const totalHours = Number((dh + dm / 60).toFixed(1));
    
    let score = 0;
    let message = '';
    
    if (totalHours >= 7.5 && totalHours <= 9) {
      score = 9.5;
      message = 'پشوویەکی زۆر نایاب! جەستەت بەتەواوی ئامادەیە.';
    } else if (totalHours >= 6 && totalHours < 7.5) {
      score = 7.0;
      message = 'خەوێکی باش، بەڵام هەوڵبدە نیو کاتژمێری تر بخەویت.';
    } else if (totalHours > 9) {
      score = 6.0;
      message = 'زۆر خەوتوویت، ڕەنگە هەست بە تەمبەڵی بکەیت.';
    } else {
      score = 4.0;
      message = 'خەوت زۆر کەمە! پێویستت بە پشووی زیاتر هەیە.';
    }

    const newEntry: SleepEntry = {
      date: new Date().toLocaleDateString('ku-IQ'),
      durationHours: totalHours,
      score,
      message
    };

    const newHistory = [newEntry, ...history].slice(0, 7);
    setHistory(newHistory);
    localStorage.setItem('sleep-history', JSON.stringify(newHistory));
    setIsAdding(false);
  };

  const renderTimePicker = (
    label: string,
    icon: React.ReactNode,
    hour: string, setHr: (v:string)=>void,
    minute: string, setMin: (v:string)=>void,
    period: 'AM'|'PM', setPer: (v:'AM'|'PM')=>void,
    showPicker: boolean, setShow: (v:boolean)=>void
  ) => (
    <div className="flex-1 flex flex-col">
      <label className="text-indigo-200 text-sm font-bold mb-2 flex items-center gap-2">{icon} {label}</label>
      <button
        onClick={() => { setShow(!showPicker); }}
        className="bg-black/30 border border-white/10 hover:border-purple-500/50 rounded-2xl px-5 py-3 text-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white w-full text-center font-mono tracking-wider flex items-center justify-center gap-3 transition-all shadow-inner"
        dir="ltr"
      >
        <span className="text-purple-300 text-sm font-sans font-bold bg-purple-500/10 px-2 py-1 rounded-lg">{period === 'AM' ? 'پ.ن' : 'د.ن'}</span>
        <span>{hour.padStart(2,'0')}:{minute}</span>
        <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform duration-500 ${showPicker ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 shadow-2xl">
              {/* AM/PM */}
              <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-xl">
                <button onClick={() => setPer('AM')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${period === 'AM' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>پێش نیوەڕۆ (AM)</button>
                <button onClick={() => setPer('PM')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${period === 'PM' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>دوای نیوەڕۆ (PM)</button>
              </div>
              {/* Hours */}
              <div className="mb-4">
                <div className="text-slate-400 text-xs mb-2 font-medium px-1">کاتژمێر</div>
                <div className="grid grid-cols-6 gap-1.5" dir="ltr">
                  {HOURS.map(h => (
                    <button key={h} onClick={() => setHr(h)} className={`py-2 rounded-xl font-mono text-sm transition-all ${hour === h ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-105'}`}>{h}</button>
                  ))}
                </div>
              </div>
              {/* Minutes */}
              <div>
                <div className="text-slate-400 text-xs mb-2 font-medium px-1">خولەک</div>
                <div className="grid grid-cols-6 gap-1.5" dir="ltr">
                  {MINUTES.map(m => (
                    <button key={m} onClick={() => setMin(m)} className={`py-2 rounded-xl font-mono text-sm transition-all ${minute === m ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-105'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setShow(false)} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
                <ChevronDown className="w-4 h-4 rotate-180" />
                داخستنی تەختەکلیل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-full mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-300">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">تۆماری خەوتنت</h2>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-sm font-bold bg-purple-600 hover:bg-purple-500 transition-colors text-white px-4 py-2 rounded-xl"
          >
            نوێ زیادبکە +
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {renderTimePicker(
                  'کاتی خەوتن', <Moon className="w-4 h-4"/>,
                  sHour, setSHour, sMinute, setSMinute, sPeriod, setSPeriod, showSleepPicker, setShowSleepPicker
                )}
                {renderTimePicker(
                  'کاتی هەستان', <Sun className="w-4 h-4"/>,
                  wHour, setWHour, wMinute, setWMinute, wPeriod, setWPeriod, showWakePicker, setShowWakePicker
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 font-bold text-slate-300 hover:bg-white/5 rounded-xl transition-colors"
                >
                  پاشگەزبوونەوە
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  خەزنکردن
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {history.length === 0 && !isAdding && (
           <div className="text-center p-8 bg-black/10 rounded-2xl border border-white/5 text-slate-400">
             هیچ تۆمارێک نییە. ئەنجامی خەوی دوێنێ شەوت داخڵ بکە!
           </div>
        )}
        {history.map((entry, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between bg-black/20 p-5 rounded-2xl border border-white/5 gap-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-indigo-100 font-bold">{entry.date} <span className="text-slate-400 font-normal ml-2">({entry.durationHours} کاتژمێر)</span></div>
            </div>
            
            <div className="flex flex-1 w-full justify-between items-center gap-4 border-t border-white/5 pt-4 md:pt-0 md:border-t-0">
              <div className="text-indigo-200/80 text-sm font-medium mr-auto md:mr-4 flex-1 text-right">{entry.message}</div>
              <div className={`font-bold px-4 py-2 flex items-center gap-1 rounded-xl border whitespace-nowrap shrink-0 ${
                entry.score >= 8 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 
                entry.score >= 6 ? 'bg-purple-500/20 text-purple-300 border-purple-500/20' : 'bg-red-500/20 text-red-300 border-red-500/20'
              }`}>
                {entry.score}/10 <Star className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
