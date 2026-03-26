'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, Activity, BatteryCharging, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SECTIONS = [
  {
    icon: Activity,
    q: "سووڕی خەو چییە؟",
    a: (
      <>
        <p className="mb-3">
          خەوی مرۆڤ لە چەند سووڕێک پێکدێت کە هەر یەکەیان نزیکەی <strong className="text-indigo-300">90 خولەک</strong> دەخایەنێت. بۆ ئەوەی بەیانیان بەبێ ماندوێتی لە خەو هەستیت، زۆر گرنگە لە کۆتایی سووڕێکی خەودا خەبەرت ببێتەوە.
        </p>
        <p>
          باشترین خەو پێکدێت لە <strong className="text-purple-300">5 بۆ 6 سووڕی تەواو</strong> (7.5 بۆ 9 کاتژمێر).
        </p>
      </>
    )
  },
  {
    icon: Activity,
    q: "خەوی قووڵ بەرامبەر REM (خەون)",
    a: (
      <ul className="list-disc pl-5 space-y-2 text-right dir-rtl">
        <li>
          <strong className="text-blue-300">خەوی قووڵ (Deep Sleep)</strong>: گرنگترین قۆناغە بۆ پشوودانی جەستە، گەشەکردن، و چاکبوونەوەی خانەکان. ئەگەر لەم قۆناغەدا خەبەرت ببێتەوە، هەست بە سەرئێشە و ماندوێتییەکی زۆر دەکەیت.
        </li>
        <li>
          <strong className="text-purple-300">قۆناغی REM</strong>: ئەو قۆناغەیە مێشک تیایدا زۆر چالاکە و خەون دەبینێت، زۆر گرنگە بۆ بیرگە (Memory) و ڕێکخستنی زانیارییەکانی ڕۆژ.
        </li>
      </ul>
    )
  },
  {
    icon: BatteryCharging,
    q: "سوودەکانی خەوێکی باش",
    a: (
      <ul className="list-disc pl-5 space-y-2 text-right dir-rtl">
        <li>زیادبوونی وزە و چالاکی جەستە بۆ ڕۆژی دواتر.</li>
        <li>باشتربوونی تەندروستی دڵ و کەمکردنەوەی سترێس.</li>
        <li>بەهێزبوونی سیستەمی بەرگری لەش دژی نەخۆشییەکان.</li>
        <li>تەرکیزێکی زیاتر و بەهێزتربوونی توانای فێربوون.</li>
      </ul>
    )
  },
  {
    icon: Lightbulb,
    q: "ئامۆژگاری بۆ خەوێکی باشتر",
    a: (
      <ul className="list-disc pl-5 space-y-3 text-right dir-rtl">
        <li><strong className="text-indigo-300">شاشەکان دابخە</strong>: بەلایەنی کەمەوە 30 خولەک پێش خەوتن دووربکەوەرەوە لە شاشەی مۆبایل و کۆمپیوتەر، چونکە تیشکی شین ڕێگری دەکات لە دەردانی هۆرمۆنی خەو (مێلاتۆنین).</li>
        <li><strong className="text-indigo-300">ژوورێکی تاریک و فێنک</strong>: دڵنیابە لەوەی ژوورەکەت تاریک بێت بۆ باشتربوونی خەوی قووڵ.</li>
        <li><strong className="text-indigo-300">خشتەیەکی جێگیر</strong>: هەموو ڕۆژێک لە هەمان کاتدا بخەوە و هەستە، تەنانەت لە ڕۆژانی پشووشدا.</li>
        <li><strong className="text-indigo-300">کەمکردنەوەی کافایین</strong>: دوای عەسر خۆت بەدووربگرە لە قاوە و چا.</li>
      </ul>
    )
  }
];

export function SleepEducation() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full mt-10 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-500/20 p-3 rounded-xl text-purple-300">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">زانیاری زیاتر دەربارەی خەو</h2>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-right p-5 md:p-6 flex items-center justify-between text-indigo-100 font-bold gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 hidden sm:block">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg">{item.q}</span>
                </div>
                <div className="bg-indigo-500/10 p-2 rounded-lg shrink-0">
                  <ChevronDown className={`w-5 h-5 text-indigo-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 text-indigo-200/80 leading-relaxed text-justify border-t border-white/5 overflow-hidden"
                  >
                    <div className="pt-5">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
