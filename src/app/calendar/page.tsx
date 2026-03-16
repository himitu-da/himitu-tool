"use client";

import React, { useState } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const today = new Date();

  return (
    <>
      <ToolStickyHeader title="カレンダー" className="bg-gray-800 text-white" />
      <div className="max-w-xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">

      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 rounded bg-black/20 hover:bg-black/30 transition-colors">&lt; 前月</button>
        <h2 className="text-xl font-bold">{year}年 {month + 1}月</h2>
        <button onClick={nextMonth} className="p-2 rounded bg-black/20 hover:bg-black/30 transition-colors">次月 &gt;</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className={`font-semibold opacity-80 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {days.map((day, i) => {
          const isToday = day !== null && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
          return (
            <div 
              key={i} 
              className={`p-3 rounded-lg ${day ? 'bg-black/10' : ''} ${isToday ? 'bg-blue-500/80 text-white font-bold' : ''}`}
            >
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  </>
);
}