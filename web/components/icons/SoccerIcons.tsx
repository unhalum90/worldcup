import React from 'react';

export const SoccerBallIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ transform: 'rotate(var(--ball-rotation, 0deg))' }}
  >
    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="#fff" stroke="#000" strokeWidth="0.5" />
    {/* Hexagons */}
    <path d="M12 2.05L15.31 3.93L15.31 7.69L12 9.57L8.69 7.69L8.69 3.93L12 2.05M12 9.57L15.31 7.69L17.96 9.57L17.96 14.43L15.31 16.31L12 14.43L12 9.57M8.69 7.69L12 9.57L12 14.43L8.69 16.31L6.04 14.43L6.04 9.57L8.69 7.69M12 14.43L15.31 16.31L15.31 20.07L12 21.95L8.69 20.07L8.69 16.31L12 14.43Z" fill="#000"/>
    {/* Pentagons */}
    <polygon points="17.96 9.57 20.62 7.69 21.95 12 20.62 16.31 17.96 14.43" fill="#000" />
    <polygon points="6.04 9.57 3.38 7.69 2.05 12 3.38 16.31 6.04 14.43" fill="#000" />
  </svg>
);

export const GoalIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 6h20v12H2z" />
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M2 18h3" />
    <path d="M19 18h3" />
    <path d="M2 6l3 4" />
    <path d="M22 6l-3 4" />
    <path d="M10 6V4" />
    <path d="M14 6V4" />
  </svg>
);
