import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import styled from "styled-components";
import { CiCalendar } from "react-icons/ci";

// Style for the DatePicker
const DatePickerStyled = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container {
    position: relative;
    width: 100%;
  }
  input {
    padding-right: 2.5rem; /* space for the icon */
  }
  .calendar-icon {
    position: absolute;
    right: 0.75rem;
    top: 30%;
    pointer-events: none; /* so clicks go through to the input */
    color: #6b7280; /* Tailwind's text-gray-500 */
  }
`;

interface FloatingDatePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const FloatingDatePicker = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
}: FloatingDatePickerProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const shouldFloat = isFocused || value.length > 0;
  const isEmpty = !value;

  const parseDate = (val: string) => {
    const parsed = parse(val, "dd/MM/yyyy", new Date());
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formatted = format(date, "dd/MM/yyyy");
      const syntheticEvent = {
        target: {
          name,
          value: formatted,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className="relative w-full mt-5">
      <DatePickerStyled>
        <DatePicker
          id={name}
          name={name}
          selected={parseDate(value)}
          onChange={handleDateChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e as React.FocusEvent<HTMLInputElement>);
          }}
          onFocus={() => setIsFocused(true)}
          dateFormat="dd/MM/yyyy"
          className={`cursor-default cursor: not-allowed w-full h-[40px] font-normal border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-gray-400 text-black ${
            isEmpty && !isFocused ? "text-gray-400" : ""
          }`}
          required={required}
          placeholderText={isFocused ? (required ? `dd/mm/yyyy` : label) : ""}
        />
        <CiCalendar className="calendar-icon" />
      </DatePickerStyled>

      <label
        htmlFor={name}
        className={`absolute cursor-text left-3 transition-all text-sm ${
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

export default FloatingDatePicker;
