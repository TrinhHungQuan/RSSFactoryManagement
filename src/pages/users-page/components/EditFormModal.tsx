import { Button } from "antd";
import { FormikProps } from "formik";
import { IoClose } from "react-icons/io5";
import FloatingInput from "../../../components/FloatingInput";
import FloatingSelect from "../../../components/FloatingSelect";
import FloatingDatePicker from "../../../components/FloatingDatePicker";
interface FormValues {
  firstName: string;
  userName: string;
  role: string;
  engineeringTeams: string;
  lastName: string;
  dateOfBirth: string;
  company: string;
  status: string;
}

interface EditUserFormModalProps {
  isOpen: boolean;
  onCancel: () => void;
  formik: FormikProps<FormValues>;
}

const EditUserFormModal = ({
  isOpen,
  onCancel,
  formik,
}: EditUserFormModalProps) => {
  const optionRoleTest = [
    { label: "Admin", value: "Admin" },
    { label: "Factory Manager", value: "Factory Manager" },
  ];

  const optionEngineeringTest = [
    { label: "Team 1", value: "Team1" },
    { label: "Team 2", value: "Team2" },
  ];

  const optionCompanyTest = [
    { label: "Company 1", value: "Company1" },
    { label: "Company 2", value: "Company2" },
  ];

  const optionStatus = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-black opacity-50 absolute inset-0"
          onClick={onCancel}
        ></div>

        <div className="relative bg-white rounded-lg shadow-lg w-3/5 mx-4 max-h-[90vh] overflow-y-auto scrollbar-none">
          <div className="flex flex-row justify-between items-center p-4">
            <h1 className="text-lg font-semibold">Edit User</h1>
            <button onClick={onCancel} className="cursor-pointer">
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Divider line below header */}
          <div className="w-full h-px bg-gray-300 mt-0" />

          <div className="flex items-center justify-center mt-4">
            <div className="flex justify-center items-center w-32 h-32 border rounded-full border-amber-300">
              Image
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
                  options={optionRoleTest}
                />
                <div className="h-0">
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-red-500 text-xs">{formik.errors.role}</p>
                  )}
                </div>

                <FloatingSelect
                  name="engineeringTeams"
                  label="Engineering Teams"
                  value={formik.values.engineeringTeams}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                  options={optionEngineeringTest}
                />
                <div className="h-0">
                  {formik.touched.engineeringTeams &&
                    formik.errors.engineeringTeams && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.engineeringTeams}
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
                <FloatingSelect
                  name="company"
                  label="Company"
                  value={formik.values.company}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required={true}
                  options={optionCompanyTest}
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

export default EditUserFormModal;
