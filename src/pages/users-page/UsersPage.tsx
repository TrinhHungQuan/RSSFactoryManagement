import { Button, Pagination, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import AddUserFormModal from "./components/AddUserFormModal";
import EditUserFormModal from "./components/EditFormModal";

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
import { FormAddValues, FormEditValues } from "./hooks/useFormValues";
import { format, parse } from "date-fns";
import { Alert, Snackbar } from "@mui/material";
import SearchInput from "../../components/SearchInput";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import FilterSelect from "../../components/FilterSelect";

// Define interfaces for the API response structure
export interface ApiUser {
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

const UsersPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [savedUserId, setSavedUserId] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [statusQuery, setStatusQuery] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Get the Users
  // Fetch all users on first load
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await axios.get(API_ENDPOINTS.getUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 0,
          size: 10000, // Assumes 10,000 can cover all users
        },
      });

      const fetchedUsers: User[] = response.data.result.content.map(
        (user: ApiUser) => ({
          userId: user.userId,
          username: user.username,
          firstName: user.firstname,
          lastName: user.lastname,
          company:
            user.company?.map((c: { companyName: string }) => c.companyName) ||
            [],
          engineeringTeam:
            user.team?.map((t: { name: string }) => t.name) || [],
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
          role: user.roleName,
          status: user.status === "ACTIVE" ? "Active" : "Inactive",
          image: user.image || "",
        })
      );

      setAllUsers(fetchedUsers);
      setTotalItems(fetchedUsers.length);
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
    fetchAllUsers();
  }, []);

  // Update users when page or pageSize changes
  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    setUsers(allUsers.slice(startIndex, endIndex));
  }, [currentPage, pageSize, allUsers]);

  // Reload the table
  const handleUserUpdated = () => {
    fetchAllUsers();
  };

  // Page Handle
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Fetch Roles
  const fetchRoles = useCallback(async () => {
    try {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!accessToken) {
        console.error("Authentication required. Login!");
        return;
      }

      const response = await axios.get(API_ENDPOINTS.getRoles, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.result) {
        const rolesData = response.data.result.map(
          (role: { name: string; roleName: string }) => ({
            label: formatRole(role.name),
            value: role.name,
          })
        );
        setRoles([{ label: "All", value: "" }, ...rolesData]);
      }
    } catch (error) {
      console.error("Error fetching roles: ", error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Get Decode Token for permissions
  const getDecodedToken = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token: ", error);
      return null;
    }
  };

  // Handle Show Add Modal
  const showAddModal = () => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";

    if (!scope.includes("ADD_USER")) {
      setSnackBarMessage("You do not have permission to add users.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleCancelAddModal = () => {
    setIsAddModalOpen(false);
    addFormik.resetForm();
  };

  // Handle Show Edit Modal
  const showEditModal = (userRole: string) => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";
    const loggedInUserRole = localStorage.getItem("currentRole")?.toUpperCase();

    if (!scope.includes("EDIT_USER")) {
      setSnackBarMessage("You do not have permission to edit users.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    const targetUserRole = userRole.toUpperCase();

    if (targetUserRole === "SUPER_ADMIN") {
      setSnackBarMessage("You are not allowed to edit this user.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    if (targetUserRole === loggedInUserRole) {
      setSnackBarMessage("You are not allowed to edit this user.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    setIsEditModalOpen(true);
  };

  const handleCancelEditModal = () => {
    setIsEditModalOpen(false);
    editFormik.resetForm();
  };

  // Handle Show User Details
  const showUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailsOpen(true);
  };

  const handleCancelUserDetails = () => {
    setIsDetailsOpen(false);
  };

  //  Handle Delete Confirm
  const showDeleteConfirmModal = (userId: string, userRole: string) => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";
    const loggedInUserRole = localStorage.getItem("currentRole")?.toUpperCase();

    if (!scope.includes("EDIT_USER")) {
      setSnackBarMessage("You do not have permission to delete users.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    const targetUserRole = userRole.toUpperCase();

    if (targetUserRole === "SUPER_ADMIN") {
      setSnackBarMessage("You are not allowed to delete this user.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    if (targetUserRole === loggedInUserRole) {
      setSnackBarMessage("You are not allowed to delete this user.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }
    setUserIdToDelete(userId);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userIdToDelete) {
      await deleteUser(userIdToDelete);
      fetchAllUsers();
    }
    setIsDeleteConfirmModalOpen(false);
    setUserIdToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmModalOpen(false);
    setUserIdToDelete(null);
  };

  // Handle Snackbar
  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason: string
  ) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const handleAlertClose = () => {
    setSnackBarOpen(false);
  };

  const resetImage = () => {
    // Do nothing if image state is inside modal
  };

  // Format Role
  const formatRole = (role: string) => {
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  // Format Date
  function formatDateForApi(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
      return format(parsed, "yyyy-MM-dd"); // format to what backend expects
    } catch {
      return null;
    }
  }

  // Add Formik
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
        .matches(/^[a-zA-Z]+$/, "Last name must only contain letters")
        .min(3, "Minimum 3 letters")
        .max(30, "Maximum 30 letters")
        .required("Last Name is required"),

      dateOfBirth: Yup.string()
        .required("Date of birth is required")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19\d{2}|20\d{2})$/,
          "Date of birth must be in format dd/mm/yyyy and from 1900"
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

        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const response = await axios.post(
          API_ENDPOINTS.createUser,
          formattedValues,
          {
            headers: {
              "Content-Type": "application/json",
              // Include auth token if your API requires it
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
          }
        );
        console.log("User created successfully: ", response.data);

        setSnackBarMessage("Create user successfully"); // Set the success message
        setSnackBarSeverity("success");
        setSnackBarOpen(true);

        resetForm();
        handleCancelAddModal();
        fetchAllUsers();
      } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof AxiosError && error.response) {
          // If the error has a response object, extract the message
          const errorMessage =
            error.response?.data.message || "An unknown error occurred.";
          setSnackBarMessage(errorMessage); // Set the error message
          setSnackBarSeverity("error");
          setSnackBarOpen(true); // Open the Snackbar
        } else {
          setSnackBarMessage("Network error. Please try again later.");
          setSnackBarSeverity("error");
          setSnackBarOpen(true);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Edit Formik
  const editFormik = useFormik<FormEditValues>({
    initialValues: {
      firstName: "",
      userName: "",
      role: "",
      engineeringTeams: [],
      lastName: "",
      dateOfBirth: "",
      company: [],
      status: "",
      image: "",
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

      engineeringTeams: Yup.array()
        .of(Yup.string().required())
        .min(1, "At least one team must be selected")
        .required("Team is required"),

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

      company: Yup.array()
        .of(Yup.string().required())
        .min(1, "At least one company must be selected")
        .required("Company is required"),

      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (
      values: FormEditValues,
      formikHelpers: FormikHelpers<FormEditValues>
    ) => {
      const { setSubmitting, resetForm } = formikHelpers;

      try {
        const payload = {
          firstname: values.firstName,
          lastname: values.lastName,
          username: values.userName,
          roleId: parseInt(values.role),
          teamIds: values.engineeringTeams,
          companyIds: values.company,
          dateOfBirth: formatDateForApi(values.dateOfBirth),
          status: values.status.toUpperCase(),
          image: values.image || null,
        };

        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const response = await axios.put(
          `${API_ENDPOINTS.updateUser}/${savedUserId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              // Include auth token if your API requires it
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
          }
        );
        console.log("User updated successfully: ", response.data);

        setSnackBarMessage("Update user successfully"); // Set the success message
        setSnackBarSeverity("success");
        setSnackBarOpen(true);
        handleCancelEditModal();
        resetForm();
        fetchAllUsers();
      } catch (error) {
        console.error("Error updating user:", error);
        if (error instanceof AxiosError && error.response) {
          // If the error has a response object, extract the message
          const errorMessage =
            error.response?.data.message || "An unknown error occurred.";
          setSnackBarMessage(errorMessage); // Set the error message
          setSnackBarSeverity("error");
          setSnackBarOpen(true); // Open the Snackbar
        } else {
          setSnackBarMessage("Network error. Please try again later.");
          setSnackBarSeverity("error");
          setSnackBarOpen(true);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Delete User
  const deleteUser = async (userId: string) => {
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      await axios.delete(`${API_ENDPOINTS.deleteUser}/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSnackBarSeverity("success");
      setSnackBarMessage("User deleted successfully");
      setSnackBarOpen(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          error.response?.data.message || "An unknown error occurred.";
        setSnackBarSeverity("error");
        setSnackBarMessage(errorMessage);
        setSnackBarOpen(true);
      } else {
        setSnackBarMessage("Network error. Please try again later.");
        setSnackBarOpen(true);
      }
    }
  };

  // Function to filter and search users
  const filterAndSearchUsers = useCallback(() => {
    let filteredUsers = allUsers;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter((user) =>
        user.username.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (roleQuery !== "") {
      filteredUsers = filteredUsers.filter((user) => user.role === roleQuery);
    }

    if (statusQuery !== "") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === statusQuery
      );
    }
    return filteredUsers;
  }, [allUsers, searchQuery, roleQuery, statusQuery]);

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

  // Sort Event: Update the sortUser function to sort the allUsers array
  const sortUser = useCallback(
    (usersList: User[]) => {
      if (sortOrderFirstName !== "none") {
        return [...usersList].sort((a, b) => {
          if (sortOrderFirstName === "asc")
            return a.firstName.localeCompare(b.firstName);
          if (sortOrderFirstName === "desc")
            return b.firstName.localeCompare(a.firstName);
          return 0;
        });
      } else if (sortOrderLastName !== "none") {
        return [...usersList].sort((a, b) => {
          if (sortOrderLastName === "asc")
            return a.lastName.localeCompare(b.lastName);
          if (sortOrderLastName === "desc")
            return b.lastName.localeCompare(a.lastName);
          return 0;
        });
      } else if (sortOrderCompany !== "none") {
        return [...usersList].sort((a, b) => {
          const companyA = a.company[0] || "";
          const companyB = b.company[0] || "";
          if (sortOrderCompany === "asc")
            return companyA.localeCompare(companyB);
          if (sortOrderCompany === "desc")
            return companyB.localeCompare(companyA);
          return 0;
        });
      } else if (sortOrderEngineeringTeam !== "none") {
        return [...usersList].sort((a, b) => {
          const teamA = a.engineeringTeam[0] || "";
          const teamB = b.engineeringTeam[0] || "";
          if (sortOrderEngineeringTeam === "asc")
            return teamA.localeCompare(teamB);
          if (sortOrderEngineeringTeam === "desc")
            return teamB.localeCompare(teamA);
          return 0;
        });
      } else if (sortOrderDateOfBirth !== "none") {
        return [...usersList].sort((a, b) => {
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
        return [...usersList].sort((a, b) => {
          if (sortOrderRole === "asc") return a.role.localeCompare(b.role);
          if (sortOrderRole === "desc") return b.role.localeCompare(a.role);
          return 0;
        });
      }
      return usersList;
    },
    [
      sortOrderFirstName,
      sortOrderLastName,
      sortOrderCompany,
      sortOrderEngineeringTeam,
      sortOrderDateOfBirth,
      sortOrderRole,
    ]
  );

  useEffect(() => {
    const filteredAndSearched = filterAndSearchUsers(); // First filter and search
    const sortedUsers = sortUser(filteredAndSearched); // Then sort
    const startIndex = currentPage * pageSize; // then paginate
    const endIndex = startIndex + pageSize;
    setUsers(sortedUsers.slice(startIndex, endIndex));
    setTotalItems(sortedUsers.length); // Update total items for pagination
  }, [
    filterAndSearchUsers,
    sortUser,
    currentPage,
    pageSize,
    roleQuery,
    statusQuery,
    searchQuery,
    sortOrderFirstName,
    sortOrderLastName,
    sortOrderCompany,
    sortOrderEngineeringTeam,
    sortOrderDateOfBirth,
    sortOrderRole,
  ]);

  // Sort Handlers
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

  const optionStatus = [
    { label: "All", value: "" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

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
          severity={snackBarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <div className={`transition-all duration-300 ease-in-out pl-[0px]`}>
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

        <div className="w-full px-6 mb-3 flex flex-row gap-2 items-center justify-center">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              placeholder="Search by username"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-2 items-center w-1/3">
            <FilterSelect
              label="Role"
              name="roleFilter"
              value={roleQuery}
              options={roles || []}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setRoleQuery(selectedValue);
                setCurrentPage(0);
              }}
            />
            <FilterSelect
              label="Status"
              name="statusFilter"
              value={statusQuery}
              options={optionStatus}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setStatusQuery(selectedValue);
                setCurrentPage(0);

                console.log("Selected Status:", selectedValue);
              }}
            />
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
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
                          {user.engineeringTeam &&
                          user.engineeringTeam.length > 0
                            ? user.engineeringTeam.join(", ")
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {user.dateOfBirth
                            ? format(new Date(user.dateOfBirth), "dd/MM/yyyy")
                            : "-"}
                        </td>
                        <td className="px-4 py-2">{formatRole(user.role)}</td>
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
                        <td className="flex flex-row items-center justify-center py-2">
                          <Button
                            type="link"
                            icon={<FiEdit3 />}
                            style={{ width: 32, height: 32, color: "#F97316" }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents row click
                              setSavedUserId(user.userId);
                              showEditModal(user.role);
                            }}
                          />
                          <Button
                            type="link"
                            icon={<RiDeleteBinLine />}
                            style={{ width: 32, height: 32, color: "black" }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents row click
                              showDeleteConfirmModal(user.userId, user.role);
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
              />
            </div>
          )}
        </div>

        <DeleteConfirmModal
          isOpen={isDeleteConfirmModalOpen}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />

        <AddUserFormModal
          isOpen={isAddModalOpen}
          onCancel={handleCancelAddModal}
          formik={addFormik}
          onResetImage={resetImage}
        />
        <EditUserFormModal
          isOpen={isEditModalOpen}
          onCancel={handleCancelEditModal}
          formik={editFormik}
          onResetImage={resetImage}
          userId={savedUserId}
        />

        <UserDetails
          isOpen={isDetailsOpen}
          onCancel={handleCancelUserDetails}
          userId={selectedUserId}
          onUserUpdated={handleUserUpdated}
        />
      </div>
    </>
  );
};

export default UsersPage;
