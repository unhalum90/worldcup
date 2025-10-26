'use client';

import { useEffect, useState } from 'react';
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
  Home
} from 'lucide-react';
import { useSimulatedProgress } from '@/hooks/useSimulatedProgress';
import type { StoredSelection } from '@/types/trip';

interface PlannerLoaderProps {
  plannerType: 'flight' | 'lodging';
  trip: StoredSelection;
  duration?: number;
}

type AnimationBehavior = 'glide' | 'pulse' | 'slide' | 'wiggle' | 'rotate' | 'wave' | 'drop' | 'fade' | 'appear';

interface PlannerMessage {
  icon: any;
  text: string;
  behavior: AnimationBehavior;
}

const FLIGHT_MESSAGES: PlannerMessage[] = [
  { icon: Plane, text: 'Scanning flights from **{from}** → **{to}**...', behavior: 'glide' },
  { icon: Clock, text: 'Checking layovers under 2 hours...', behavior: 'pulse' },
  { icon: Users, text: 'Comparing seat options for **{travelers}** travelers...', behavior: 'slide' },
  { icon: Luggage, text: 'Estimating total travel time and baggage cost...', behavior: 'wiggle' },
  { icon: Globe2, text: 'Evaluating alternate hubs: EWR · BWI · IAD', behavior: 'rotate' },
  { icon: Brain, text: 'Matching **Smartest**, **Budget**, and **Fastest** routes...', behavior: 'pulse' },
  { icon: Flag, text: 'Finalizing best itinerary suggestions...', behavior: 'wave' },
];

const LODGING_MESSAGES: PlannerMessage[] = [
  { icon: Building2, text: 'Mapping top-rated neighborhoods in **{city}**...', behavior: 'drop' },
  { icon: Car, text: 'Checking commute time to stadium and Fan Fest...', behavior: 'slide' },
  { icon: Users, text: 'Prioritizing **family-friendly** options...', behavior: 'fade' },
  { icon: Utensils, text: 'Balancing nightlife and dining options nearby...', behavior: 'pulse' },
  { icon: MapPin, text: 'Exploring cultural highlights near your zone...', behavior: 'appear' },
  { icon: Home, text: 'Comparing **{nights}-night stay** under ${budget}/night...', behavior: 'wiggle' },
  { icon: Bed, text: 'Finding quiet stays for your "{tripType}" preference...', behavior: 'slide' },
  { icon: MapPin, text: 'Finalizing lodging zones and travel scores...', behavior: 'drop' },
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

function formatMessage(template: string, trip: StoredSelection): string {
  const cityList = trip.option.trip?.cityOrder?.length 
    ? trip.option.trip.cityOrder 
    : trip.option.cities.map((c) => c.cityName);
  
  const from = cityList[0] || 'your departure city';
  const to = cityList[cityList.length - 1] || 'your destination';
  const city = to;
  const travelers = trip.tripInput?.groupSize || 1;
  
  // Calculate nights
  const start = trip.tripInput?.startDate ? new Date(trip.tripInput.startDate) : null;
  const end = trip.tripInput?.endDate ? new Date(trip.tripInput.endDate) : null;
  const nights = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) : 4;
  
  const budget = 225;
  const tripType = trip.tripInput?.children ? 'Family Trip' : 'Fan Experience';

  return template
    .replace(/{from}/g, from)
    .replace(/{to}/g, to)
    .replace(/{city}/g, city)
    .replace(/{travelers}/g, travelers.toString())
    .replace(/{nights}/g, nights.toString())
    .replace(/{budget}/g, budget.toString())
    .replace(/{tripType}/g, tripType);
}

function ProgressBar({ progress, plannerType }: { progress: number; plannerType: 'flight' | 'lodging' }) {
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

export default function PlannerLoader({ plannerType, trip, duration = 60000 }: PlannerLoaderProps) {
  const progress = useSimulatedProgress(duration);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const messages = plannerType === 'flight' ? FLIGHT_MESSAGES : LODGING_MESSAGES;
  
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, Math.max(3000, duration / messages.length));

    return () => clearInterval(messageInterval);
  }, [messages.length, duration]);

  const currentMessage = messages[currentMessageIndex];
  const formattedText = formatMessage(currentMessage.text, trip);
  const IconComponent = currentMessage.icon;

  const containerColors = {
    flight: 'from-blue-50 to-sky-50',
    lodging: 'from-rose-50 to-orange-50'
  };

  const textColors = {
    flight: 'text-blue-900',
    lodging: 'text-rose-900'
  };

  // Split text on ** for bold formatting
  const textParts = formattedText.split(/(\*\*.*?\*\*)/);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${containerColors[plannerType]} border-2 ${plannerType === 'flight' ? 'border-blue-200' : 'border-rose-200'} rounded-2xl shadow-lg p-8 space-y-6`}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <p className={`text-sm font-semibold ${textColors[plannerType]} opacity-75`}>
          {plannerType === 'flight' ? 'Flight Planner AI' : 'Lodging Zone AI'} Working...
        </p>
        <div className={`text-xs ${textColors[plannerType]} opacity-60`}>
          Processing your {trip.option.title} itinerary
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
              {textParts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <span key={index} className="font-bold">
                      {part.slice(2, -2)}
                    </span>
                  );
                }
                return part;
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <ProgressBar progress={progress} plannerType={plannerType} />
        <div className="flex justify-between text-xs opacity-60">
          <span className={textColors[plannerType]}>
            {progress < 70 ? 'Scanning options...' : 
             progress < 90 ? 'Analyzing matches...' : 
             'Finalizing results...'}
          </span>
          <span className={`font-mono ${textColors[plannerType]}`}>
            {Math.round(progress)}%
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