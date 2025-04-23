import React, { useState } from "react";

interface SettingsInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
}

const SettingsInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  required = false,
  readOnly = false,
}: SettingsInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const shouldFloat = isFocused || value.length > 0;

  return (
    <div className="relative w-full">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        onFocus={() => setIsFocused(true)}
        className="w-78 h-[40px] font-normal border border-gray-300 rounded px-3 text-sm placeholder-transparent focus:outline-none focus:border-gray-400 bg-white"
        placeholder={required ? `${label} *` : label}
        readOnly={readOnly}
      />
      <label
        htmlFor={name}
        className={`absolute cursor-text left-3 transition-all text-sm ${
          shouldFloat || readOnly
            ? "text-xs -top-1.5 text-gray-500 bg-white px-1"
            : "top-2.5 text-gray-500"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
};

export default SettingsInput;
