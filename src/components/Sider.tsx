import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import siderImage from "../assets/sider_image.png";
import { BiBarChartSquare } from "react-icons/bi";
import { FiBriefcase, FiPackage, FiLayers, FiSettings } from "react-icons/fi";
import { BsTruck } from "react-icons/bs";
import { TbUserCircle } from "react-icons/tb";
import { LuDot, LuBadgeCheck } from "react-icons/lu";
import { TbBuilding } from "react-icons/tb";
import { TfiArchive } from "react-icons/tfi";
import { CiUser } from "react-icons/ci";
import {
  IoChevronBack,
  IoChevronForward,
  IoLogOutOutline,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import axios from "axios";
import { API_ENDPOINTS, BASE_URL } from "../services/api";
import { FaUserCircle } from "react-icons/fa";

interface Props {
  closeSider: () => void;
  toggleSider: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
}

interface User {
  code: number;
  image: string;
  firstname: string;
  lastname: string;
  roleName: string;
}

const Sider = ({ closeSider, toggleSider, onLogout, isCollapsed }: Props) => {
  const [isUserAndRoleOpen, setUserAndRoleOpen] = useState(false);
  const [isProfileLogoutOpen, setProfileLogoutOpen] = useState(false);
  const [profileNameAndRole, setProfileNameAndRole] = useState<User | null>(
    null
  );
  const location = useLocation();
  const currentPath = location.pathname;

  const isUserOrRoleActive =
    currentPath === "/users" || currentPath === "/roles";

  // Fetching User Profile for showing
  const getProfileNameAndRole = async (accessToken: string) => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMyInfo, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const currentUserId = response.data.result.userId;
      const currentRole = response.data.result.roleName;
      localStorage.setItem("currentUserId", currentUserId);
      localStorage.setItem("currentRole", currentRole);
      console.log(response.data.result);
      setProfileNameAndRole(response.data.result);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    getProfileNameAndRole(accessToken!);
  }, []);

  // NavLink UI
  const navItemClasses = (isActive: boolean) =>
    isActive
      ? `active  ${
          isCollapsed ? "w-13" : "w-[211px]"
        } h-10 rounded-[6px] bg-[#2c2a29]/55 z-40 text-[#FB923C] flex items-center px-2 font-medium text-[14px] justify-start gap-4`
      : `${
          isCollapsed ? "w-13" : "w-[211px]"
        } h-10 text-white flex items-center px-2 justify-start gap-1 font-normal text-[14px]`;

  return (
    <>
      <div
        className={`h-screen fixed transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-15" : "w-55"
        }`}
      >
        <div
          className="w-full h-full shadow-lg p-2 overflow-y-auto overflow-x-visible scrollbar-none flex flex-col bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${siderImage})` }}
        >
          {/* Sider Button */}
          <div className="absolute top-4 -right-4 z-50">
            <button
              onClick={() => {
                toggleSider();
                if (isCollapsed && isUserOrRoleActive) {
                  setUserAndRoleOpen(true);
                } else setUserAndRoleOpen(false);
              }}
              className="text-white bg-orange-400 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md hover:bg-orange-500 transition cursor-pointer"
            >
              {isCollapsed ? <IoChevronForward /> : <IoChevronBack />}
            </button>
          </div>

          {/* Sider Items */}
          <ul className="flex flex-col items-start mt-[8px] gap-2">
            {/* Dashboard Page */}
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `active ${
                        isCollapsed ? "w-13" : "w-[211px]"
                      } h-[40px] mt-[30px] rounded-[6px] bg-[#2c2a29]/55 z-40 text-[#FB923C] flex items-center px-2 font-medium text-[14px] justify-start gap-4`
                    : `${
                        isCollapsed ? "w-13" : "w-[211px]"
                      } h-10 mt-[30px] text-white flex items-center px-2 justify-start gap-1 font-normal text-[14px]`
                }
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <BiBarChartSquare className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Dashboard"}
                </div>
              </NavLink>
            </li>

            {/* Job Page*/}
            <li>
              <NavLink
                to="/jobs"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <FiBriefcase className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Major Projects - Jobs"}
                </div>
              </NavLink>
            </li>

            {/* Items Page*/}
            <li>
              <NavLink
                to="/items"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <FiPackage className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Major Projects - Items"}
                </div>
              </NavLink>
            </li>

            {/* Special Project Page*/}
            <li>
              <NavLink
                to="/specialprojects"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <LuBadgeCheck className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Special Project"}
                </div>
              </NavLink>
            </li>

            {/* Delivery Page */}
            <li>
              <NavLink
                to="/delivery"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <BsTruck className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Delivery"}
                </div>
              </NavLink>
            </li>

            {/* Users & Roles Dropdown */}
            <li>
              <button
                className={`w-[211px] h-10 flex items-center justify-between px-2 ${
                  isUserOrRoleActive ? "text-[#FB923C]" : "text-white"
                } font-normal text-[14px] rounded-md cursor-pointer`}
                onClick={() => {
                  setUserAndRoleOpen(!isUserAndRoleOpen);
                  if (isCollapsed && !isUserAndRoleOpen) toggleSider();
                }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <TbUserCircle className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Users & Roles"}
                </div>

                {isUserAndRoleOpen ? (
                  <IoChevronUp className="w-4 h-4" />
                ) : (
                  <IoChevronDown className="w-4 h-4" />
                )}
              </button>
              {isUserAndRoleOpen && (
                <ul className="flex flex-col items-start mt-2 gap-2">
                  <li>
                    <NavLink
                      to="/users"
                      className={({ isActive }) => navItemClasses(isActive)}
                      onClick={() => {
                        closeSider();
                        setUserAndRoleOpen(!isUserAndRoleOpen);
                      }}
                    >
                      <div className="flex flex-row items-center">
                        <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                          <LuDot className="w-5 h-5" />
                        </div>
                        {!isCollapsed && "Users"}
                      </div>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/roles"
                      className={({ isActive }) => navItemClasses(isActive)}
                      onClick={() => {
                        closeSider();
                        setUserAndRoleOpen(!isUserAndRoleOpen);
                      }}
                    >
                      <div className="flex flex-row items-center">
                        <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                          <LuDot className="w-5 h-5" />
                        </div>
                        {!isCollapsed && "Roles"}
                      </div>
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Company Page */}
            <li>
              <NavLink
                to="/company"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <TbBuilding className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Company"}
                </div>
              </NavLink>
            </li>

            {/* Storage Page */}
            <li>
              <NavLink
                to="/storage"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <TfiArchive className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Storage units"}
                </div>
              </NavLink>
            </li>

            {/* Material Page */}
            <li>
              <NavLink
                to="/materials"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <FiLayers className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Materials"}
                </div>
              </NavLink>
            </li>

            {/* Setting Page */}
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => navItemClasses(isActive)}
                onClick={() => {
                  closeSider();
                  setUserAndRoleOpen(false);
                }}
              >
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                    <FiSettings className="w-5 h-5" />
                  </div>
                  {!isCollapsed && "Settings"}
                </div>
              </NavLink>
            </li>
          </ul>

          {/* Profile and Logout Dropdown */}
          <div
            className={`${
              isCollapsed ? "w-13" : "w-51"
            } bg-[#2c2a29]/55 z-40 rounded-[6px] h-auto mt-auto`}
          >
            <button
              className={`${
                isCollapsed ? "w-13" : "w-51"
              } px-2 flex flex-row items-center text-white cursor-pointer`}
              onClick={() => setProfileLogoutOpen(!isProfileLogoutOpen)}
            >
              <div className="w-10 h-10 flex items-center pl-[6px] pr-1 mr-[10px]">
                {profileNameAndRole?.image ? (
                  <img
                    src={`${BASE_URL}/${profileNameAndRole.image}`}
                    className="rounded-full"
                  />
                ) : (
                  <FaUserCircle className="rounded-full" />
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <p className="text-[14px] font-normal">
                    {profileNameAndRole?.firstname || ""}{" "}
                    {profileNameAndRole?.lastname || ""}
                  </p>
                  <p className="text-[12px] text-gray-300">
                    {profileNameAndRole?.roleName
                      ? profileNameAndRole.roleName
                          .replace(/_/g, " ")
                          .split(" ")
                          .map((word, index) =>
                            index === 0
                              ? word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                              : word.toLowerCase()
                          )
                          .join(" ")
                      : ""}
                  </p>
                </div>
              )}
            </button>
            {isProfileLogoutOpen && (
              <ul className="flex flex-col items-start">
                <li>
                  <NavLink
                    to="/profile"
                    onClick={() => {
                      closeSider();
                      setUserAndRoleOpen(false);
                    }}
                    className={({ isActive }) =>
                      isActive
                        ? `active ${
                            isCollapsed ? "w-13" : "w-51"
                          } text-[#FB923C] flex items-center px-2 font-medium text-[14px] justify-start gap-4`
                        : `text-white ${
                            isCollapsed ? "w-13" : "w-51"
                          } flex items-center px-2 justify-start gap-1 font-normal text-[14px]`
                    }
                  >
                    <div className="flex flex-row items-center text-[13px] font-normal">
                      <div className="w-[40px] h-[40px] flex items-center pl-[6px] pr-1">
                        <CiUser className="w-[15px] h-[15px]" />
                      </div>
                      {!isCollapsed && "View Profile"}
                    </div>
                  </NavLink>
                </li>
                <li>
                  <button
                    className={`text-white px-2 cursor-pointer ${
                      isCollapsed ? "w-13" : "w-51"
                    }`}
                    onClick={onLogout}
                  >
                    <div className="flex flex-row items-center text-[13px] font-normal">
                      <div className="w-10 h-10 flex items-center pl-[6px] pr-1">
                        <IoLogOutOutline className="w-[15px] h-[15px]" />
                      </div>
                      {!isCollapsed && "Logout"}
                    </div>
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sider;
