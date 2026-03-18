"use client";

import { PeriodTimerPage } from "@/components/PeriodTimerPage";

export default function DayTimerPage() {
  return <PeriodTimerPage title="1日タイマー" storageKey="dayTimer" period="day" />;
}
