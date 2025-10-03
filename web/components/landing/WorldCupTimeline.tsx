"use client";

/**
 * Timeline of key World Cup 2026 dates and milestones
 * Compact view with hover interactions to reveal details
 */
export default function WorldCupTimeline() {
  const events = [
    {
      date: "Oct 1, 2025",
      title: "Visa Lottery Tickets",
      desc: "First round of tickets for visa lottery winners",
      phase: "past",
      icon: "🎟️",
      alwaysShow: true,
    },
    {
      date: "Nov 2025",
      title: "General Ticket Sales",
      desc: "First-come, first-served ticket phase opens",
      phase: "upcoming",
      icon: "🎫",
    },
    {
      date: "Dec 13, 2025",
      title: "Final Draw",
      desc: "Group stage draw ceremony",
      phase: "upcoming",
      icon: "⚡",
    },
    {
      date: "Feb 2026",
      title: "Last-Minute Sales",
      desc: "Final ticket allocation phase",
      phase: "upcoming",
      icon: "🏆",
    },
    {
      date: "Jun 11, 2026",
      title: "Opening Match",
      desc: "Kickoff at Estadio Azteca, Mexico City",
      phase: "tournament",
      icon: "⚽",
      highlight: true,
    },
    {
      date: "Jun 11-27, 2026",
      title: "Group Stage",
      desc: "48 teams compete in 16 groups",
      phase: "tournament",
      icon: "🌍",
    },
    {
      date: "Jun 28-Jul 3, 2026",
      title: "Round of 32",
      desc: "Knockout stage begins",
      phase: "tournament",
      icon: "🔥",
    },
    {
      date: "Jul 4-7, 2026",
      title: "Round of 16",
      desc: "Best 16 teams advance",
      phase: "tournament",
      icon: "🎯",
    },
    {
      date: "Jul 9-11, 2026",
      title: "Quarter Finals",
      desc: "Final 8 teams compete",
      phase: "tournament",
      icon: "🌟",
    },
    {
      date: "Jul 14-15, 2026",
      title: "Semi Finals",
      desc: "Road to the final",
      phase: "tournament",
      icon: "🏃",
    },
    {
      date: "Jul 18, 2026",
      title: "Third Place",
      desc: "Battle for bronze",
      phase: "tournament",
      icon: "🥉",
    },
    {
      date: "Jul 19, 2026",
      title: "Final",
      desc: "World Cup champions crowned",
      phase: "tournament",
      icon: "🏆",
      highlight: true,
      alwaysShow: true,
    },
  ];

  return (
    <section className="container mt-12 sm:mt-16 mb-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
          Road to the World Cup
        </h2>
        <p className="text-sm sm:text-base text-[color:var(--color-neutral-700)] max-w-2xl mx-auto">
          Hover to explore key dates from ticket sales to the final match
        </p>
      </div>

      {/* Desktop Timeline - Hidden on smaller screens */}
      <div className="hidden xl:block relative py-12 px-4">
        {/* Timeline horizontal line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[color:var(--color-primary)] via-[color:var(--color-accent-green)] to-[color:var(--color-accent-red)] rounded-full" />

        {/* Events - Using grid for better control */}
        <div className="relative grid grid-cols-12 gap-0">
          {events.map((event, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className="group flex flex-col items-center relative cursor-pointer col-span-1"
              >
                {/* Top content (even items) - Hidden by default, shown on hover or if alwaysShow */}
                {isEven && (
                  <div
                    className={`mb-3 text-center w-24 pb-1 transition-all duration-300 ${
                      event.alwaysShow
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <div className="text-[9px] font-bold text-[color:var(--color-primary)] mb-1">
                      {event.date}
                    </div>
                    <div className="text-[11px] font-bold mb-0.5 leading-tight">{event.title}</div>
                    <div className="text-[9px] text-[color:var(--color-neutral-700)] leading-tight">
                      {event.desc}
                    </div>
                  </div>
                )}

                {/* Vertical connector line - Only visible on hover or if alwaysShow */}
                <div
                  className={`transition-all duration-300 ${
                    event.alwaysShow
                      ? "opacity-100 w-0.5 h-6"
                      : "opacity-0 w-0.5 h-0 group-hover:opacity-100 group-hover:h-6"
                  } ${
                    event.highlight
                      ? "bg-[color:var(--color-accent-red)]"
                      : event.phase === "past"
                      ? "bg-gray-300"
                      : event.phase === "upcoming"
                      ? "bg-[color:var(--color-primary)]"
                      : "bg-[color:var(--color-accent-green)]"
                  }`}
                />

                {/* Icon/Node - Smaller by default, grows on hover */}
                <div
                  className={`relative z-10 flex items-center justify-center border-3 border-white shadow-lg rounded-full transition-all duration-300 ${
                    event.highlight
                      ? "w-10 h-10 text-base bg-[color:var(--color-accent-red)] text-white group-hover:w-12 group-hover:h-12 group-hover:text-lg"
                      : "w-8 h-8 text-sm group-hover:w-10 group-hover:h-10 group-hover:text-base " +
                        (event.phase === "past"
                          ? "bg-gray-300"
                          : event.phase === "upcoming"
                          ? "bg-[color:var(--color-primary)] text-white"
                          : "bg-[color:var(--color-accent-green)] text-white")
                  }`}
                >
                  {event.icon}
                </div>

                {/* Vertical connector line - Bottom */}
                <div
                  className={`transition-all duration-300 ${
                    event.alwaysShow
                      ? "opacity-100 w-0.5 h-6"
                      : "opacity-0 w-0.5 h-0 group-hover:opacity-100 group-hover:h-6"
                  } ${
                    event.highlight
                      ? "bg-[color:var(--color-accent-red)]"
                      : event.phase === "past"
                      ? "bg-gray-300"
                      : event.phase === "upcoming"
                      ? "bg-[color:var(--color-primary)]"
                      : "bg-[color:var(--color-accent-green)]"
                  }`}
                />

                {/* Bottom content (odd items) */}
                {!isEven && (
                  <div
                    className={`mt-3 text-center w-24 pt-1 transition-all duration-300 ${
                      event.alwaysShow
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    }`}
                  >
                    <div className="text-[9px] font-bold text-[color:var(--color-primary)] mb-1">
                      {event.date}
                    </div>
                    <div className="text-[11px] font-bold mb-0.5 leading-tight">{event.title}</div>
                    <div className="text-[9px] text-[color:var(--color-neutral-700)] leading-tight">
                      {event.desc}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet Timeline - Horizontal Scroll */}
      <div className="xl:hidden">
        <div className="relative overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max px-4 relative">
            {/* Horizontal line for mobile */}
            <div className="absolute top-[20px] left-0 right-0 h-1 bg-gradient-to-r from-[color:var(--color-primary)] via-[color:var(--color-accent-green)] to-[color:var(--color-accent-red)]" />
            
            {events.map((event, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center min-w-[100px] relative z-10"
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center border-3 border-white shadow-lg rounded-full ${
                    event.highlight
                      ? "w-11 h-11 text-lg bg-[color:var(--color-accent-red)] text-white"
                      : "w-10 h-10 text-base " +
                        (event.phase === "past"
                          ? "bg-gray-300"
                          : event.phase === "upcoming"
                          ? "bg-[color:var(--color-primary)] text-white"
                          : "bg-[color:var(--color-accent-green)] text-white")
                  }`}
                >
                  {event.icon}
                </div>

                {/* Content - Always visible on mobile */}
                <div className="text-center mt-3">
                  <div className="text-[10px] font-bold text-[color:var(--color-primary)] mb-0.5">
                    {event.date}
                  </div>
                  <div className="text-xs font-bold mb-0.5 leading-tight">{event.title}</div>
                  <div className="text-[10px] text-[color:var(--color-neutral-700)] leading-tight">
                    {event.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="text-center mt-4">
          <p className="text-[10px] text-[color:var(--color-neutral-700)] font-medium">
            ← Swipe to explore all milestones →
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">Past</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[color:var(--color-primary)] border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[color:var(--color-accent-green)] border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">Tournament</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[color:var(--color-accent-red)] border-2 border-white shadow" />
          <span className="text-[color:var(--color-neutral-700)] font-medium">Highlight</span>
        </div>
      </div>
    </section>
  );
}
