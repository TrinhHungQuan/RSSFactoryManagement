import { Button, Pagination, Spin } from "antd";
import { useEffect, useState } from "react";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import AddUserFormModal from "./components/AddUserFormModal";
import EditUserFormModal from "./components/EditFormModal";
import { useOutletContext } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { RxCaretSort } from "react-icons/rx";
import { RxCaretDown } from "react-icons/rx";
import { RxCaretUp } from "react-icons/rx";
import { API_ENDPOINTS, BASE_URL } from "../../services/api";
import axios from "axios";
import { AxiosError } from "axios";
import UserDetails from "./components/UserDetails";
import { FaUserCircle } from "react-icons/fa";
import { User } from "./hooks/useUsers";
import { FormAddValues } from "./hooks/useFormValues";
import { format, parse } from "date-fns";
import { Alert, Snackbar } from "@mui/material";

type LayoutContextType = {
  isSiderCollapsed: boolean;
};

// Define interfaces for the API response structure
interface ApiUser {
  userId: string;
  image: string;
  username: string;
  firstname: string;
  lastname: string;
  company: ApiCompany[];
  team: ApiTeam[];
  dateOfBirth: string;
  roleName: string;
  status: string;
}

interface ApiCompany {
  id: string;
  code: string;
  companyName: string;
  subcontractor: boolean;
  state: string;
  status: string;
  contactName: string;
  mobilePhone: string;
  address: string;
  createAt: string;
  updateAt: string;
}

interface ApiTeam {
  id: string;
  name: string;
  createAt: string;
  updateAt: string;
}

