import { Input, Button, Checkbox } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../../services/api";

const LoginForm = () => {
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason: string
  ) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  // For Alert
  const handleAlertClose = () => {
    setSnackBarOpen(false);
  };

  // Formik and Login logic with backend
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
        };
        const response = await axios.post(API_ENDPOINTS.login, payload);

        if (response.data.result.authenticated) {
          const token = response.data.result.token;
          const expiryDate = response.data.result.expiryAt;

          if (rememberMe) {
            localStorage.setItem("token", token);
            localStorage.setItem("expiryDate", expiryDate.toString());
          } else {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("expiryDate", expiryDate.toString());
          }

          navigate("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error instanceof AxiosError && error.response) {
          const errorMessage =
            error.response?.data.message || "An unknown error occurred.";
          setSnackBarMessage(errorMessage);
          setSnackBarOpen(true);
        } else {
          setSnackBarMessage("Network error. Please try again later.");
          setSnackBarOpen(true);
        }
      }
    },
  });
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
      <form onSubmit={formik.handleSubmit} className="flex flex-col">
        <Input
          name="username"
          placeholder="Username"
          className="h-[40px] pb-5"
          style={{
            width: "425px",
          }}
          value={formik.values.username}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        />
        {formik.touched.username && formik.errors.username ? (
          <p className="text-red-500 text-xs">{formik.errors.username}</p>
        ) : null}

        <Input
          name="password"
          placeholder="Password"
          className="h-[40px]"
          type="password"
          style={{ width: "425px", marginTop: "15px" }}
          value={formik.values.password}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="text-red-500 text-xs">{formik.errors.password}</p>
        ) : null}

        <Checkbox
          style={{ marginTop: "12px" }}
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        >
          Remember me
        </Checkbox>

        <Button
          type="primary"
          style={{
            height: "40px",
            width: "425px",
            backgroundColor: "#F97316",
            marginTop: "12px",
          }}
          className="!font-semibold"
          htmlType="submit"
        >
          Login
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
