import { Button, Pagination, Spin } from "antd";
import { useOutletContext } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import { RxCaretSort } from "react-icons/rx";
import { RxCaretDown } from "react-icons/rx";
import { RxCaretUp } from "react-icons/rx";
import SearchInput from "../../components/SearchInput";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../services/api";
import { Company } from "./hooks/useCompanies";
import FilterSelect from "../../components/FilterSelect";
import { Alert, Snackbar } from "@mui/material";
import {
  FormAddCompanyValues,
  FormEditCompanyValues,
} from "./hooks/useFormValues";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import AddCompanyFormModal from "./components/AddCompanyFormModal";
import DeleteCompanyConfirmModal from "./components/DeleteCompanyConfirm";
import EditCompanyFormModal from "./components/EditCompanyFormModal";

type LayoutContextType = {
  isSiderCollapsed: boolean;
};

interface ApiCompany {
  companyId: string;
  code: string;
  companyName: string;
  subcontractor: boolean;
  state: string;
  status: string;
  contactName: string;
  mobilePhone: string;
  address: string;
}

const CompanyPage = () => {
  const { isSiderCollapsed } = useOutletContext<LayoutContextType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [stateQuery, setStateQuery] = useState<string>("");
  const [states, setStates] = useState<{ label: string; value: string }[]>([]);
  const [statusQuery, setStatusQuery] = useState("");
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isDeleteCompanyConfirmModalOpen, setIsDeleteCompanyConfirmModalOpen] =
    useState(false);
  const [companyIdToDelete, setCompanyIdToDelete] = useState<string | null>(
    null
  );
  const [savedCompanyId, setSavedCompanyId] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  //Handle Snackbar
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

  // Fetch all users on first load
  const fetchAllCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await axios.get(API_ENDPOINTS.getCompaniesTable, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: 0,
          size: 10000,
        },
      });

      if (response.data && response.data.result) {
        const stateData = response.data.result.content.map(
          (company: { state: string }) => ({
            label: company.state,
            value: company.state,
          })
        );

        // Remove duplicates using a Map
        const uniqueStates = Array.from(
          new Map(
            stateData.map((item: { label: string; value: string }) => [
              item.value,
              item,
            ])
          ).values()
        ) as { label: string; value: string }[];
        setStates([{ label: "All", value: "" }, ...uniqueStates]);
      }

      const fetchedCompanies: Company[] = response.data.result.content.map(
        (company: ApiCompany) => ({
          companyId: company.companyId,
          code: company.code,
          companyName: company.companyName,
          subcontractor: company.subcontractor,
          state: company.state,
          status: company.status === "ACTIVE" ? "Active" : "Inactive",
          contactName: company.contactName,
          mobilePhone: company.mobilePhone,
          address: company.address,
        })
      );

      setAllCompanies(fetchedCompanies);
      setTotalItems(fetchedCompanies.length);
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
    fetchAllCompanies();
  }, []);

  // Update users when page or pageSize changes
  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    setCompanies(allCompanies.slice(startIndex, endIndex));
  }, [currentPage, pageSize, allCompanies]);

  // Page Handle
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Function to filter and search company
  const filterAndSearchCompanies = useCallback(() => {
    let filteredCompanies = allCompanies;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.code.toLowerCase().includes(lowerCaseQuery) ||
          company.companyName.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (stateQuery !== "") {
      filteredCompanies = filteredCompanies.filter(
        (company) => company.state === stateQuery
      );
    }

    if (statusQuery !== "") {
      filteredCompanies = filteredCompanies.filter(
        (company) => company.status === statusQuery
      );
    }
    return filteredCompanies;
  }, [allCompanies, searchQuery, stateQuery, statusQuery]);

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

  // Handle Show and Cancel Add Company Modal
  const showAddCompanyModal = () => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";

    if (!scope.includes("ADD_COMPANY")) {
      setSnackBarMessage("You do not have permission to add company.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }
    setIsAddCompanyOpen(true);
  };

  const handleCancelAddCompanyModal = () => {
    setIsAddCompanyOpen(false);
    addCompanyFormik.resetForm();
  };
  // Add Company Formik
  const addCompanyFormik = useFormik<FormAddCompanyValues>({
    initialValues: {
      code: "",
      companyName: "",
      subcontractor: false,
      state: "",
      status: "",
      contactName: "",
      mobilePhone: "",
      address: "",
    },

    validationSchema: Yup.object({
      code: Yup.string()
        .min(2, "Code must be at least 2 characters")
        .max(4, "Code maximum is 4 character")
        .required("Code is required"),
      companyName: Yup.string().required("Company name is required"),
      subcontractor: Yup.boolean()
        .nullable()
        .required("Subcontractor is required"),
      status: Yup.string().required("Status is required"),
      state: Yup.string().required("state is required"),
      contactName: Yup.string().required("Contact name is required"),
      mobilePhone: Yup.string().required("Mobile Phone is required"),
      address: Yup.string().required("Address is required"),
    }),
    onSubmit: async (
      values: FormAddCompanyValues,
      formikHelpers: FormikHelpers<FormAddCompanyValues>
    ) => {
      const { setSubmitting, resetForm } = formikHelpers;

      try {
        const payload = {
          code: values.code,
          companyName: values.companyName,
          subcontractor: values.subcontractor,
          state: values.state,
          status: values.status,
          contactName: values.contactName,
          mobilePhone: values.mobilePhone,
          address: values.address,
        };

        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const response = await axios.post(
          API_ENDPOINTS.createCompany,
          payload,
          {
            headers: {
              "Content-Type": "application/json",

              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
          }
        );
        console.log("Company add successfully: ", response.data);

        setSnackBarMessage("Company add successfully");
        setSnackBarSeverity("success");
        setSnackBarOpen(true);
        resetForm();
        fetchAllCompanies();
        handleCancelAddCompanyModal();
      } catch (error) {
        console.error("Error creating company:", error);
        if (error instanceof AxiosError && error.response) {
          const errorMessage =
            error.response?.data.message || "An unknown error occurred.";
          setSnackBarMessage(errorMessage);
          setSnackBarSeverity("error");
          setSnackBarOpen(true);
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

  // Handle Show Edit Company Modal
  const showEditModal = () => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";

    if (!scope.includes("EDIT_COMPANY")) {
      setSnackBarMessage("You do not have permission to edit companies.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleCancelEditModal = () => {
    setIsEditModalOpen(false);
    editCompanyFormik.resetForm();
  };

  // Edit Company Formik
  const editCompanyFormik = useFormik<FormEditCompanyValues>({
    initialValues: {
      code: "",
      companyName: "",
      subcontractor: false,
      state: "",
      status: "",
      contactName: "",
      mobilePhone: "",
      address: "",
    },

    validationSchema: Yup.object({
      code: Yup.string()
        .min(2, "Code must be at least 2 characters")
        .max(4, "Code maximum is 4 character")
        .required("Code is required"),
      companyName: Yup.string().required("Company name is required"),
      subcontractor: Yup.boolean()
        .nullable()
        .required("Subcontractor is required"),
      status: Yup.string().required("Status is required"),
      state: Yup.string().required("state is required"),
      contactName: Yup.string().required("Contact name is required"),
      mobilePhone: Yup.string().required("Mobile Phone is required"),
      address: Yup.string().required("Address is required"),
    }),
    onSubmit: async (
      values: FormAddCompanyValues,
      formikHelpers: FormikHelpers<FormAddCompanyValues>
    ) => {
      const { setSubmitting, resetForm } = formikHelpers;

      try {
        const payload = {
          code: values.code,
          companyName: values.companyName,
          subcontractor: values.subcontractor,
          state: values.state,
          status: values.status,
          contactName: values.contactName,
          mobilePhone: values.mobilePhone,
          address: values.address,
        };

        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const response = await axios.put(
          `${API_ENDPOINTS.updateCompany}/${savedCompanyId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
          }
        );
        console.log("Company update successfully: ", response.data);

        setSnackBarMessage("Company updated successfully");
        setSnackBarSeverity("success");
        setSnackBarOpen(true);
        resetForm();
        fetchAllCompanies();
        handleCancelEditModal();
      } catch (error) {
        console.error("Error updating company:", error);
        if (error instanceof AxiosError && error.response) {
          const errorMessage =
            error.response?.data.message || "An unknown error occurred.";
          setSnackBarMessage(errorMessage);
          setSnackBarSeverity("error");
          setSnackBarOpen(true);
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

  //  Handle Delete Confirm
  const showDeleteConfirmModal = (companyId: string) => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";

    if (!scope.includes("DELETE_COMPANY")) {
      setSnackBarMessage("You do not have permission to delete companies.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }
    setCompanyIdToDelete(companyId);
    setIsDeleteCompanyConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (companyIdToDelete) {
      await deleteCompany(companyIdToDelete);
      fetchAllCompanies();
    }
    setIsDeleteCompanyConfirmModalOpen(false);
    setCompanyIdToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteCompanyConfirmModalOpen(false);
    setCompanyIdToDelete(null);
  };

  // Delete User
  const deleteCompany = async (companyId: string) => {
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      await axios.delete(`${API_ENDPOINTS.deleteCompany}/${companyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setSnackBarSeverity("success");
      setSnackBarMessage("Company deleted successfully");
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

  const [sortOrderCode, setSortOrderCode] = useState<"asc" | "desc" | "none">(
    "none"
  );
  const [sortOrderCompanyName, setSortOrderCompanyName] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderState, setSortOrderState] = useState<"asc" | "desc" | "none">(
    "none"
  );
  const [sortOrderContactName, setSortOrderContactName] = useState<
    "asc" | "desc" | "none"
  >("none");

  const sortCompany = useCallback(
    (sortCompaniesList: Company[]) => {
      if (sortOrderCode !== "none") {
        return [...sortCompaniesList].sort((a, b) => {
          if (sortOrderCode === "asc") return a.code.localeCompare(b.code);
          if (sortOrderCode === "desc") return b.code.localeCompare(a.code);
          return 0;
        });
      } else if (sortOrderCompanyName !== "none") {
        return [...sortCompaniesList].sort((a, b) => {
          if (sortOrderCompanyName === "asc")
            return a.companyName.localeCompare(b.companyName);
          if (sortOrderCompanyName === "desc")
            return b.companyName.localeCompare(a.companyName);
          return 0;
        });
      } else if (sortOrderState !== "none") {
        return [...sortCompaniesList].sort((a, b) => {
          if (sortOrderState === "asc") return a.state.localeCompare(b.state);
          if (sortOrderState === "desc") return b.state.localeCompare(a.state);
          return 0;
        });
      } else if (sortOrderContactName !== "none") {
        return [...sortCompaniesList].sort((a, b) => {
          if (sortOrderContactName === "asc")
            return a.contactName.localeCompare(b.contactName);
          if (sortOrderContactName === "desc")
            return b.contactName.localeCompare(a.contactName);
          return 0;
        });
      }
      return sortCompaniesList;
    },
    [sortOrderCode, sortOrderCompanyName, sortOrderState, sortOrderContactName]
  );

  useEffect(() => {
    const filteredAndSearched = filterAndSearchCompanies(); // First filter and search
    const sortedCompanies = sortCompany(filteredAndSearched); // Then sort
    const startIndex = currentPage * pageSize; // then paginate
    const endIndex = startIndex + pageSize;
    setCompanies(sortedCompanies.slice(startIndex, endIndex));
    setTotalItems(sortedCompanies.length); // Update total items for pagination
  }, [
    filterAndSearchCompanies,
    sortCompany,
    currentPage,
    pageSize,
    stateQuery,
    statusQuery,
    searchQuery,
    sortOrderCode,
    sortOrderCompanyName,
    sortOrderState,
    sortOrderContactName,
  ]);

  // Sort Handlers
  const handleSortCodeClick = () => {
    setSortOrderCode((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCompanyName("none");
    setSortOrderState("none");
    setSortOrderContactName("none");
  };

  const handleSortCompanyNameClick = () => {
    setSortOrderCompanyName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCode("none");
    setSortOrderState("none");
    setSortOrderContactName("none");
  };

  const handleSortStateClick = () => {
    setSortOrderState((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCode("none");
    setSortOrderCompanyName("none");
    setSortOrderContactName("none");
  };

  const handleSortContactNameClick = () => {
    setSortOrderContactName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCode("none");
    setSortOrderCompanyName("none");
    setSortOrderState("none");
  };

  const sortedCompanies = sortCompany(companies);

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
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSiderCollapsed ? "lg:pl-[0px] pl-[60px]" : "lg:pl-[0px] pl-[0px]"
        }`}
      >
        <div className="flex justify-between items-center mt-[22px] mb-4 px-6 w-full">
          <h1 className="text-xl font-semibold">Company Management</h1>
          <Button
            type="primary"
            style={{ height: "40px", backgroundColor: "#F97316" }}
            className="!font-semibold"
            onClick={showAddCompanyModal}
          >
            + Add New Company
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
              placeholder="Search by code, company name"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-2 items-center w-1/3">
            <FilterSelect
              label="State"
              name="stateFilter"
              value={stateQuery}
              options={states || []}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setStateQuery(selectedValue);
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
        <div className="overflow-x-auto px-6">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortCodeClick}
                  >
                    <span className="flex items-center justify-between">
                      Code
                      {sortOrderCode === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderCode === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderCode === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortCompanyNameClick}
                  >
                    <span className="flex items-center justify-between">
                      Company Name
                      {sortOrderCompanyName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderCompanyName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderCompanyName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-center">
                      Subcontractor
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span
                      className="flex items-center justify-between"
                      onClick={handleSortStateClick}
                    >
                      State
                      {sortOrderState === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderState === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderState === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Status
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortContactNameClick}
                  >
                    <span className="flex items-center justify-between">
                      Contact Name
                      {sortOrderContactName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderContactName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderContactName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Mobile Phone
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Address
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
                {sortedCompanies.length > 0 ? (
                  sortedCompanies.map((company, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-300 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{company.code}</td>
                      <td className="px-4 py-2 ">{company.companyName}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center">
                          {company.subcontractor === true ? (
                            <FaRegCheckCircle className="text-green-600 w-5 h-5" />
                          ) : (
                            <FaRegCircle className="text-gray-400 w-5 h-5" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 ">{company.state}</td>
                      <td className="px-4 py-2">
                        <div
                          className={`border font-semibold rounded-3xl flex items-center justify-center pt-0.5 pb-0.5 pl-1 pr-1 ${
                            company.status === "Active"
                              ? "border-green-600 bg-green-50 text-green-600 text-xs"
                              : "border-gray-600 bg-gray-50 text-gray-600 text-xs"
                          }`}
                        >
                          {company.status}
                        </div>
                      </td>
                      <td className="px-4 py-2 ">{company.contactName}</td>
                      <td className="px-4 py-2 ">{company.mobilePhone}</td>
                      <td className="px-4 py-2 ">{company.address}</td>
                      <td className="flex flex-row items-center justify-center">
                        <Button
                          type="link"
                          icon={<FiEdit3 />}
                          style={{ width: 32, height: 32, color: "#F97316" }}
                          onClick={() => {
                            setSavedCompanyId(company.companyId);
                            showEditModal();
                          }}
                        />

                        <Button
                          type="link"
                          icon={<RiDeleteBinLine />}
                          style={{ width: 32, height: 32, color: "black" }}
                          onClick={() =>
                            showDeleteConfirmModal(company.companyId)
                          }
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
                        "No companies found"
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
        <AddCompanyFormModal
          isOpen={isAddCompanyOpen}
          onCancel={handleCancelAddCompanyModal}
          formik={addCompanyFormik}
        />

        <EditCompanyFormModal
          isOpen={isEditModalOpen}
          onCancel={handleCancelEditModal}
          formik={editCompanyFormik}
          companyId={savedCompanyId}
        />

        <DeleteCompanyConfirmModal
          isOpen={isDeleteCompanyConfirmModalOpen}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </>
  );
};

export default CompanyPage;