interface ApiResponse {
  code: number;
  message: string;
  result: {
    content: ApiUser[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
}

const UsersPage = () => {
  const { isSiderCollapsed } = useOutletContext<LayoutContextType>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");

  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Get the Users
  const fetchUsers = async (page: number, size: number) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!accessToken) {
        setError("Authentication required. Please login.");
        setLoading(false);
        return;
      }

      const response = await axios.get<ApiResponse>(API_ENDPOINTS.getUser, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page,
          size,
        },
      });
      if (response.data && response.data.result?.content) {
        // Map API response to expected User format
        const mappedUsers: User[] = response.data.result.content.map(
          (user: ApiUser) => ({
            userId: user.userId,
            username: user.username,
            firstName: user.firstname,
            lastName: user.lastname,
            company:
              user.company?.length > 0
                ? user.company.map(
                    (c: { companyName: string }) => c.companyName
                  )
                : [],
            engineeringTeam:
              user.team?.length > 0
                ? user.team.map((c: { name: string }) => c.name)
                : [],
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
            role: user.roleName,
            status: user.status === "ACTIVE" ? "Active" : "Inactive",
            image: user.image || "",
          })
        );

        setUsers(mappedUsers);

        if (response.data.result.totalElements !== undefined) {
          setTotalItems(response.data.result.totalElements);
        }
        // if (response.data.result.totalPages !== undefined) {
        //   setTotalPages(response.data.result.totalPages);
        // }
        if (response.data.result.currentPage !== undefined) {
          setCurrentPage(response.data.result.currentPage);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    // Ant Design Pagination is 1-indexed, but our API expects 0-indexed
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason: string
  ) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const handleAlertClose = () => {
    setSnackBarOpen(false);
  };

  const showEditModal = () => {
    setIsEditModalOpen(true);
  };

  const showUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  const handleCancelAddModal = () => {
    setIsAddModalOpen(false);
    addFormik.resetForm();
  };

  const resetImage = () => {
    // Do nothing if image state is inside modal
  };

  const handleCancelEditModel = () => {
    setIsEditModalOpen(false);
  };

  const handleCancelUserDetails = () => {
    setIsDetailsOpen(false);
  };

  function formatDateForApi(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
      return format(parsed, "yyyy-MM-dd"); // format to what backend expects
    } catch {
      return null;
    }
  }
  const addFormik = useFormik<FormAddValues>({
    initialValues: {
      firstName: "",
      userName: "",
      role: "",
      engineeringTeams: [],
      password: "",
      lastName: "",
      dateOfBirth: "",
      company: [],
      status: "",
      image: "",
    },

    validationSchema: Yup.object({
      firstName: Yup.string()
        .required("First name is required")
        .matches(/^[a-zA-z\s]+$/, "Must only contain letters")
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters"),

      userName: Yup.string()
        .matches(
          /^[a-zA-Z0-9]+$/,
          "Username must only contain letters and number"
        )
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters")
        .required("Username is required"),

      role: Yup.string().required("Role is required"),

      engineeringTeams: Yup.array()
        .of(Yup.string().required())
        .min(1, "At least one team must be selected")
        .required("Team is required"),

      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Password must contain at least 1 lowercase")
        .matches(/[A-Z]/, "Password must contain at leat 1 uppercase")
        .matches(/[0-9]/, "Password must contain at least 1 number")
        .matches(/[\W_]/, "Password must contain at least 1 special character")
        .required("Password is required"),

      lastName: Yup.string()
        .matches(/^[a-zA-Z\s]+$/, "Last name must only contain letters")
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters")
        .required("Last Name is required"),

      dateOfBirth: Yup.string()
        .required("Date of birth is required")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19\d{2}|20\d{2})$/,
          "Date of birth must be in format dd/mm/yyyy and year must be from 1900"
        ),

      company: Yup.array()
        .of(Yup.string().required())
        .min(1, "At least one company must be selected")
        .required("Company is required"),

      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (
      values: FormAddValues,
      formikHelpers: FormikHelpers<FormAddValues>
    ) => {
      const { setSubmitting, resetForm } = formikHelpers;

      try {
        const formattedValues = {
          firstname: values.firstName,
          lastname: values.lastName,
          username: values.userName,
          password: values.password,
          role: {
            id: parseInt(values.role),
          },
          teamIds: values.engineeringTeams,
          companyIds: values.company,
          dateOfBirth: formatDateForApi(values.dateOfBirth),
          status: values.status,
          image: values.image || null,
        };

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const response = await axios.post(
          API_ENDPOINTS.createUser,
          formattedValues,
          {
            headers: {
              "Content-Type": "application/json",
              // Include auth token if your API requires it
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        console.log("User created successfully: ", response.data);

        resetForm();
        handleCancelAddModal();
        fetchUsers(currentPage, pageSize);
      } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof AxiosError && error.response) {
          // If the error has a response object, extract the message
          const errorMessage =
            error.response?.data.message || "An unknown error occurred.";
          setSnackBarMessage(errorMessage); // Set the error message
          setSnackBarOpen(true); // Open the Snackbar
        } else {
          setSnackBarMessage("Network error. Please try again later.");
          setSnackBarOpen(true);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      firstName: "",
      userName: "",
      role: "",
      engineeringTeams: "",
      lastName: "",
      dateOfBirth: "",
      company: "",
      status: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required("First name is required")
        .matches(/^[a-zA-z]+$/, "Must only contain letters")
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters"),

      userName: Yup.string()
        .matches(
          /^[a-zA-Z0-9]+$/,
          "Username must only contain letters and number"
        )
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters")
        .required("Username is required"),

      role: Yup.string().required("Role is required"),

      engineeringTeams: Yup.string().required("Engineering Teams is required"),

      lastName: Yup.string()
        .matches(/^[a-zA-Z]+$/, "Last name must only contain letters")
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters")
        .required("Last Name is required"),

      dateOfBirth: Yup.string()
        .required("Date of birth is required")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19\d{2}|20\d{2})$/,
          "Date of birth must be in format dd/mm/yyyy and year must be from 1900"
        ),

      company: Yup.string().required("Company is required"),

      status: Yup.string().required("Status is required"),
    }),
    onSubmit: () => {},
  });

  const [sortOrderFirstName, setSortOrderFirstName] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderLastName, setSortOrderLastName] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderCompany, setSortOrderCompany] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderEngineeringTeam, setSortOrderEngineeringTeam] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderDateOfBirth, setSortOrderDateOfBirth] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderRole, setSortOrderRole] = useState<"asc" | "desc" | "none">(
    "none"
  );

  // Sort Event
  const sortUser = (sortUsersList: User[]) => {
    if (sortOrderFirstName !== "none") {
      return [...sortUsersList].sort((a, b) => {
        if (sortOrderFirstName === "asc")
          return a.firstName.localeCompare(b.firstName);
        if (sortOrderFirstName === "desc")
          return b.firstName.localeCompare(a.firstName);
        return 0;
      });
    } else if (sortOrderLastName !== "none") {
      return [...sortUsersList].sort((a, b) => {
        if (sortOrderLastName === "asc")
          return a.lastName.localeCompare(b.lastName);
        if (sortOrderLastName === "desc")
          return b.lastName.localeCompare(a.lastName);
        return 0;
      });
    } else if (sortOrderCompany !== "none") {
      return [...sortUsersList].sort((a, b) => {
        const companyA = a.company[0] || "";
        const companyB = b.company[0] || "";
        if (sortOrderCompany === "asc") return companyA.localeCompare(companyB);
        if (sortOrderCompany === "desc")
          return companyB.localeCompare(companyA);
        return 0;
      });
    } else if (sortOrderEngineeringTeam !== "none") {
      return [...sortUsersList].sort((a, b) => {
        const engineeringTeamA = a.engineeringTeam[0] || "";
        const engineeringTeamB = b.engineeringTeam[0] || "";
        if (sortOrderEngineeringTeam === "asc")
          return engineeringTeamA.localeCompare(engineeringTeamB);
        if (sortOrderEngineeringTeam === "desc")
          return engineeringTeamB.localeCompare(engineeringTeamA);
        return 0;
      });
    } else if (sortOrderDateOfBirth !== "none") {
      return [...sortUsersList].sort((a, b) => {
        if (!a.dateOfBirth && !b.dateOfBirth) return 0;
        if (!a.dateOfBirth) return sortOrderDateOfBirth === "asc" ? -1 : 1;
        if (!b.dateOfBirth) return sortOrderDateOfBirth === "asc" ? 1 : -1;
        const dateA = a.dateOfBirth.getTime();
        const dateB = b.dateOfBirth.getTime();

        if (sortOrderDateOfBirth === "asc") return dateA - dateB;
        if (sortOrderDateOfBirth === "desc") return dateB - dateA;
        return 0;
      });
    } else if (sortOrderRole !== "none") {
      return [...sortUsersList].sort((a, b) => {
        if (sortOrderRole === "asc") return a.role.localeCompare(b.role);
        if (sortOrderRole === "desc") return b.role.localeCompare(a.role);
        return 0;
      });
    }
    return sortUsersList;
  };

  const handleSortFirstNameClick = () => {
    setSortOrderFirstName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderLastName("none");
    setSortOrderCompany("none");
    setSortOrderEngineeringTeam("none");
    setSortOrderDateOfBirth("none");
    setSortOrderRole("none");
  };

  const handleSortLastNameClick = () => {
    setSortOrderLastName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderFirstName("none");
    setSortOrderCompany("none");
    setSortOrderEngineeringTeam("none");
    setSortOrderDateOfBirth("none");
    setSortOrderRole("none");
  };

  const handleSortCompanyClick = () => {
    setSortOrderCompany((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderFirstName("none");
    setSortOrderLastName("none");
    setSortOrderEngineeringTeam("none");
    setSortOrderDateOfBirth("none");
    setSortOrderRole("none");
  };

  const handleSortEngineeringTeamClick = () => {
    setSortOrderEngineeringTeam((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderFirstName("none");
    setSortOrderLastName("none");
    setSortOrderCompany("none");
    setSortOrderDateOfBirth("none");
    setSortOrderRole("none");
  };

  const handleSortDateOfBirthClick = () => {
    setSortOrderDateOfBirth((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderFirstName("none");
    setSortOrderLastName("none");
    setSortOrderCompany("none");
    setSortOrderEngineeringTeam("none");
    setSortOrderRole("none");
  };

  const handleSortRoleClick = () => {
    setSortOrderRole((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderFirstName("none");
    setSortOrderLastName("none");
    setSortOrderCompany("none");
    setSortOrderEngineeringTeam("none");
    setSortOrderDateOfBirth("none");
  };

  const sortedUsers = sortUser(users);

  return (
    <>
      <Snackbar
        open={snackBarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleAlertClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSiderCollapsed ? "lg:pl-[0px] pl-[60px]" : "pl-[220px]"
        }`}
      >
        <div className="flex justify-between items-center top-0 ml-6 mr-6 mb-4 mt-[15px] pt-0 pl-0">
          <h1 className="text-xl font-semibold">User Management</h1>
          <Button
            type="primary"
            style={{ height: "40px", backgroundColor: "#F97316" }}
            className="!font-semibold"
            onClick={showAddModal}
          >
            + Add User
          </Button>
        </div>
        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mb-4">
            <p>{error}</p>
          </div>
        )}
        <div className="overflow-x-auto px-6 scrollbar-none">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-between"></span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-between">
                      Username
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortFirstNameClick}
                  >
                    <span className="flex items-center justify-between">
                      First Name
                      {sortOrderFirstName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderFirstName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderFirstName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span
                      className="flex items-center justify-start"
                      onClick={handleSortLastNameClick}
                    >
                      Last Name
                      {sortOrderLastName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderLastName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderLastName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortCompanyClick}
                  >
                    <span className="flex items-center justify-between">
                      Company
                      {sortOrderCompany === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderCompany === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderCompany === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span
                      className="flex items-center justify-start"
                      onClick={handleSortEngineeringTeamClick}
                    >
                      Engineering Team
                      {sortOrderEngineeringTeam === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderEngineeringTeam === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderEngineeringTeam === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span
                      className="flex items-center justify-between"
                      onClick={handleSortDateOfBirthClick}
                    >
                      Date of Birth
                      {sortOrderDateOfBirth === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderDateOfBirth === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderDateOfBirth === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span
                      className="flex items-center justify-start"
                      onClick={handleSortRoleClick}
                    >
                      Role
                      {sortOrderRole === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderRole === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderRole === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Status
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-center">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length > 0 ? (
                  sortedUsers.map((user) => (
                    <tr
                      key={user.userId}
                      className="border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
                      onClick={() => showUserDetails(user.userId)}
                    >
                      <td className="px-4 py-2">
                        {user.image ? (
                          <img
                            src={`${BASE_URL}/${user.image}`}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-6 h-6 rounded-full object-cover flex items-center justify-center"
                          />
                        ) : (
                          <FaUserCircle className="w-6 h-6" />
                        )}
                      </td>
                      <td className="px-4 py-2">{user.username}</td>
                      <td className="px-4 py-2">{user.firstName}</td>
                      <td className="px-4 py-2">
                        {user.lastName ? user.lastName : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {user.company && user.company.length > 0
                          ? user.company.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {user.engineeringTeam && user.engineeringTeam.length > 0
                          ? user.engineeringTeam.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {user.dateOfBirth
                          ? format(new Date(user.dateOfBirth), "dd/MM/yyyy")
                          : "-"}
                      </td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">
                        <div
                          className={`border font-semibold rounded-3xl flex items-center justify-center pt-0.5 pb-0.5 pl-1 pr-1 ${
                            user.status === "Active"
                              ? "border-green-600 bg-green-50 text-green-600 text-xs"
                              : "border-gray-600 bg-gray-50 text-gray-600 text-xs"
                          }`}
                        >
                          {user.status}
                        </div>
                      </td>
                      <td className="flex flex-row items-center justify-center">
                        <Button
                          type="link"
                          icon={<FiEdit3 />}
                          style={{ width: 32, height: 32, color: "#F97316" }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents row click
                            showEditModal();
                          }}
                        />
                        <Button
                          type="link"
                          icon={<RiDeleteBinLine />}
                          style={{ width: 32, height: 32, color: "black" }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents row click
                            // Add delete logic here
                          }}
                        />
                      </td>
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
                        "No users found"
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
                current={currentPage + 1} // Convert to 1-indexed
                total={totalItems}
                onChange={handlePageChange}
                showSizeChanger={false} // We use custom size dropdown on the left
                showQuickJumper
              />
            </div>
          )}
        </div>

        <AddUserFormModal
          isOpen={isAddModalOpen}
          onCancel={handleCancelAddModal}
          formik={addFormik}
          onResetImage={resetImage}
        />
        <EditUserFormModal
          isOpen={isEditModalOpen}
          onCancel={handleCancelEditModel}
          formik={editFormik}
        />

        <UserDetails
          isOpen={isDetailsOpen}
          onCancel={handleCancelUserDetails}
          userId={selectedUserId}
        />
      </div>
    </>
  );
};

export default UsersPage;
