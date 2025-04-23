import { Button } from "antd";
import { useOutletContext } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { useState } from "react";
import { RxCaretSort } from "react-icons/rx";
import { RxCaretDown } from "react-icons/rx";
import { RxCaretUp } from "react-icons/rx";
import SearchInput from "../../components/SearchInput";

type LayoutContextType = {
  isSiderCollapsed: boolean;
};

interface Company {
  code: string;
  name: string;
  subcontractor: boolean;
  state: string;
  status: string;
  contactName: string;
  mobilePhone: string;
  address: string;
}

const companies = [
  {
    code: "CMP001",
    name: "Alpha Industries",
    subcontractor: true,
    state: "California",
    status: "Active",
    contactName: "John Doe",
    mobilePhone: "123-456-7890",
    address: "123 Sunset Blvd, Los Angeles, CA",
  },
  {
    code: "CMP002",
    name: "Beta Corp",
    subcontractor: false,
    state: "Texas",
    status: "Inactive",
    contactName: "Jane Smith",
    mobilePhone: "987-654-3210",
    address: "456 Elm Street, Houston, TX",
  },
  {
    code: "CMP003",
    name: "Gamma Solutions",
    subcontractor: true,
    state: "New York",
    status: "Inactive",
    contactName: "Emily Johnson",
    mobilePhone: "555-123-4567",
    address: "789 Broadway Ave, New York, NY",
  },
  {
    code: "CMP004",
    name: "Delta Group",
    subcontractor: false,
    state: "Florida",
    status: "Active",
    contactName: "Michael Brown",
    mobilePhone: "444-555-6666",
    address: "321 Ocean Dr, Miami, FL",
  },
];

const CompanyPage = () => {
  const { isSiderCollapsed } = useOutletContext<LayoutContextType>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrderCode, setSortOrderCode] = useState<"asc" | "desc" | "none">(
    "none"
  );
  const [sortOrderCompanyName, setSortOrderCompanyName] = useState<
    "asc" | "desc" | "none"
  >("none");
  const [sortOrderState, setSortOrderState] = useState<"asc" | "desc" | "none">(
    "none"
  );
  const [sortOrderContactName, setSortOrderContactName] = useState<
    "asc" | "desc" | "none"
  >("none");

  const sortCompany = (sortCompaniesList: Company[]) => {
    if (sortOrderCode !== "none") {
      return [...sortCompaniesList].sort((a, b) => {
        if (sortOrderCode === "asc") return a.code.localeCompare(b.code);
        if (sortOrderCode === "desc") return b.code.localeCompare(a.code);
        return 0;
      });
    } else if (sortOrderCompanyName !== "none") {
      return [...sortCompaniesList].sort((a, b) => {
        if (sortOrderCompanyName === "asc") return a.name.localeCompare(b.name);
        if (sortOrderCompanyName === "desc")
          return b.name.localeCompare(a.name);
        return 0;
      });
    } else if (sortOrderState !== "none") {
      return [...sortCompaniesList].sort((a, b) => {
        if (sortOrderState === "asc") return a.state.localeCompare(b.state);
        if (sortOrderState === "desc") return b.state.localeCompare(a.state);
        return 0;
      });
    } else if (sortOrderContactName !== "none") {
      return [...sortCompaniesList].sort((a, b) => {
        if (sortOrderContactName === "asc")
          return a.contactName.localeCompare(b.contactName);
        if (sortOrderContactName === "desc")
          return b.contactName.localeCompare(a.contactName);
        return 0;
      });
    }
    return sortCompaniesList;
  };

  const handleSortCodeClick = () => {
    setSortOrderCode((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCompanyName("none");
    setSortOrderState("none");
    setSortOrderContactName("none");
  };

  const handleSortCompanyNameClick = () => {
    setSortOrderCompanyName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCode("none");
    setSortOrderState("none");
    setSortOrderContactName("none");
  };

  const handleSortStateClick = () => {
    setSortOrderState((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCode("none");
    setSortOrderCompanyName("none");
    setSortOrderContactName("none");
  };

  const handleSortContactNameClick = () => {
    setSortOrderContactName((prevOrder) => {
      if (prevOrder === "none") return "asc";
      if (prevOrder === "asc") return "desc";
      return "none";
    });
    setSortOrderCode("none");
    setSortOrderCompanyName("none");
    setSortOrderState("none");
  };

  const sortedCompanies = sortCompany(companies);

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSiderCollapsed ? "lg:pl-[0px] pl-[60px]" : "pl-[220px]"
        }`}
      >
        <div className="flex justify-between items-center mt-[22px] mb-4 px-6 w-full">
          <h1 className="text-xl font-semibold">Company Management</h1>
          <Button
            type="primary"
            style={{ height: "40px", backgroundColor: "#F97316" }}
            className="!font-semibold"
          >
            + Add New Company
          </Button>
        </div>
        <div className="w-full px-6 mb-3">
          <SearchInput
            value={searchQuery}
            placeholder="Search by code, company name"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto px-6">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300">
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortCodeClick}
                  >
                    <span className="flex items-center justify-between">
                      Code
                      {sortOrderCode === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderCode === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderCode === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortCompanyNameClick}
                  >
                    <span className="flex items-center justify-between">
                      Company Name
                      {sortOrderCompanyName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderCompanyName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderCompanyName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-center">
                      Subcontractor
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span
                      className="flex items-center justify-between"
                      onClick={handleSortStateClick}
                    >
                      State
                      {sortOrderState === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderState === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderState === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Status
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={handleSortContactNameClick}
                  >
                    <span className="flex items-center justify-between">
                      Contact Name
                      {sortOrderContactName === "none" && (
                        <RxCaretSort className="w-4 h-4" />
                      )}
                      {sortOrderContactName === "asc" && (
                        <RxCaretDown className="w-4 h-4" />
                      )}
                      {sortOrderContactName === "desc" && (
                        <RxCaretUp className="w-4 h-4" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Mobile Phone
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-start">
                      Address
                    </span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer font-semibold">
                    <span className="flex items-center justify-center">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCompanies.map((company, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{company.code}</td>
                    <td className="px-4 py-2 ">{company.name}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center">
                        {company.subcontractor === true ? (
                          <FaRegCheckCircle className="text-green-600 w-5 h-5" />
                        ) : (
                          <FaRegCircle className="text-gray-400 w-5 h-5" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 ">{company.state}</td>
                    <td className="px-4 py-2">
                      <div
                        className={`border font-semibold rounded-3xl flex items-center justify-center pt-0.5 pb-0.5 pl-1 pr-1 ${
                          company.status === "Active"
                            ? "border-green-600 bg-green-50 text-green-600 text-xs"
                            : "border-gray-600 bg-gray-50 text-gray-600 text-xs"
                        }`}
                      >
                        {company.status}
                      </div>
                    </td>
                    <td className="px-4 py-2 ">{company.contactName}</td>
                    <td className="px-4 py-2 ">{company.mobilePhone}</td>
                    <td className="px-4 py-2 ">{company.address}</td>
                    <td className="flex flex-row items-center justify-center">
                      <Button
                        type="link"
                        icon={<FiEdit3 />}
                        style={{ width: 32, height: 32, color: "#F97316" }}
                      />

                      <Button
                        type="link"
                        icon={<RiDeleteBinLine />}
                        style={{ width: 32, height: 32, color: "black" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyPage;
