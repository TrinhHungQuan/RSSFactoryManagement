import { Button } from "antd";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import SearchInput from "../../../components/SearchInput";
import { IoMenu } from "react-icons/io5";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import axios from "axios";
import { API_ENDPOINTS } from "../../../services/api";

interface AddUserFormModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (selectedColumns: string[]) => void;
}

const UIConfigModal = ({
  isOpen,
  onCancel,
  onSubmit,
}: AddUserFormModalProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const screen_code = "ITEM_MANAGEMENT";

  useEffect(() => {
    const fetchUIConfig = async () => {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      try {
        const [uiConfigRes, backendDataRes] = await Promise.all([
          axios.get(API_ENDPOINTS.getUIConfig, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { screenCode: screen_code },
          }),
          axios.get(API_ENDPOINTS.getAllItems, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const configJson = uiConfigRes.data.result?.configJson;
        if (configJson) {
          const parsedConfig: string[] = JSON.parse(configJson);
          setSelectedColumns(parsedConfig);
        }

        const content = backendDataRes.data.result.content;
        if (content && content.length > 0) {
          const keys = Object.keys(content[0]).filter(
            (key) => !["id", "createdAt", "updatedAt", "qcDate"].includes(key)
          );
          const formatted = keys.map((key) =>
            key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
          );
          setAllColumns(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (isOpen) {
      fetchUIConfig();
    }
  }, [isOpen]);

  useEffect(() => console.log(allColumns), [allColumns]);

  const toggleColumn = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleClear = () => setSelectedColumns([]);
  const handleRemove = (col: string) =>
    setSelectedColumns((prev) => prev.filter((c) => c !== col));

  const handleSubmit = () => {
    onSubmit(selectedColumns);
    onCancel();
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSelectedColumns((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = over ? items.indexOf(over.id as string) : -1;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="bg-black opacity-50 absolute inset-0"
        onClick={onCancel}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg w-3/5 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-semibold">UI Config</h1>
          <button onClick={onCancel} className="cursor-pointer">
            <IoClose className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full h-px bg-gray-300" />

        <div className="flex p-4 gap-4">
          {/* Left */}
          <div className="w-1/2 border border-gray-300 rounded-md p-2 h-[400px] overflow-y-auto">
            <SearchInput
              value={searchQuery}
              placeholder="Search column"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-col gap-1 mt-2">
              {/* All Fields checkbox */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedColumns.length === allColumns.length}
                  onChange={() => {
                    if (selectedColumns.length === allColumns.length) {
                      setSelectedColumns([]);
                    } else {
                      setSelectedColumns(allColumns);
                    }
                  }}
                />
                All Fields
              </label>

              {/* Filtered list based on search */}
              {allColumns
                .filter((col) =>
                  col.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((col) => (
                  <label key={col} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                    />
                    {col}
                  </label>
                ))}
            </div>
          </div>

          {/* Right */}
          <div className="w-1/2 border border-gray-300 rounded-md p-2 h-[400px] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm">
                {selectedColumns.length} columns selected
              </p>
              <button
                onClick={handleClear}
                className="text-blue-500 text-sm cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Divider line */}
            <div className="w-full h-px bg-gray-300 mt-0 mb-2" />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedColumns}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {selectedColumns.map((col) => (
                    <SortableItem
                      key={col}
                      id={col}
                      onRemove={() => handleRemove(col)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-300">
          <Button
            style={{
              height: "40px",
              width: "80px",
              backgroundColor: "white",
              color: "#000",
            }}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            style={{
              height: "40px",
              width: "80px",
              backgroundColor: "#F97316",
            }}
            className="!font-semibold"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UIConfigModal;

// Sortable Item Component
const SortableItem = ({
  id,
  onRemove,
}: {
  id: string;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between border border-gray-300 px-2 py-1 rounded bg-white shadow-sm"
      {...attributes}
    >
      <div className="flex items-center gap-2 cursor-move" {...listeners}>
        <IoMenu />
        {id}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="cursor-pointer"
      >
        <IoClose />
      </button>
    </div>
  );
};
