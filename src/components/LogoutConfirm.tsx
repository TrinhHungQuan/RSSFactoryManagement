import { Button } from "antd";

interface LogoutConfirmProps {
  handleLogout: () => void;
  onCancel: () => void;
}

const LogoutConfirm = ({ handleLogout, onCancel }: LogoutConfirmProps) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-black opacity-50 absolute inset-0"></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-110 h-58">
          <p className="text-lg font-semibold mb-4">Confirm logout</p>
          <p className="font-normal mb-8 text-gray-400">
            Are you sure you want to logout?
          </p>
          <div className="flex flex-col justify-center gap-4">
            <Button
              type="primary"
              style={{
                height: "40px",
                backgroundColor: "#F97316",
              }}
              onClick={handleLogout}
              className="!font-semibold"
            >
              Confirm
            </Button>
            <Button
              type="primary"
              style={{
                height: "40px",
                backgroundColor: "white",
                color: "black",
              }}
              onClick={onCancel}
              className="!font-semibold"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutConfirm;
