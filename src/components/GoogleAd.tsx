"use client";

import { useEffect, useRef } from "react";

type GoogleAdProps = {
  className?: string;
  adSlot?: string;
};

const AD_CLIENT = "ca-pub-8970659787384533";
const DEFAULT_AD_SLOT = "3317342449";

export function GoogleAd({ className, adSlot = DEFAULT_AD_SLOT }: GoogleAdProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    try {
      const adsByGoogle = (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || [];
      adsByGoogle.push({});
      (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle = adsByGoogle;
      initializedRef.current = true;
    } catch {
      // AdSense script is blocked or not loaded yet.
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}