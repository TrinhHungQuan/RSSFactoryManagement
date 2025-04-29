import { IoClose } from "react-icons/io5";
import FloatingInput from "../../../components/FloatingInput";
import { Button } from "antd";
import { FormikProps } from "formik";
import { FormEditCompanyValues } from "../hooks/useFormValues";
import FloatingSelectCompany from "../../../components/FloatingSelectCompany";
import FloatingSelect from "../../../components/FloatingSelect";
import { useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../../services/api";
import { Company } from "../hooks/useCompanies";

interface EditCompanyFormModalProps {
  isOpen: boolean;
  onCancel: () => void;
  formik: FormikProps<FormEditCompanyValues>;
  companyId: string;
}

const AddCompanyFormModal = ({
  isOpen,
  onCancel,
  formik,
  companyId,
}: EditCompanyFormModalProps) => {
  const formikRef = useRef(formik);
  // Fetch Company by ID
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (isOpen && companyId) {
        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!accessToken) {
          console.error("No access token found.");
          return;
        }
        try {
          const res = await axios.get(`${BASE_URL}/companys/get/${companyId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (res.data && res.data.result) {
            const company = res.data.result;
            const mappedCompany: Company = {
              companyId: company.companyId,
              code: company.code,
              companyName: company.companyName,
              subcontractor: company.subcontractor,
              state: company.state,
              status: company.status,
              contactName: company.contactName,
              mobilePhone: company.mobilePhone,
              address: company.address,
            };

            formikRef.current.setValues({
              code: mappedCompany.code,
              companyName: mappedCompany.companyName,
              subcontractor: mappedCompany.subcontractor,
              state: mappedCompany.state,
              status: mappedCompany.status,
              contactName: mappedCompany.contactName,
              mobilePhone: mappedCompany.mobilePhone,
              address: mappedCompany.address,
            });
          } else {
            console.error("Invalid company data format:", res.data);
          }
        } catch (error) {
          console.error("Error fetching company details:", error);
        }
      }
    };
    fetchCompanyDetails();
  }, [isOpen, companyId]);
  const optionSubcontractor = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];
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
        <div className="relative bg-white rounded-lg shadow-lg w-2/5 min-w-100 mx-4 max-h-[90vh] overflow-y-auto scrollbar-none">
          <div className="flex flex-row justify-between items-center p-4">
            <h1 className="text-lg font-semibold">Add Company</h1>
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
                name="code"
                label="Code"
                value={formik.values.code}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.code && formik.errors.code && (
                  <p className="text-red-500 text-xs">{formik.errors.code}</p>
                )}
              </div>
              <FloatingInput
                name="companyName"
                label="Company Name"
                value={formik.values.companyName}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.companyName && formik.errors.companyName && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.companyName}
                  </p>
                )}
              </div>
              <FloatingSelectCompany
                name="subcontractor"
                label="Subcontractor"
                value={formik.values.subcontractor}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
                options={optionSubcontractor || []}
              />
              <div className="h-0">
                {formik.touched.subcontractor &&
                  formik.errors.subcontractor && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.subcontractor}
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
                  <p className="text-red-500 text-xs">{formik.errors.status}</p>
                )}
              </div>
              <FloatingInput
                name="state"
                label="State"
                value={formik.values.state}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.state && formik.errors.state && (
                  <p className="text-red-500 text-xs">{formik.errors.state}</p>
                )}
              </div>
              <FloatingInput
                name="contactName"
                label="Contact Name"
                value={formik.values.contactName}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.contactName && formik.errors.contactName && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.contactName}
                  </p>
                )}
              </div>
              <FloatingInput
                name="mobilePhone"
                label="Mobile Phone"
                value={formik.values.mobilePhone}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.mobilePhone && formik.errors.mobilePhone && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.mobilePhone}
                  </p>
                )}
              </div>
              <FloatingInput
                name="address"
                label="Address"
                value={formik.values.address}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required={true}
              />
              <div className="h-0">
                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-500 text-xs">
                    {formik.errors.address}
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

export default AddCompanyFormModal;
