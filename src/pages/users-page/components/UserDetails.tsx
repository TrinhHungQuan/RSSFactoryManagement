import { IoClose } from "react-icons/io5";
import { format, parse } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS, BASE_URL } from "../../../services/api";
import { FaUserCircle } from "react-icons/fa";
import { User } from "../hooks/useUsers";
import { Button } from "antd";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";
import { FormEditValues, FormPassword } from "../hooks/useFormValues";
import { Alert, Snackbar } from "@mui/material";
import ChangePasswordForm from "./ChangePasswordForm";
import EditUserFormModal from "./EditFormModal";

interface DetailsUserProps {
  isOpen: boolean;
  onCancel: () => void;
  userId: string | null;
  onUserUpdated: () => void;
}

const UserDetails = ({
  isOpen,
  onCancel,
  userId,
  onUserUpdated,
}: DetailsUserProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const showChangePassword = (userRole: string) => {
    const decodedToken = getDecodedToken();
    const scope: string = decodedToken?.scope || "";
    const loggedInUserRole = localStorage.getItem("currentRole")?.toUpperCase();

    if (!scope.includes("CHANGE_PASSWORD")) {
      setSnackBarMessage("You do not have permission to change password.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    const targetUserRole = userRole.toUpperCase();

    if (targetUserRole === "SUPER_ADMIN") {
      setSnackBarMessage(
        "You are not allowed to change password of this user."
      );
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    if (targetUserRole === loggedInUserRole) {
      setSnackBarMessage(
        "You are not allowed to change password of this user."
      );
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }
    setIsChangePasswordOpen(true);
  };

  const handleCancelChangePassword = () => {
    setIsChangePasswordOpen(false);
    changePasswordFormik.resetForm();
  };

  const resetImage = () => {
    // Do nothing if image state is inside modal
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

  // Change Password Formik
  const changePasswordFormik = useFormik<FormPassword>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Password must contain at least 1 lowercase")
        .matches(/[A-Z]/, "Password must contain at leat 1 uppercase")
        .matches(/[0-9]/, "Password must contain at least 1 number")
        .matches(/[\W_]/, "Password must contain at least 1 special character")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: async (
      values: FormPassword,
      formikHelpers: FormikHelpers<FormPassword>
    ) => {
      const { setSubmitting, resetForm } = formikHelpers;

      try {
        const payload = {
          password: values.password,
          confirmPassword: values.confirmPassword,
        };

        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const response = await axios.put(
          `${API_ENDPOINTS.changePassword}/${userId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              // Include auth token if your API requires it
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
          }
        );
        console.log("Password change successfully: ", response.data);

        setSnackBarMessage("Password change successfully"); // Set the success message
        setSnackBarSeverity("success");
        setSnackBarOpen(true);
        resetForm();
        handleCancelChangePassword();
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

  function formatDateForApi(dateStr: string | null): string | null {
    if (!dateStr) return null;
    try {
      const parsed = parse(dateStr, "dd/MM/yyyy", new Date());
      return format(parsed, "yyyy-MM-dd"); // format to what backend expects
    } catch {
      return null;
    }
  }
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
          `${API_ENDPOINTS.updateUser}/${userId}`,
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
        fetchUserDetails();
        onUserUpdated();
      } catch (error) {
        console.error("Error updating user:", error);
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

  // Fetch User by ID
  const fetchUserDetails = useCallback(async () => {
    if (isOpen && userId) {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!accessToken) {
        console.error("No access token found.");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/users/get/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data && res.data.result) {
          const user = res.data.result;
          const mappedUser: User = {
            userId: user.userId,
            username: user.username,
            firstName: user.firstname,
            lastName: user.lastname,
            company: user.company?.[0]?.companyName || "",
            engineeringTeam: user.team?.[0]?.name || "",
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
            role: user.role?.name,
            status: user.status === "ACTIVE" ? "Active" : "Inactive",
            image: user.image || "",
            projectManager: user.projectManager || "",
          };
          setUser(mappedUser);
        } else {
          console.error("Invalid user data format:", res.data);
        }
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    }
  }, [isOpen, userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

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
        className={`fixed top-0 right-0 z-50 h-full w-[360px] bg-white shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full p-4 flex flex-col bg-white justify-between">
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-lg font-semibold">User Information</h1>
              <button onClick={onCancel} className="cursor-pointer">
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            {/* Image and basic information block */}
            <div className="bg-gray-50 flex flex-col justify-center items-center rounded-lg">
              <div className="w-20 h-20 rounded-full border border-gray-300 m-2 overflow-hidden">
                {user?.image ? (
                  <img
                    src={`${BASE_URL}/${user?.image}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex flex-row gap-1 mb-1 text-lg">
                <h1 className="font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
              </div>
              <div
                className={`border mb-1.5 font-semibold rounded-3xl flex items-center justify-center pt-0.5 pb-0.5 pl-1 pr-1 ${
                  user?.status === "Active"
                    ? "border-green-600 bg-green-50 text-green-600 text-xs"
                    : "border-gray-600 bg-gray-50 text-gray-600 text-xs"
                }`}
              >
                {user?.status}
              </div>
              <div className="mb-1">
                <h1>
                  {user?.role
                    ? user.role
                        .replace(/_/g, " ")
                        .split(" ")
                        .map((word, index) =>
                          index === 0
                            ? word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                            : word.toLowerCase()
                        )
                        .join(" ")
                    : ""}
                </h1>
              </div>
            </div>

            {/* Other information */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">First name:</p>
                <p className="font-semibold">{user?.firstName}</p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Last name:</p>
                <p className="font-semibold">{user?.lastName}</p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Username:</p>
                <p className="font-semibold">{user?.username}</p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Date of Birth:</p>
                <p className="font-semibold">
                  {user?.dateOfBirth
                    ? format(new Date(user.dateOfBirth), "dd/MM/yyyy")
                    : "-"}
                </p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Project Manager:</p>
                <p className="font-semibold">
                  {user?.projectManager ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-2 items-center justify-center w-full">
            <Button
              type="primary"
              style={{
                height: "40px",
                backgroundColor: "white",
                color: "#F97316",
              }}
              className="!font-semibold flex-1"
              onClick={() => {
                showChangePassword(user?.role || "");
              }}
            >
              Change Password
            </Button>
            <Button
              type="primary"
              style={{ height: "40px", backgroundColor: "#F97316" }}
              className="!font-semibold flex-1"
              onClick={() => {
                showEditModal(user?.role || "");
              }}
            >
              Edit User
            </Button>
          </div>
        </div>
      </div>
      <ChangePasswordForm
        isOpen={isChangePasswordOpen}
        onCancel={handleCancelChangePassword}
        formik={changePasswordFormik}
      />
      <EditUserFormModal
        isOpen={isEditModalOpen}
        onCancel={handleCancelEditModal}
        formik={editFormik}
        onResetImage={resetImage}
        userId={userId || ""}
      />
    </>
  );
};

export default UserDetails;
