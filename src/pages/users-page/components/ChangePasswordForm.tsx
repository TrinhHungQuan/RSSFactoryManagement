import { IoClose } from "react-icons/io5";
import FloatingInput from "../../../components/FloatingInput";
import { Button } from "antd";
import { FormikProps } from "formik";
import { FormPassword } from "../hooks/useFormValues";

interface ChangePasswordFormProps {
  isOpen: boolean;
  onCancel: () => void;
  formik: FormikProps<FormPassword>;
}

const ChangePasswordForm = ({
  isOpen,
  onCancel,
  formik,
}: ChangePasswordFormProps) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-black opacity-50 absolute inset-0"
          onClick={onCancel}
        ></div>
        <div className="relative bg-white rounded-lg shadow-lg w-2/5 min-w-100 mx-4 max-h-[90vh] overflow-y-auto scrollbar-none">
          <div className="flex flex-row justify-between items-center p-4">
            <h1 className="text-lg font-semibold">Change Password</h1>
            <button onClick={onCancel} className="cursor-pointer">
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          {/* Divider line below header */}
          <div className="w-full h-px bg-gray-300 mt-0" />

          {/* Change Password Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-full p-4"
          >
            <div className="flex flex-col justify-start w-full ">
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
              <FloatingInput
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
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

export default ChangePasswordForm;
