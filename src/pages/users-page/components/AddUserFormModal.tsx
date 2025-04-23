import { Button, Select } from "antd";
import { FormikProps } from "formik";
import { IoClose } from "react-icons/io5";
import FloatingInput from "../../../components/FloatingInput";
import FloatingSelect from "../../../components/FloatingSelect";
import FloatingDatePicker from "../../../components/FloatingDatePicker";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS, BASE_URL } from "../../../services/api";
import { FiCamera } from "react-icons/fi";
import { FormAddValues } from "../hooks/useFormValues";

interface AddUserFormModalProps {
  isOpen: boolean;
  onCancel: () => void;
  formik: FormikProps<FormAddValues>;
  onResetImage: () => void;
}

const AddUserFormModal = ({
  isOpen,
  onCancel,
  formik,
  onResetImage,
}: AddUserFormModalProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [companies, setCompanies] = useState<
    { label: string; value: string }[]
  >([]);
  const [engineeringTeams, setEngineeringTeams] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (!isOpen) {
      setImageUrl(null); // 👈 clear image preview
      onResetImage(); // 👈 notify parent if needed
    }
  }, [isOpen, onResetImage]);

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
          (role: { name: string; roleId: string }) => ({
            label: formatRoleName(role.name),
            value: role.roleId,
          })
        );
        setRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching roles: ", error);
    }
  }, []);

  const getCurrentUserRole = () => {
    const userRole = localStorage.getItem("currentRole");
    setCurrentUserRole(userRole);
  };

  useEffect(() => {
    fetchRoles();
    getCurrentUserRole();
  }, [fetchRoles]);

  // Convert "SUPER_ADMIN" to "Super Admin"
  const formatRoleName = (roleName: string) => {
    return roleName
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch Companies
  const fetchCompanies = useCallback(async () => {
    try {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!accessToken) {
        console.error("Authentication required. Login!");
        return;
      }

      const response = await axios.get(API_ENDPOINTS.getCompanies, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.result) {
        const companiesData = response.data.result.map(
          (company: { companyName: string; companyId: string }) => ({
            label: company.companyName || "Unnamed",
            value: company.companyId,
          })
        );
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error("Error fetching companies: ", error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Fetch Engineering Teams
  const fetchEngineeringTeams = useCallback(async () => {
    try {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!accessToken) {
        console.error("Authentication required. Login!");
        return;
      }

      const response = await axios.get(API_ENDPOINTS.getEngineeringTeams, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.result) {
        const engineeringTeamsData = response.data.result.map(
          (engineeringTeam: { name: string; teamId: string }) => ({
            label: engineeringTeam.name || "Unnamed",
            value: engineeringTeam.teamId,
          })
        );
        setEngineeringTeams(engineeringTeamsData);
      }
    } catch (error) {
      console.error("Error fetching companies: ", error);
    }
  }, []);

  useEffect(() => {
    fetchEngineeringTeams();
  }, [fetchEngineeringTeams]);

  // Image Uploading
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const accessToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(API_ENDPOINTS.uploadImage, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`, // Added Bearer prefix for token
        },
      });

      if (response.data && response.data.result) {
        setImageUrl(response.data.result);
        formik.setFieldValue("image", response.data.result);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload failed", error);
      // Clear the file input
      event.target.value = "";
    }
  };

  // Filter roles based on current user's role
  const getFilteredRoles = () => {
    if (!roles.length) return [];

    switch (currentUserRole?.toUpperCase()) {
      case "SUPER_ADMIN":
        return roles.filter(
          (role) => role.label.toUpperCase() !== "SUPER ADMIN"
        );
      case "ADMIN":
        return roles.filter(
          (role) => !["SUPER ADMIN", "ADMIN"].includes(role.label.toUpperCase())
        );
    }
  };

  const filteredRoles = getFilteredRoles();

  const optionStatus = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-black opacity-50 absolute inset-0"
          onClick={onCancel}
        ></div>

        <div className="relative bg-white rounded-lg shadow-lg w-3/5 min-w-100 mx-4 max-h-[90vh] overflow-y-auto scrollbar-none">
          <div className="flex flex-row justify-between items-center p-4">
            <h1 className="text-lg font-semibold">Add User</h1>
            <button onClick={onCancel} className="cursor-pointer">
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Divider line below header */}
          <div className="w-full h-px bg-gray-300 mt-0" />

          {/* Image Upload Area */}
          <div className="flex items-center justify-center mt-4">
            <div className="flex flex-col items-center gap-2 relative">
              {imageUrl ? (
                <img
                  src={`${BASE_URL}/${imageUrl}`}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-full border border-gray-300"
                />
              ) : (
                <div className="w-32 h-32 border rounded-full border-gray-300 flex justify-center items-center text-gray-400">
                  No Image
                </div>
              )}
              <label className="cursor-pointer text-sm text-orange-500 rounded-full bg-white hover:underline absolute bottom-0 right-0">
                <div className="rounded-full shadow-lg border border-gray-300 p-2">
                  <FiCamera className="h-6 w-6" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Adding Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-full p-4"
          >
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col w-full">
                <FloatingInput
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                />
                <div className="h-0">
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.firstName}
                    </p>
                  )}
                </div>
                <FloatingInput
                  name="userName"
                  label="Username"
                  value={formik.values.userName}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                />
                <div className="h-0">
                  {formik.touched.userName && formik.errors.userName && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.userName}
                    </p>
                  )}
                </div>

                <FloatingSelect
                  name="role"
                  label="Role"
                  value={formik.values.role}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                  options={filteredRoles || []}
                />
                <div className="h-0">
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-red-500 text-xs">{formik.errors.role}</p>
                  )}
                </div>

                <Select
                  mode="multiple"
                  style={{
                    width: "100%",
                    minHeight: "40px",
                    marginTop: "20px",
                  }}
                  placeholder="Engineering Teams"
                  value={formik.values.engineeringTeams}
                  onChange={(value) =>
                    formik.setFieldValue("engineeringTeams", value)
                  }
                  onBlur={() =>
                    formik.setFieldTouched("engineeringTeams", true)
                  }
                  options={engineeringTeams}
                  className="select-placeholder-down select-required"
                />
                <div className="h-0">
                  {formik.touched.engineeringTeams &&
                    formik.errors.engineeringTeams && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.engineeringTeams}
                      </p>
                    )}
                </div>

                <FloatingInput
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                />
                <div className="h-0">
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.password}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col w-full">
                <FloatingInput
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                />
                <div className="h-0">
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.lastName}
                    </p>
                  )}
                </div>
                <FloatingDatePicker
                  name="dateOfBirth"
                  label="Date of Birth"
                  value={formik.values.dateOfBirth}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                />
                <div className="h-0">
                  {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.dateOfBirth}
                    </p>
                  )}
                </div>
                <Select
                  mode="multiple"
                  style={{
                    width: "100%",
                    minHeight: "40px",
                    marginTop: "20px",
                  }}
                  placeholder="Company"
                  value={formik.values.company}
                  onChange={(value) => formik.setFieldValue("company", value)}
                  onBlur={() => formik.setFieldTouched("company", true)}
                  options={companies}
                  className="select-placeholder-down select-required"
                />
                <div className="h-0">
                  {formik.touched.company && formik.errors.company && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.company}
                    </p>
                  )}
                </div>
                <FloatingSelect
                  name="status"
                  label="Status"
                  value={formik.values.status}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                  options={optionStatus}
                />
                <div className="h-0">
                  {formik.touched.status && formik.errors.status && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Divider line below footer */}
            <div className="w-full h-px bg-gray-300 mt-4" />

            {/* Buttons */}
            <div className="flex flex-row justify-end gap-3 mt-4">
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
                htmlType="submit"
                style={{
                  height: "40px",
                  width: "80px",
                  backgroundColor: "#F97316",
                }}
                className="!font-semibold"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUserFormModal;
