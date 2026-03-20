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
  isClassic?: boolean;
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
  isClassic = false,
}: ToolColorInputRowProps) {
  return (
    <div>
      <label className="block text-base font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onColorChange(e.target.value)}
          className={isClassic ? "h-12 w-16 rounded-none border-2 border-gray-400 cursor-pointer" : "h-12 w-16 rounded-xl cursor-pointer"}
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

type ToolFieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputCls: string;
};

export function ToolFieldInput({ inputCls, className = "", ...props }: ToolFieldInputProps) {
  return (
    <input
      {...props}
      className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${inputCls} ${className}`.trim()}
    />
  );
}

type ToolRangeInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isClassic?: boolean;
};

export function ToolRangeInput({ isClassic = false, className = "", ...props }: ToolRangeInputProps) {
  return (
    <input
      {...props}
      type="range"
      className={`${isClassic ? "h-2 accent-black" : "h-3"} w-full cursor-pointer ${className}`.trim()}
    />
  );
}

type ToolCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  isClassic?: boolean;
  className?: string;
};

export function ToolCheckbox({ checked, onChange, label, isClassic = false, className = "" }: ToolCheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 text-base sm:text-lg font-semibold cursor-pointer ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={isClassic ? "h-5 w-5 rounded-none border-2 border-gray-600 accent-black" : "h-5 w-5 rounded-md accent-blue-600"}
      />
      <span>{label}</span>
    </label>
  );
}
