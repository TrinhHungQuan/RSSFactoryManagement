import React from "react";

export interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  required?: boolean;
  options: Option[];
}

const FilterSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
}: FilterSelectProps) => {
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || options[0]?.label;

  return (
    <div className="relative w-full">
      <div className="flex items-center w-full h-10 font-normal border border-gray-300 rounded px-3 text-sm placeholder-transparent focus-within:border-gray-400 relative">
        <span className="mr-1 font-semibold">{label} :</span>
        <span className="text-gray-500">{selectedLabel}</span>

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            onBlur?.(e);
          }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterSelect;
