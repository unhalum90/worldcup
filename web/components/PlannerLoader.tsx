'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Clock, 
  Users, 
  Luggage, 
  Globe2, 
  Brain, 
  Flag,
  MapPin,
  Bed,
  Car,
  Utensils,
  Building2,
  Home,
  Calendar,
  Map,
  Sparkles
} from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';
import { useSimulatedProgress } from '@/hooks/useSimulatedProgress';
import type { StoredSelection } from '@/types/trip';

interface PlannerLoaderProps {
  plannerType: 'flight' | 'lodging' | 'trip';
  trip: StoredSelection;
  duration?: number;
  progressOverride?: number;
  messageOverride?: string;
}

type AnimationBehavior = 'glide' | 'pulse' | 'slide' | 'wiggle' | 'rotate' | 'wave' | 'drop' | 'fade' | 'appear';

interface PlannerMessage {
  icon: any;
  key: string;
  behavior: AnimationBehavior;
}

const FLIGHT_MESSAGES: PlannerMessage[] = [
  { icon: Plane, key: 'messages.flight.scanRoute', behavior: 'glide' },
  { icon: Clock, key: 'messages.flight.layovers', behavior: 'pulse' },
  { icon: Users, key: 'messages.flight.seats', behavior: 'slide' },
  { icon: Luggage, key: 'messages.flight.baggage', behavior: 'wiggle' },
  { icon: Globe2, key: 'messages.flight.hubs', behavior: 'rotate' },
  { icon: Brain, key: 'messages.flight.optimize', behavior: 'pulse' },
  { icon: Flag, key: 'messages.flight.finalize', behavior: 'wave' },
];

const LODGING_MESSAGES: PlannerMessage[] = [
  { icon: Building2, key: 'messages.lodging.neighborhoods', behavior: 'drop' },
  { icon: Car, key: 'messages.lodging.commute', behavior: 'slide' },
  { icon: Users, key: 'messages.lodging.family', behavior: 'fade' },
  { icon: Utensils, key: 'messages.lodging.dining', behavior: 'pulse' },
  { icon: MapPin, key: 'messages.lodging.culture', behavior: 'appear' },
  { icon: Home, key: 'messages.lodging.nightsBudget', behavior: 'wiggle' },
  { icon: Bed, key: 'messages.lodging.preferences', behavior: 'slide' },
  { icon: MapPin, key: 'messages.lodging.finalize', behavior: 'drop' },
];

const TRIP_MESSAGES: PlannerMessage[] = [
  { icon: Globe2, key: 'messages.trip.travelers', behavior: 'rotate' },
  { icon: Calendar, key: 'messages.trip.timeline', behavior: 'pulse' },
  { icon: Plane, key: 'messages.trip.flights', behavior: 'glide' },
  { icon: Building2, key: 'messages.trip.lodging', behavior: 'drop' },
  { icon: Map, key: 'messages.trip.logistics', behavior: 'slide' },
  { icon: Utensils, key: 'messages.trip.dining', behavior: 'wiggle' },
  { icon: Brain, key: 'messages.trip.recommendations', behavior: 'pulse' },
  { icon: Sparkles, key: 'messages.trip.finalize', behavior: 'wave' },
];

