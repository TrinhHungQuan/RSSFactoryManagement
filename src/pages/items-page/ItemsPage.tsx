import { Pagination, Spin } from "antd";
import SearchInput from "../../components/SearchInput";
import FilterSelect from "../../components/FilterSelect";
import { useEffect, useState } from "react";
import { RxCaretDown, RxCaretSort, RxCaretUp, RxLayout } from "react-icons/rx";
import UIConfigModal from "./components/UIConfig";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../services/api";
import { IoChevronDown, IoChevronUp, IoWarningOutline } from "react-icons/io5";
import { ApiItem, Item } from "./hooks/useItems";
import { FaRegCheckCircle, FaRegCircle } from "react-icons/fa";
import {
  endOfDay,
  format,
  isWithinInterval,
  parse,
  startOfDay,
} from "date-fns";
import DateRangePicker from "../../components/DateRangePicker";

interface ConfigFilter {
  name: string;
  label: string;
}

const ItemsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [isUIConfigModalOpen, setIsUIConfigModalOpen] = useState(false);

  const [configFilters, setConfigFilters] = useState<ConfigFilter[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [rawItems, setRawItems] = useState<Item[]>([]);
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, { label: string; value: string }[]>
  >({});

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

  // Filters by Date
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Other Filters Open And Close
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const currentUserId = localStorage.getItem("currentUserId");
  const screen_code = "ITEM_MANAGEMENT";

  // Function to convert camelCase to Normal Case
  const toNormalCase = (text: string) =>
    text.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  // Format Date
  function formatDate(date: string | Date | null): string | null {
    if (!date) return null;
    try {
      if (date instanceof Date) {
        return format(date, "dd/MM/yyyy");
      }
      const parsed = parse(date, "MM/dd/yyyy", new Date());
      return format(parsed, "dd/MM/yyyy");
    } catch {
      return null;
    }
  }

  // Handle Show Add Modal
  const showUIConfigModal = () => {
    setIsUIConfigModalOpen(true);
  };

  const handleCancelUIConfigModal = () => {
    setIsUIConfigModalOpen(false);
  };

  // Featch UI Config
  const fetchUIConfig = async () => {
    setLoadingConfig(true);
    try {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(API_ENDPOINTS.getUIConfig, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && {
            Authorization: `Bearer ${accessToken}`,
          }),
        },
      });
      const rawConfigJson = response.data.result.configJson;

      // Parse the stringified JSON array
      const parsedConfig: string[] = JSON.parse(rawConfigJson);

      const toCamelCase = (str: string) =>
        str
          .toLowerCase()
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, "");

      const convertedFilters = parsedConfig.map((label) => ({
        name: toCamelCase(label),
        label,
      }));
      setConfigFilters(convertedFilters);
    } catch (error) {
      console.error("Failed to fetch UI config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };
  useEffect(() => {
    fetchUIConfig();
  }, []);

  // First, update the fetchAllItems function to correctly access the nested content
  const fetchAllItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await axios.get(API_ENDPOINTS.getAllItems, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 0,
          size: 10000, // Assumes 10,000 can cover all items
        },
      });

      if (
        response.data &&
        response.data.result &&
        response.data.result.content
      ) {
        const fetchedItems: Item[] = response.data.result.content.map(
          (item: ApiItem) => ({
            id: item.id,
            pieceNo: item.pieceNo,
            itemNo: item.itemNo,
            quantity: item.quantity,
            status: item.status,
            pickingList: item.pickingList,
            description: item.description,
            qrCode: item.qrCode,
            itemNote: item.itemNote,
            steelMaterial: item.steelMaterial,
            steelGauge: item.steelGauge,
            insulation: item.insulation,
            weight: item.weight,
            area: item.area,
            itemVolume: item.itemVolume,
            qc: item.qc,
            dims1: item.dims1,
            dims2: item.dims2,
            dims3: item.dims3,
            dims4: item.dims4,
            dims5: item.dims5,
            dims6: item.dims6,
            dims7: item.dims7,
            dims8: item.dims8,
            dims9: item.dims9,
            dims10: item.dims10,
            ftime: item.ftime,
            mrate: item.mrate,
            connector1: item.connector1,
            connector2: item.connector2,
            connector3: item.connector3,
            connector4: item.connector4,
            materialWeight: item.materialWeight,
            insulationMaterial: item.insulationMaterial,
            insulationArea: item.insulationArea,
            totalWeight: item.totalWeight,
            hasDeleted: item.hasDeleted,
            updatedAt: new Date(item.updatedAt),
            createdAt: new Date(item.createdAt),
            productCode: item.productCode,
            ductArea: item.ductArea,
            jobId: item.jobId,
            fileName: item.fileName,
            readyQty: item.readyQty,
            deliveredQty: item.deliveredQty,
            qcDate: item.qcDate ? new Date(item.qcDate) : null,
            qcUserIds: item.qcUserIds,
          })
        );

        setAllItems(fetchedItems);
        setRawItems(fetchedItems);

        if (response.data.result.totalElements) {
          setTotalItems(response.data.result.totalElements);
        }
      } else {
        setAllItems([]);
        setTotalItems(0);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          error.response?.data.message || "An unknown error occurred.";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch once on first render
  useEffect(() => {
    fetchAllItems();
  }, []);

  // Update items when page, pageSize or changes
  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;

    // Apply sorting to the entire dataset first
    const sortedItems = [...allItems];

    // Sorting
    if (sortKey && sortOrder !== "none") {
      sortedItems.sort((a, b) => {
        const aVal = a[sortKey as keyof Item];
        const bVal = b[sortKey as keyof Item];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    // Set the items for the current page after sorting
    setItems(sortedItems.slice(startIndex, endIndex));
  }, [currentPage, pageSize, allItems, sortKey, sortOrder]);

  // Page Handle
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Extract Options From Items
  const extractOptionsFromItems = (items: Item[], keys: string[]) => {
    const options: Record<string, { label: string; value: string }[]> = {};

    keys.forEach((key) => {
      const uniqueValues = Array.from(
        new Set(items.map((item) => item[key as keyof Item]).filter(Boolean))
      );

      const allAreNumbers = uniqueValues.every((val) => !isNaN(Number(val)));

      const sortedValues = allAreNumbers
        ? uniqueValues.sort((a, b) => Number(a) - Number(b))
        : uniqueValues.sort((a, b) => String(a).localeCompare(String(b)));

      const selectOptions = sortedValues.map((val) => ({
        label: String(val),
        value: String(val),
      }));

      options[key] = [{ label: "All", value: "" }, ...selectOptions];
    });
    return options;
  };

  useEffect(() => {
    if (rawItems.length > 0) {
      const keysToFilter = configFilters.map((filter) => filter.name);
      const generatedOptions = extractOptionsFromItems(rawItems, keysToFilter);
      setDynamicOptions(generatedOptions);
    }
  }, [rawItems, configFilters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Define custom key mapping
  const customKeyMap: Record<string, string> = {
    ftime: "fTime",
    mrate: "mRate",
  };

  const fieldsToKeepAsString = ["pieceNo"];

  // Apply filters
  const handleApplyFilters = async () => {
    try {
      setLoading(true);

      const normalizedFilters = Object.fromEntries(
        Object.entries(filterValues).map(([key, value]) => {
          const mappedKey = customKeyMap[key] || key;
          const trimmed = value.trim().toLowerCase();

          const isNumber = !isNaN(Number(value)) && trimmed !== "";
          const isBoolean = trimmed === "true" || trimmed === "false";

          return [
            mappedKey,
            fieldsToKeepAsString.includes(key)
              ? trimmed
              : isNumber
              ? Number(value)
              : isBoolean
              ? trimmed.toLowerCase() === "true"
              : trimmed,
          ];
        })
      );

      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await axios.post(
        API_ENDPOINTS.filterItems,
        {
          filters: normalizedFilters,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      let content = response.data?.result?.content || [];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        content = content.filter((item: Record<string, unknown>) =>
          Object.values(item).some(
            (value: unknown) => String(value).toLowerCase() === query
          )
        );
      }

      if (startDate && endDate) {
        content = content.filter((item: Item) => {
          const createdAt = new Date(item.createdAt);
          return isWithinInterval(createdAt, {
            start: startOfDay(startDate),
            end: endOfDay(endDate),
          });
        });
      }

      setIsFiltersCollapsed(true);
      setAllItems(content);
      setTotalItems(content.length);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      const nextOrder =
        sortOrder === "none" ? "asc" : sortOrder === "asc" ? "desc" : "none";
      setSortOrder(nextOrder);
      if (nextOrder === "none") setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <div className={`transition-all duration-300 ease-in-out pl-[0px]`}>
        <div className="flex justify-between items-center top-0 ml-6 mr-6 mb-4 mt-[15px] pt-0 pl-0">
          <h1 className="text-xl font-semibold">Item Management</h1>
        </div>
        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mb-4">
            <p>{error}</p>
          </div>
        )}
        <div className="flex flex-col">
          {/* Search, Date Filter and UI Config */}
          <div className="w-full px-6 mb-3 flex flex-row gap-2 items-center justify-center">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                placeholder="Search by Job Code, Job ID, Piece No, Drawing No, Picking List, File Name, Company Name,..."
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
              />
            </div>
            <div className="flex flex-row gap-2 items-center w-1/3">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(range: [Date | null, Date | null]) => {
                  const [startDate, endDate] = range;

                  setStartDate(startDate);
                  setEndDate(endDate);
                }}
              />
              <button
                className="h-10 w-10 border rounded border-gray-300 flex justify-center items-center cursor-pointer"
                onClick={showUIConfigModal}
              >
                <RxLayout />
              </button>
            </div>
          </div>

          {/* Other Filters */}
          {configFilters.length > 0 ? (
            <div className="ml-6 mr-6 p-3 flex flex-row gap-2 items-center justify-center border border-gray-300 rounded-md relative">
              {loadingConfig ? (
                <div className="w-full text-center">
                  <Spin />
                </div>
              ) : (
                <div className="w-full">
                  {Array.from(
                    { length: Math.ceil(configFilters.length / 4) },
                    (_, rowIndex) => {
                      const isHidden = isFiltersCollapsed && rowIndex > 0;

                      // Slice 4 filters per row
                      const filtersInRow = configFilters.slice(
                        rowIndex * 4,
                        rowIndex * 4 + 4
                      );

                      // If this is the last row, add buttons as the last item
                      const isLastRow =
                        rowIndex === Math.ceil(configFilters.length / 4) - 1;

                      return (
                        <div
                          key={rowIndex}
                          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ease-in-out ${
                            isHidden
                              ? "opacity-0 max-h-0 overflow-hidden mb-0"
                              : "opacity-100 max-h-[500px] mb-3"
                          }`}
                        >
                          {filtersInRow.map((filter) => (
                            <FilterSelect
                              key={filter.name}
                              label={filter.label}
                              name={filter.name}
                              value={filterValues[filter.name] || ""}
                              options={
                                dynamicOptions[
                                  filter.name as keyof typeof dynamicOptions
                                ] || []
                              }
                              onChange={(e) =>
                                handleFilterChange(filter.name, e.target.value)
                              }
                            />
                          ))}

                          {/* Add Clear/Apply buttons in last grid row */}
                          {isLastRow && (
                            <div className="flex gap-2 items-end">
                              <button
                                onClick={() => setFilterValues({})}
                                className="font-semibold border h-10 w-18 text-black text-sm bg-white rounded-md border-gray-300 cursor-pointer"
                              >
                                Clear
                              </button>
                              <button
                                onClick={handleApplyFilters}
                                className="font-semibold border h-10 w-18 text-orange-600 text-sm bg-white rounded-md border-gray-300 cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={() => {
                        setIsFiltersCollapsed(!isFiltersCollapsed);
                      }}
                      className="text-white bg-orange-400 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md hover:bg-orange-500 transition cursor-pointer"
                    >
                      {isFiltersCollapsed ? <IoChevronDown /> : <IoChevronUp />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Items Table */}
          <div className="p-4">
            <div className="overflow-hidden rounded-lg border border-gray-300">
              {/* Table Scroll Container */}
              <div className="overflow-x-auto">
                <table className="min-w-[1000px] w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      {items.length > 0 &&
                        Object.keys(items[0]).map((key) => (
                          <th
                            key={key}
                            className={`px-4 py-2 font-semibold cursor-pointer ${
                              key === "status"
                                ? "max-w-[150px]"
                                : "min-w-[200px]"
                            } ${
                              key === "readyQty" ||
                              key === "deliveredQty" ||
                              key === "quantity"
                                ? "text-right"
                                : "text-left"
                            } `}
                            onClick={() => handleSort(key)}
                          >
                            <span className="flex items-center justify-start">
                              {toNormalCase(key)}
                              {sortKey !== key && (
                                <RxCaretSort className="w-4 h-4" />
                              )}
                              {sortKey === key && sortOrder === "asc" && (
                                <RxCaretDown className="w-4 h-4" />
                              )}
                              {sortKey === key && sortOrder === "desc" && (
                                <RxCaretUp className="w-4 h-4" />
                              )}
                            </span>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-300 hover:bg-gray-50"
                        >
                          {Object.entries(item).map(([key, value], i) => {
                            const isStatus = key === "status";
                            const isQuantity = key === "quantity";
                            const isReady = key === "readyQty";
                            const isDelivered = key === "deliveredQty";

                            return (
                              <td
                                key={i}
                                className={`px-4 py-2 ${
                                  isStatus ? "max-w-[150px]" : "min-w-[200px]"
                                }`}
                              >
                                {isStatus ? (
                                  <div
                                    className={`border font-semibold rounded-3xl flex items-center justify-center pt-0.5 pb-0.5 px-2 text-xs truncate ${
                                      value === "In Production"
                                        ? "border-cyan-500 bg-cyan-500 text-white"
                                        : value === "Ready"
                                        ? "border-yellow-600 bg-yellow-600 text-white"
                                        : value === "Delivered"
                                        ? "border-green-500 bg-green-500 text-white"
                                        : value === "On Hold"
                                        ? "border-purple-500 bg-purple-500 text-white"
                                        : value === "Cancelled"
                                        ? "border-gray-500 bg-gray-500 text-white"
                                        : "border-gray-300 bg-white text-gray-800"
                                    }`}
                                  >
                                    {value}
                                  </div>
                                ) : isReady ? (
                                  <div
                                    className={`flex items-center gap-1 font-semibold justify-end ${
                                      value === item.quantity
                                        ? ""
                                        : "text-red-500"
                                    }`}
                                  >
                                    {`${value} / ${item.quantity ?? 0}`}
                                    {value !== item.quantity && (
                                      <IoWarningOutline />
                                    )}
                                  </div>
                                ) : isDelivered ? (
                                  <div
                                    className={`flex items-center gap-1 font-semibold justify-end ${
                                      value === item.quantity
                                        ? ""
                                        : "text-red-500"
                                    }`}
                                  >
                                    {`${value} / ${item.quantity ?? 0}`}
                                    {value !== item.quantity && (
                                      <IoWarningOutline />
                                    )}
                                  </div>
                                ) : isQuantity ? (
                                  <div className="flex items-center gap-1 justify-end">
                                    {value}
                                  </div>
                                ) : typeof value === "boolean" ? (
                                  value ? (
                                    <FaRegCheckCircle className="text-green-600 w-5 h-5" />
                                  ) : (
                                    <FaRegCircle className="text-gray-400 w-5 h-5" />
                                  )
                                ) : typeof value === "string" &&
                                  /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? (
                                  formatDate(value)
                                ) : typeof value === "string" &&
                                  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(
                                    value
                                  ) ? (
                                  formatDate(new Date(value))
                                ) : value instanceof Date ? (
                                  formatDate(value.toLocaleDateString())
                                ) : (
                                  String(value)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={Object.keys(items[0] || {}).length}
                          className="px-4 py-4 text-center"
                        >
                          {loading ? (
                            <div className="flex flex-row gap-2 items-center justify-center">
                              <p>Loading</p>
                              <Spin />
                            </div>
                          ) : (
                            "No items found"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination component */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between mt-4">
                {/* Items per page */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Items per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    className="border rounded px-2 py-1"
                  >
                    {[10, 15, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pagination controls */}
                <Pagination
                  pageSize={pageSize}
                  current={currentPage + 1}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>

          <UIConfigModal
            isOpen={isUIConfigModalOpen}
            onCancel={handleCancelUIConfigModal}
            onSubmit={(selectedColumns) => {
              const payload = {
                userId: currentUserId,
                screenCode: screen_code,
                configJson: JSON.stringify(selectedColumns),
              };

              const accessToken =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

              axios
                .put(API_ENDPOINTS.saveUIConfig, payload, {
                  headers: {
                    "Content-Type": "application/json",
                    ...(accessToken && {
                      Authorization: `Bearer ${accessToken}`,
                    }),
                  },
                })
                .then((response) => {
                  console.log("Config saved successfully: ", response.data);
                  fetchUIConfig();
                  setFilterValues({});
                  fetchAllItems();
                  setSearchQuery("");
                })
                .catch((error) => {
                  console.error("Error saving config: ", error);
                });
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ItemsPage;
