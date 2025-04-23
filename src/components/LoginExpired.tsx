import { Button } from "antd";

interface LoginExpiredProps {
  handleExpiredLogin: () => void;
}

const LoginExpired = ({ handleExpiredLogin }: LoginExpiredProps) => {
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-black opacity-50 absolute inset-0"></div>
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-110 h-46">
          <p className="text-lg font-semibold mb-4">Login expired</p>
          <p className="font-normal mb-8 text-gray-400">
            Your login session has expired. Please log in again.
          </p>
          <div className="flex flex-col justify-center gap-4">
            <Button
              type="primary"
              style={{
                height: "40px",
                backgroundColor: "#F97316",
              }}
              onClick={handleExpiredLogin}
              className="!font-semibold"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginExpired;
