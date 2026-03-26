'use client';

import { useState, useEffect } from 'react';
import { CalendarClock, BellRing, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DailyScheduleProps {
  onStartSleepMode: (sleepDate: Date) => void;
}

export function DailySchedule({ onStartSleepMode }: DailyScheduleProps) {
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('daily-schedule');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSleepTime(data.sleepTime || '23:00');
        setWakeTime(data.wakeTime || '07:00');
        setIsActive(!!data.isActive);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isActive && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, [isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        const now = new Date();
        const [sH, sM] = sleepTime.split(':').map(Number);
        const [wH, wM] = wakeTime.split(':').map(Number);

        const sleepTarget = new Date();
        sleepTarget.setHours(sH, sM, 0, 0);

        const wakeTarget = new Date();
        wakeTarget.setHours(wH, wM, 0, 0);

        // Pre-sleep warning (30 mins before)
        const warning = new Date(sleepTarget.getTime() - 30 * 60000);
        if (now.getHours() === warning.getHours() && now.getMinutes() === warning.getMinutes() && now.getSeconds() === 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('خۆت ئامادە بکە', { body: '٣٠ خولەکی تر کاتی خەوتنە! شاشەکان دابخە.', icon: '/icon.png' });
          }
        }

        // Exact sleep time
        if (now.getHours() === sleepTarget.getHours() && now.getMinutes() === sleepTarget.getMinutes() && now.getSeconds() === 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('کاتی خەوتنە', { body: 'شەو شاد! کاتی پشوودانە.', icon: '/icon.png' });
          }
        }

        // Exact wake time
        if (now.getHours() === wakeTarget.getHours() && now.getMinutes() === wakeTarget.getMinutes() && now.getSeconds() === 0) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('کاتی هەستانە', { body: 'بەیانی باش! ڕۆژێکی نوێیە.', icon: '/icon.png' });
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, sleepTime, wakeTime]);

  const toggleSchedule = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    localStorage.setItem('daily-schedule', JSON.stringify({ sleepTime, wakeTime, isActive: nextState }));
  };

  const updateSchedule = (field: 'sleepTime' | 'wakeTime', val: string) => {
    if (field === 'sleepTime') setSleepTime(val);
    if (field === 'wakeTime') setWakeTime(val);
    localStorage.setItem('daily-schedule', JSON.stringify({ sleepTime: field==='sleepTime'?val:sleepTime, wakeTime: field==='wakeTime'?val:wakeTime, isActive }));
  };

  const triggerSleepMode = () => {
    const [sH, sM] = sleepTime.split(':').map(Number);
    const target = new Date();
    target.setHours(sH, sM, 0, 0);
    if (target.getTime() < new Date().getTime()) {
      target.setDate(target.getDate() + 1);
    }
    onStartSleepMode(target);
  };

  return (
    <div className="w-full mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-fuchsia-500/20 p-3 rounded-xl text-fuchsia-300">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">خەوتنی ڕۆژانە</h2>
          </div>

          <button 
            onClick={toggleSchedule}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              isActive ? 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            {isActive ? <ToggleRight className="w-5 h-5 text-fuchsia-400" /> : <ToggleLeft className="w-5 h-5" />}
            {isActive ? 'چالاکە' : 'ناچالاکە'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
          <div>
            <label className="text-indigo-200 text-sm font-bold mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400"/> کاتی خەوتن (شەوانە)
            </label>
            <input 
              type="time" 
              value={sleepTime} 
              onChange={(e) => updateSchedule('sleepTime', e.target.value)} 
              className="w-full bg-white/10 outline-none border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500/50 transition-colors" dir="ltr"
            />
          </div>
          <div>
            <label className="text-indigo-200 text-sm font-bold mb-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400"/> کاتی هەستان (بەیانیان)
            </label>
            <input 
              type="time" 
              value={wakeTime} 
              onChange={(e) => updateSchedule('wakeTime', e.target.value)} 
              className="w-full bg-white/10 outline-none border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500/50 transition-colors" dir="ltr"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-indigo-200/60 leading-relaxed text-right flex-1">
            <span className="text-fuchsia-300 font-bold">تێبینی:</span> ئەم خشتەیە بە شێوەیەکی ئۆتۆماتیکی 30 خولەک پێش خەوتن ئاگادارت دەکاتەوە و زەنگی تایبەتی هەیە.
          </p>
          <button 
            onClick={triggerSleepMode}
            className="w-full md:w-auto px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-500/40 flex items-center justify-center gap-2 shrink-0"
          >
            <BellRing className="w-5 h-5" />
            دەستپێکردنی کاتی خەو
          </button>
        </div>
      </div>
    </div>
  );
}
