"use client";

import React, { useState } from "react";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue == null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operator) {
        case "+":
          newValue = currentValue + inputValue;
          break;
        case "-":
          newValue = currentValue - inputValue;
          break;
        case "*":
          newValue = currentValue * inputValue;
          break;
        case "/":
          newValue = currentValue / inputValue;
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">電卓</h1>
      
      <div className="w-full bg-black/20 p-4 rounded-lg mb-6 text-right text-3xl font-mono overflow-x-auto whitespace-nowrap">
        {display}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <button onClick={clear} className="col-span-3 p-4 rounded-lg font-bold bg-red-500/80 hover:bg-red-600/80 text-white transition-colors">C</button>
        <button onClick={() => performOperation("/")} className="p-4 rounded-lg font-bold bg-blue-500/50 hover:bg-blue-600/50 transition-colors">÷</button>
        
        {/* Row 2 */}
        <button onClick={() => inputDigit("7")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">7</button>
        <button onClick={() => inputDigit("8")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">8</button>
        <button onClick={() => inputDigit("9")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">9</button>
        <button onClick={() => performOperation("*")} className="p-4 rounded-lg font-bold bg-blue-500/50 hover:bg-blue-600/50 transition-colors">×</button>

        {/* Row 3 */}
        <button onClick={() => inputDigit("4")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">4</button>
        <button onClick={() => inputDigit("5")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">5</button>
        <button onClick={() => inputDigit("6")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">6</button>
        <button onClick={() => performOperation("-")} className="p-4 rounded-lg font-bold bg-blue-500/50 hover:bg-blue-600/50 transition-colors">-</button>

        {/* Row 4 */}
        <button onClick={() => inputDigit("1")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">1</button>
        <button onClick={() => inputDigit("2")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">2</button>
        <button onClick={() => inputDigit("3")} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">3</button>
        <button onClick={() => performOperation("+")} className="p-4 rounded-lg font-bold bg-blue-500/50 hover:bg-blue-600/50 transition-colors">+</button>

        {/* Row 5 */}
        <button onClick={() => inputDigit("0")} className="col-span-2 p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">0</button>
        <button onClick={inputDecimal} className="p-4 rounded-lg font-bold bg-white/10 hover:bg-white/20 transition-colors">.</button>
        <button onClick={() => performOperation("=")} className="p-4 rounded-lg font-bold bg-green-500/80 hover:bg-green-600/80 text-white transition-colors">=</button>
      </div>
    </div>
  );
}
