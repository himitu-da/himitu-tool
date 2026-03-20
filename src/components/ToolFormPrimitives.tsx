import React from "react";

type ToolRadioOptionProps = {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  activeClassName: string;
};

export function ToolRadioOption({ name, checked, onChange, label, activeClassName }: ToolRadioOptionProps) {
  return (
    <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${activeClassName}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mr-2" />
      {label}
    </label>
  );
}

type ToolColorInputRowProps = {
  label: string;
  colorValue: string;
  textValue: string;
  onColorChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onTextBlur: () => void;
  inputCls: string;
  ariaLabel: string;
  placeholder: string;
};

export function ToolColorInputRow({
  label,
  colorValue,
  textValue,
  onColorChange,
  onTextChange,
  onTextBlur,
  inputCls,
  ariaLabel,
  placeholder,
}: ToolColorInputRowProps) {
  return (
    <div>
      <label className="block text-base font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onColorChange(e.target.value)}
          className="h-12 w-16 rounded-xl cursor-pointer"
          aria-label={ariaLabel}
        />
        <input
          type="text"
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onTextBlur}
          className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${inputCls}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
