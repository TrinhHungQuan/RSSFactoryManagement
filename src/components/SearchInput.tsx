import { ChangeEvent, KeyboardEvent } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const SearchInput = ({
  value,
  placeholder,
  onChange,
  onKeyDown,
}: SearchInputProps) => {
  return (
    <>
      <div className="relative w-full">
        <input
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="w-full h-10 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500 border-gray-300"
        />
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
      </div>
    </>
  );
};

export default SearchInput;
