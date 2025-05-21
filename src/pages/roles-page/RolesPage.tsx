import { Button, Pagination, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { API_ENDPOINTS } from "../../services/api";
import axios from "axios";
import { RxCaretDown, RxCaretSort, RxCaretUp } from "react-icons/rx";

type LayoutContextType = {
  isSiderCollapsed: boolean;
};

// Define interfaces for the API response structure
export interface ApiRole {
  roleId: number;
  name: string;
  description: string;
}

interface Role {
  roleId: number;
  name: string;
  description: string;
}

const RolesPage = () => {
  const { isSiderCollapsed } = useOutletContext<LayoutContextType>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  // Fetch all users on first load
  const fetchAllRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await axios.get(API_ENDPOINTS.getRolesTable, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 0,
          size: 10000, // Assumes 10,000 can cover all
        },
      });

      const fetchedRoles: Role[] = response.data.result.map(
        (role: ApiRole) => ({
          roleId: role.roleId,
          name: role.name,
          description: role.description,
        })
      );

      setAllRoles(fetchedRoles);
      setTotalItems(fetchedRoles.length);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch once on first render
  useEffect(() => {
    fetchAllRoles();
  }, []);

  // Update when page or pageSize changes
  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    setRoles(allRoles.slice(startIndex, endIndex));
  }, [currentPage, pageSize, allRoles]);

  // Page Handle
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Sorting
  const [sortOrderId, setSortOrderId] = useState<"asc" | "desc" | "none">(
    "none"
  );
  const [sortOrderName, setSortOrderName] = useState<"asc" | "desc" | "none">(
    "none"
  );

  const sortRole = useCallback(
    (sorRolesList: Role[]) => {
      if (sortOrderId !== "none") {
        return [...sorRolesList].sort((a, b) => {
          if (sortOrderId === "asc") return a.roleId - b.roleId;
          if (sortOrderId === "desc") return b.roleId - a.roleId;
          return 0;
        });
      } else if (sortOrderName !== "none") {
        return [...sorRolesList].sort((a, b) => {
          if (sortOrderName === "asc") return a.name.localeCompare(b.name);
          if (sortOrderName === "desc") return b.name.localeCompare(a.name);
          return 0;
        });
      }
      return sorRolesList;
    },
    [sortOrderId, sortOrderName]
  );

  useEffect(() => {
    const sortedRoles = sortRole(allRoles);
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    setRoles(sortedRoles.slice(startIndex, endIndex));
    setTotalItems(sortedRoles.length); // Update total items for pagination
  }, [sortRole, currentPage, pageSize, sortOrderId, sortOrderName, allRoles]);

  // Sort Handlers
  const handleSortIdClick = () => {
    setSortOrderId((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderName("none");
  };

  const handleSortNameClick = () => {
    setSortOrderName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderId("none");
  };

  const sortedRoles = sortRole(roles);
  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSiderCollapsed ? "lg:pl-[0px] pl-[60px]" : "pl-[220px]"
        }`}
      >
        <div className="flex justify-between items-center top-0 ml-6 mr-6 mb-4 mt-[15px] pt-0 pl-0">
          <h1 className="text-xl font-semibold">Roles Management</h1>
          <Button
            type="primary"
            style={{ height: "40px", backgroundColor: "#F97316" }}
            className="!font-semibold"
            onClick={() => navigate("/roles/add")}
          >
            + Add New Role Admin
          </Button>
        </div>
        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="overflow-x-auto px-6">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortIdClick}
                  >
                    <span className="flex items-center justify-between">
                      ID
                      {sortOrderId === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderId === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderId === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortNameClick}
                  >
                    <span className="flex items-center justify-between">
                      Role Name
                      {sortOrderName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRoles.length > 0 ? (
                  sortedRoles.map((role) => (
                    <tr
                      key={role.roleId}
                      className="border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/roles/${role.roleId}`)}
                    >
                      <td className="px-4 py-2">{role.roleId}</td>
                      <td className="px-4 py-2 ">{role.name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-4 text-center">
                      {loading ? (
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <p>Loading</p>
                          <Spin />
                        </div>
                      ) : (
                        "No roles found"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination component */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-4">
              {/* Items per page */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Items per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
      </div>
    </>
  );
};

export default RolesPage;