const iconAnimations: Record<AnimationBehavior, any> = {
  glide: {
    animate: {
      x: [0, 20, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.2, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  },
  slide: {
    animate: {
      x: [0, 10, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
    }
  },
  wiggle: {
    animate: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  rotate: {
    animate: {
      rotate: [0, 360],
      transition: { duration: 3, repeat: Infinity, ease: "linear" }
    }
  },
  wave: {
    animate: {
      y: [0, -5, 0],
      rotate: [0, 10, -10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  drop: {
    animate: {
      y: [0, 5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  },
  fade: {
    animate: {
      opacity: [0.7, 1, 0.7],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  appear: {
    animate: {
      scale: [0.8, 1, 0.8],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
    }
  }
};

function ProgressBar({ progress, plannerType }: { progress: number; plannerType: 'flight' | 'lodging' | 'trip' }) {
  const colors = {
    flight: {
      bg: 'bg-blue-100',
      fill: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600'
    },
    lodging: {
      bg: 'bg-rose-100', 
      fill: 'bg-rose-500',
      gradient: 'from-rose-400 to-rose-600'
    },
    trip: {
      bg: 'bg-purple-100',
      fill: 'bg-purple-500',
      gradient: 'from-purple-400 to-purple-600'
    }
  };

  return (
    <div className={`w-full h-2 rounded-full ${colors[plannerType].bg} overflow-hidden`}>
      <motion.div
        className={`h-full bg-gradient-to-r ${colors[plannerType].gradient} rounded-full relative`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, progress)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {progress > 50 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: [-20, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </div>
  );
}

export default function PlannerLoader({
  plannerType,
  trip,
  duration = 60000,
  progressOverride,
  messageOverride,
}: PlannerLoaderProps) {
  const t = useTranslations('planner.tripBuilder.loader');
  const formatter = useFormatter();
  const simulatedProgress = useSimulatedProgress(duration);
  const progress = typeof progressOverride === 'number'
    ? Math.max(simulatedProgress, progressOverride)
    : simulatedProgress;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages = plannerType === 'flight' ? FLIGHT_MESSAGES :
                   plannerType === 'lodging' ? LODGING_MESSAGES :
                   TRIP_MESSAGES;

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, Math.max(3000, duration / messages.length));

    return () => clearInterval(messageInterval);
  }, [messages.length, duration]);

  const currentMessage = messages[currentMessageIndex];
  const IconComponent = currentMessage.icon;

  const cityList = trip.option.trip?.cityOrder?.length
    ? trip.option.trip.cityOrder
    : trip.option.cities.map((c) => c.cityName);

  const defaultFrom = t('context.defaults.from');
  const defaultTo = t('context.defaults.to');
  const defaultCity = t('context.defaults.city');

  const from = cityList[0] || defaultFrom;
  const to = cityList[cityList.length - 1] || defaultTo;
  const city = cityList[cityList.length - 1] || defaultCity;
  const travelersCount = trip.tripInput?.groupSize ?? 1;

  const start = trip.tripInput?.startDate ? new Date(trip.tripInput.startDate) : null;
  const end = trip.tripInput?.endDate ? new Date(trip.tripInput.endDate) : null;
  const nights =
    start && end
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
      : 4;

  const budgetValue = 225;
  const tripTypeKey = (trip.tripInput?.children ?? 0) > 0 ? 'family' : 'fan';

  const messageValues = {
    from,
    to,
    city,
    travelers: formatter.number(travelersCount),
    nights: formatter.number(nights),
    budget: formatter.number(budgetValue, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }),
    tripType: t(`context.tripType.${tripTypeKey}`),
  };

  const richComponents = {
    strong: (chunks: ReactNode) => <span className="font-bold">{chunks}</span>,
    highlight: (chunks: ReactNode) => <span className="font-semibold">{chunks}</span>,
  };

  const messageContent: ReactNode = messageOverride
    ? messageOverride
    : t.rich(currentMessage.key, { ...messageValues, ...richComponents });

  const plannerLabel = t(`header.label.${plannerType}`);
  const statusText = t('header.status', { planner: plannerLabel });
  const processingText = t('header.processing', {
    plan: trip.option.title || t('header.defaults.plan'),
  });

  const progressLabel =
    progress < 70
      ? t('progress.scanning')
      : progress < 90
        ? t('progress.analyzing')
        : t('progress.finalizing');

  const containerColors = {
    flight: 'from-blue-50 to-sky-50',
    lodging: 'from-rose-50 to-orange-50',
    trip: 'from-purple-50 to-indigo-50'
  };

  const textColors = {
    flight: 'text-blue-900',
    lodging: 'text-gray-900',
    trip: 'text-purple-900'
  };

  const borderColors = {
    flight: 'border-blue-200',
    lodging: 'border-rose-200',
    trip: 'border-purple-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${containerColors[plannerType]} border-2 ${borderColors[plannerType]} rounded-2xl shadow-lg p-8 space-y-6`}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <p className={`text-sm font-semibold ${textColors[plannerType]} opacity-75`}>
          {statusText}
        </p>
        <div className={`text-xs ${textColors[plannerType]} opacity-60`}>
          {processingText}
        </div>
      </div>

      {/* Animated Message */}
      <div className="flex items-center justify-center space-x-4">
        <motion.div
          key={`icon-${currentMessageIndex}`}
          {...iconAnimations[currentMessage.behavior]}
          className={`${textColors[plannerType]} opacity-80`}
        >
          <IconComponent size={32} />
        </motion.div>
        
        <div className="flex-1 min-h-[60px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className={`text-lg ${textColors[plannerType]} text-center`}
            >
              {messageContent}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <ProgressBar progress={progress} plannerType={plannerType} />
        <div className="flex justify-start text-xs opacity-60">
          <span className={textColors[plannerType]}>
            {progressLabel}
          </span>
        </div>
      </div>

      {/* Optional Soccer Ball Easter Egg */}
      {progress > 30 && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{ 
              x: [0, 20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-2xl"
          >
            ⚽
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
