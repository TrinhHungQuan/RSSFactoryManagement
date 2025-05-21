import { Button } from "antd";
import SettingsInput from "../../components/SettingsInput";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../services/api";
import { Alert, Snackbar } from "@mui/material";

interface Settings {
  timeout: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
  factoryJobTime: string;
  factoryDevice: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    timeout: "",
    level1: "",
    level2: "",
    level3: "",
    level4: "",
    level5: "",
    factoryJobTime: "",
    factoryDevice: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackBarOpen, setSnackBarOpen] = useState(false);

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

  // Fetching settings
  const fetchSettings = async () => {
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.getSettings, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = res.data.result;
      const currentSettingId = data.settingId;
      localStorage.setItem("currentSettingId", currentSettingId);

      setSettings({
        timeout: data.androidAppTimeout?.toString() || "",
        level1: data.difficultyLevels?.additionalProp1?.toString() || "",
        level2: data.difficultyLevels?.additionalProp2?.toString() || "",
        level3: data.difficultyLevels?.additionalProp3?.toString() || "",
        level4: data.difficultyLevels?.additionalProp4?.toString() || "",
        level5: data.difficultyLevels?.additionalProp5?.toString() || "",
        factoryJobTime: data.factoryJobsRefreshTime?.toString() || "",
        factoryDevice: data.factoryJobsDisplayDevice || "",
      });
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (name: keyof Settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setLoading(true);
    const settingId = localStorage.getItem("currentSettingId");
    try {
      await axios.put(
        `${API_ENDPOINTS.updateSettings}/${settingId}`,
        {
          androidAppTimeout: Number(settings.timeout),
          difficultyLevels: {
            additionalProp1: Number(settings.level1),
            additionalProp2: Number(settings.level2),
            additionalProp3: Number(settings.level3),
            additionalProp4: Number(settings.level4),
            additionalProp5: Number(settings.level5),
          },
          factoryJobsRefreshTime: Number(settings.factoryJobTime),
          factoryJobsDisplayDevice: settings.factoryDevice,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setSnackBarMessage("Update settings successfully");
      setSnackBarSeverity("success");
      setSnackBarOpen(true);
      fetchSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
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
      setLoading(false);
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
      <div className="top-0 ml-6 mr-6 mb-4 mt-[22px] pt-0 pl-0">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="border rounded border-gray-300 ml-6 mr-6">
        <div className="ml-6 mr-6 mt-[22px] pt-0 pl-0">
          <h1 className="font-semibold">Android App Time Out</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 mr-6 mb-4 mt-5">
          <SettingsInput
            label="Timeout (mins)"
            name="timeout"
            value={settings.timeout}
            onChange={(e) => handleChange("timeout", e.target.value)}
          />
          <SettingsInput
            label="Device"
            name="device"
            value="Android App"
            readOnly={true}
          />
        </div>
      </div>

      <div className="border rounded border-gray-300 ml-6 mr-6 mt-6">
        <div className="ml-6 mr-6 mt-[22px] pt-0 pl-0">
          <h1 className="font-semibold">Difficulty Level</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 mr-6 mb-4 mt-5">
          <SettingsInput
            label="Level 1"
            name="level1"
            value={settings.level1}
            onChange={(e) => handleChange("level1", e.target.value)}
          />
          <SettingsInput
            label="Level 2"
            name="level2"
            value={settings.level2}
            onChange={(e) => handleChange("level2", e.target.value)}
          />
          <SettingsInput
            label="Level 3"
            name="level3"
            value={settings.level3}
            onChange={(e) => handleChange("level3", e.target.value)}
          />
          <SettingsInput
            label="Level 4"
            name="level4"
            value={settings.level4}
            onChange={(e) => handleChange("level4", e.target.value)}
          />
          <SettingsInput
            label="Level 5"
            name="level5"
            value={settings.level5}
            onChange={(e) => handleChange("level5", e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded border-gray-300 ml-6 mr-6 mt-6">
        <div className="flex flex-row items-center justify-between ml-6 mr-6 mt-[22px] pt-0 pl-0">
          <h1 className="font-semibold">Factory Jobs Display Setting</h1>
          <p className="text-[#FB923C] font-bold text-xs cursor-pointer">
            + Add more
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-6 mr-6 mb-4 mt-5">
          <SettingsInput
            label="Times (s)"
            name="time"
            value={settings.factoryJobTime}
            onChange={(e) => handleChange("factoryJobTime", e.target.value)}
          />
          <SettingsInput
            label="Device"
            name="device"
            value={settings.factoryDevice}
            onChange={(e) => handleChange("factoryDevice", e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end m-6">
        <Button
          type="primary"
          htmlType="submit"
          style={{
            height: "40px",
            width: "80px",
            backgroundColor: "#F97316",
          }}
          className="!font-semibold"
          loading={loading}
          onClick={handleSubmit}
        >
          Save
        </Button>
      </div>
    </>
  );
};

export default SettingsPage;
