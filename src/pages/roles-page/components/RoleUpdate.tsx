import axios, { AxiosError } from "axios";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS, BASE_URL } from "../../../services/api";
import { useEffect, useState } from "react";
import { Button, Checkbox } from "antd";
import { Alert, Snackbar } from "@mui/material";

interface ApiPermission {
  permissionId: number;
  name: string;
}

interface Permission {
  permissionId: number;
  name: string;
}

const RoleUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  // Handle Snackbar
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

  // Format Role
  const formatPermission = (permission: string) => {
    return permission
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        // 1. Fetch all permissions
        const permissionsRes = await axios.get(API_ENDPOINTS.getPermissions, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedPermissions: Permission[] = permissionsRes.data.result.map(
          (perm: ApiPermission) => ({
            permissionId: perm.permissionId,
            name: perm.name,
          })
        );

        setAllPermissions(fetchedPermissions);

        // 2. Fetch role details only if editing
        if (id) {
          const roleRes = await axios.get(
            `${API_ENDPOINTS.getRoleDetails}/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const role = roleRes.data.result;
          setRoleName(role.name);

          const selectedPermIds = role.permissions.map(
            (perm: ApiPermission) => perm.permissionId
          );

          setSelectedPermissions(selectedPermIds);
        }
      } catch (err) {
        console.error("Error initializing role update page:", err);
      }
    };

    initialize();
  }, [id]);

  const handleCheckboxChange = (id: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      await axios.put(
        `${BASE_URL}/roles/${id}/assign-permissions`,
        { permissionIds: selectedPermissions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSnackBarSeverity("success");
      setSnackBarMessage("Role updated successfully");
      navigate(-1);
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
      <div className="mx-6 mt-6">
        {/* Header */}
        <div className="flex justify-start items-center gap-3 mb-4">
          <button
            className="w-8 h-8 border rounded border-gray-300 flex justify-center items-center cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <IoMdArrowRoundBack />
          </button>
          <h1 className="text-xl font-semibold">Update Role Admin</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white">
          <div className="mb-4">
            <label className="font-semibold">Name: </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <div className="">
              <div className="grid grid-cols-2 gap-5">
                {allPermissions.map((perm) => (
                  <Checkbox
                    key={perm.permissionId}
                    checked={selectedPermissions.includes(perm.permissionId)}
                    onChange={() => handleCheckboxChange(perm.permissionId)}
                  >
                    {formatPermission(perm.name)}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-3 mt-4">
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
              Save
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RoleUpdate;
