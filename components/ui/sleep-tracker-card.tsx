import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SleepStage = "Awake" | "REM" | "Core" | "Deep";

interface SleepGraphSegment {
  stage: SleepStage;
  duration: number;
  height: number;
}

export interface SleepData {
  timeSlept: string;
  quality: number;
  changePercent: number;
  startTime: string;
  endTime: string;
  stages: Record<SleepStage, string>;
  graphData: SleepGraphSegment[];
}

interface SleepTrackerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  data: SleepData;
  icons: {
    sleep: React.ReactNode;
    moon: React.ReactNode;
    sun: React.ReactNode;
    arrowUp: React.ReactNode;
  };
}

const stageColors: Record<SleepStage, string> = {
  Awake: "bg-orange-400",
  REM: "bg-sky-400",
  Core: "bg-blue-500",
  Deep: "bg-indigo-600",
};

const stageNames: Record<SleepStage, string> = {
  Awake: "بەئاگا",
  REM: "خەوی خێرا",
  Core: "سەرەکی",
  Deep: "قووڵ",
};

const SleepTrackerCard = React.forwardRef<
  HTMLDivElement,
  SleepTrackerCardProps
>(({ className, data, icons, ...props }, ref) => {
  const {
    timeSlept,
    quality,
    changePercent,
    startTime,
    endTime,
    stages,
    graphData,
  } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const barVariants: any = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {/* Header Section */}
      <div className="mb-6 flex items-center gap-3">
        {icons.sleep}
        <h2 className="text-lg font-semibold">شیکاری خەو</h2>
      </div>

      {/* Main Stats Section */}
      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold" dir="ltr">{timeSlept}</p>
          <p className="text-xs text-indigo-200/60 mt-1">کاتی خەوتن</p>
        </div>
        <div>
          <p className="text-2xl font-bold" dir="ltr">{quality}%</p>
          <p className="text-xs text-indigo-200/60 mt-1">کوالێتی</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-emerald-400" dir="ltr">
            {icons.arrowUp}
            <p className="text-2xl font-bold">{changePercent}%</p>
          </div>
          <p className="text-xs text-indigo-200/60 mt-1">لە دوێنێ باشترە</p>
        </div>
      </div>

      {/* Animated Graph Section */}
      <div
        className="rounded-2xl bg-black/20 p-4"
        aria-label="Sleep stages graph"
        role="figure"
      >
        <motion.div
          className="flex h-24 w-full items-end justify-center gap-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          dir="ltr"
        >
          {graphData.map((segment, index) => (
            <motion.div
              key={index}
              className={cn(
                "rounded-t-sm w-full",
                stageColors[segment.stage]
              )}
              style={{
                height: `${segment.height}%`,
              }}
              variants={barVariants}
              aria-label={`${segment.stage} sleep for a duration proportion of ${segment.duration}`}
            />
          ))}
        </motion.div>
        <div className="mt-3 flex justify-between text-xs text-indigo-200/60" dir="ltr">
          <div className="flex items-center gap-1.5">
            {icons.moon}
            <span>{startTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{endTime}</span>
            {icons.sun}
          </div>
        </div>
      </div>

      {/* Legend Section */}
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {Object.entries(stages).map(([stage, duration]) => (
          <div key={stage} className="flex items-center gap-2">
            <span
              className={cn(
                "h-3 w-3 rounded-full",
                stageColors[stage as SleepStage]
              )}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">{stageNames[stage as SleepStage]}</p>
              <p className="text-xs text-indigo-200/60" dir="ltr">{duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
SleepTrackerCard.displayName = "SleepTrackerCard";

export { SleepTrackerCard };
