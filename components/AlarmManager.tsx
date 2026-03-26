'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellOff, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlarmManagerProps {
  times: string[];
}

// --- Platform Detection ---
function detectPlatform(): 'ios' | 'android' | 'windows' | 'mac' | 'web' {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'mac';
  return 'web';
}

// --- Parse time string like "07:30 AM" -> { h24: 7, min: 30 } ---
function parseWakeTime(wakeTime: string): { h24: number; min: number } | null {
  try {
    const parts = wakeTime.trim().split(' ');
    if (parts.length < 2) return null;
    const [timePart, period] = parts;
    let [h, m] = timePart.split(':').map(Number);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return { h24: h, min: m };
  } catch {
    return null;
  }
}

// --- Open native alarm on Android using intent URL ---
function openAndroidAlarm(h24: number, min: number): void {
  const url = `intent://alarm#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${h24};i.android.intent.extra.alarm.MINUTES=${min};b.android.intent.extra.alarm.SKIP_UI=false;end`;
  window.location.href = url;
}

// --- Open iOS Clock app ---
function openIOSAlarm(): void {
  window.location.href = 'clock-alarm://';
}

// --- Open Windows Alarms & Clock ---
function openWindowsAlarm(): void {
  window.location.href = 'ms-clock://';
}

export function AlarmManager({ times }: AlarmManagerProps) {
  const [alarmSet, setAlarmSet] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'windows' | 'mac' | 'web'>('web');
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const stopAlarm = useCallback(() => {
    if (alarmIntervalRef.current) { clearInterval(alarmIntervalRef.current); alarmIntervalRef.current = null; }
    if (alarmCtxRef.current) { alarmCtxRef.current.close(); alarmCtxRef.current = null; }
  }, []);

  const playGradualAlarm = useCallback(() => {
    stopAlarm();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    alarmCtxRef.current = ctx;
    let volume = 0.05;
    const beep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 520;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
      volume = Math.min(1, volume + 0.08);
    };
    alarmIntervalRef.current = setInterval(beep, 900);
    beep();
  }, [stopAlarm]);

  useEffect(() => () => stopAlarm(), [stopAlarm]);

  const copyTimeToClipboard = async (time: string) => {
    try {
      await navigator.clipboard.writeText(time);
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleTimeSelect = (time: string) => {
    const parsed = parseWakeTime(time);
    if (!parsed) return;

    setSelectedTime(time);
    setShowModal(false);
    setAlarmSet(true);

    if (platform === 'android') {
      setTimeout(() => openAndroidAlarm(parsed.h24, parsed.min), 200);
      showToast('زەنگەکە کرایەوە');
    } else if (platform === 'ios') {
      setTimeout(() => openIOSAlarm(), 200);
      showToast('زەنگەکە کرایەوە');
    } else if (platform === 'windows') {
      setTimeout(() => openWindowsAlarm(), 200);
      showToast('زەنگەکە کرایەوە');
    } else {
      copyTimeToClipboard(time);
      showToast('کاتی زەنگ کۆپیکرا، بەدەستی دایبنێ');
    }

    const now = new Date();
    const target = new Date();
    target.setHours(parsed.h24, parsed.min, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const msUntil = target.getTime() - now.getTime();

    setTimeout(() => {
      playGradualAlarm();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ کاتی هەستانە!', {
          body: `کاتی ${time} بووە. باشترین کاتی هەستانە!`,
          icon: '/icon.png',
        });
      }
    }, msUntil);
  };

  const handleCancel = () => {
    stopAlarm();
    setAlarmSet(false);
    setSelectedTime(null);
    setToastMsg(null);
  };

  return (
    <div className="mt-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-purple-900/20 border border-purple-500/20 rounded-3xl p-6 flex flex-col items-center justify-center gap-6 relative"
      >
        <button
          onClick={alarmSet ? handleCancel : () => setShowModal(true)}
          disabled={!times || times.length === 0}
          className={`px-12 py-4 text-lg rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
            alarmSet
              ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-indigo-600 text-white shadow-indigo-600/30 border border-indigo-500 hover:bg-indigo-500'
          }`}
        >
          {alarmSet ? <BellOff className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
          {alarmSet ? 'ڕاگرتنی زەنگ' : 'دانانی زەنگ'}
        </button>

        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md border border-white/10 text-indigo-200 px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl"
            >
              <Info className="w-4 h-4 text-indigo-400" />
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4 text-center">کاتی هەستان هەڵبژێرە</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {times.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTimeSelect(t)}
                    className="w-full py-4 px-6 bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/50 rounded-xl text-lg font-mono font-bold text-indigo-100 transition-all text-center"
                    dir="ltr"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-all"
              >
                داخستن
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
