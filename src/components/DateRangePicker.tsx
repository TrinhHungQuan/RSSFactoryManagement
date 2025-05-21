import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";

type CustomInputProps = {
  value?: string;
  onClick?: () => void;
};

const CustomInput = forwardRef<HTMLDivElement, CustomInputProps>(
  ({ value, onClick }, ref) => (
    <div
      ref={ref}
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span className={!value ? "text-gray-400 text-sm" : "text-sm"}>
        {value || "dd/MM/yyyy - dd/MM/yyyy"}
      </span>
      <FiCalendar className="text-gray-500" />
    </div>
  )
);

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: [Date | null, Date | null]) => void;
}

CustomInput.displayName = "CustomInput";

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) => {
  const formattedRange =
    startDate && endDate
      ? `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
      : "Select date range";

  return (
    <div className="border border-gray-300 rounded-md px-3 py-2 flex items-center gap-2 shadow-sm w-fit bg-white min-w-20">
      <span className="font-semibold min-w-22 text-sm">Import Date :</span>
      <DatePicker
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        customInput={<CustomInput value={formattedRange} />}
        dateFormat="dd/MM/yyyy"
        wrapperClassName="w-full"
      />
    </div>
  );
};

export default DateRangePicker;
