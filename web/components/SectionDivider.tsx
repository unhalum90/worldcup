import React from 'react';

type Props = {
  className?: string;
};

// A subtle full-width divider line to add rhythm between sections
export default function SectionDivider({ className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent ${className}`}
    />
  );
}
