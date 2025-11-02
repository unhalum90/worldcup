"use client";

import { ReactNode, useCallback } from "react";

interface SubscribeButtonProps {
  className?: string;
  children?: ReactNode;
}

const SubscribeButton = ({ className, children }: SubscribeButtonProps) => {
  const handleClick = useCallback(() => {
    window.dispatchEvent(new Event("fz:open-subscribe"));
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children ?? "Subscribe Free"}
    </button>
  );
};

export default SubscribeButton;
