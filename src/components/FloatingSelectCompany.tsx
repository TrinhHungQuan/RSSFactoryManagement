import React, { useState } from "react";

export interface Option {
  value: boolean;
  label: string;
}

interface FloatingSelectProps {
  label: string;
  name: string;
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  required?: boolean;
  options: Option[];
}

const FloatingSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  options,
}: FloatingSelectProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const shouldFloat = isFocused || value !== undefined;

  return (
    <div className="relative w-full mt-5">
      <select
        id={name}
        name={name}
        value={value.toString()}
        onChange={onChange}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        onFocus={() => setIsFocused(true)}
        className="w-full h-[40px] font-normal border border-gray-300 rounded px-3 text-sm placeholder-transparent focus:outline-none focus:border-gray-400"
      >
        <option value="" disabled hidden>
          {""}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value.toString()}
            value={opt.value.toString()}
            className="text-gray-500"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={name}
        className={`absolute left-3 transition-all text-sm ${
          shouldFloat
            ? "text-xs -top-1.5 text-gray-500 bg-white px-1"
            : "top-2.5 text-gray-500"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default FloatingSelect;
