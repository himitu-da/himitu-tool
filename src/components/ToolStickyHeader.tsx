"use client";

import React, { useEffect, useMemo, useState } from "react";

interface ToolStickyHeaderProps {
  title: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

const GLOBAL_HEADER_ID = "global-site-header";

export function ToolStickyHeader({ title, rightSlot, className = "" }: ToolStickyHeaderProps) {
  const [globalHeaderHeight, setGlobalHeaderHeight] = useState(0);
  const [shouldStick, setShouldStick] = useState(true);

  useEffect(() => {
    const header = document.getElementById(GLOBAL_HEADER_ID);
    if (!header) {
      setGlobalHeaderHeight(0);
      setShouldStick(true);
      return;
    }

    const updateLayout = () => {
      const height = header.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;
      setGlobalHeaderHeight(height);
      setShouldStick(viewportHeight > 0 ? height / viewportHeight <= 0.1 : true);
    };

    updateLayout();

    const observer = new ResizeObserver(() => {
      updateLayout();
    });
    observer.observe(header);

    window.addEventListener("resize", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  const headerClassName = useMemo(() => {
    const stickyPart = shouldStick ? "sticky z-40" : "relative z-10";
    return `${stickyPart} flex items-center justify-between p-4 shadow-md ${className}`.trim();
  }, [className, shouldStick]);

  return (
    <header className={headerClassName} style={shouldStick ? { top: `${globalHeaderHeight}px` } : undefined}>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {rightSlot ?? <div aria-hidden="true" className="w-10 h-10" />}
    </header>
  );
}
