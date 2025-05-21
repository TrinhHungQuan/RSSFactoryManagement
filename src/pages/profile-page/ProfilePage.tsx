import axios from "axios";
import { useEffect, useState } from "react";
import { API_ENDPOINTS, BASE_URL } from "../../services/api";
import { FaUserCircle } from "react-icons/fa";

interface Company {
  id: string;
  code: string;
  companyName: string;
  subcontractor: boolean;
  state: string;
  status: string;
  contactName: string;
  mobilePhone: string;
  address: string;
  createAt: string;
  updateAt: string;
}

interface Team {
  id: string;
  name: string;
  createAt: string;
  updateAt: string;
}

interface User {
  image: string;
  firstname: string;
  lastname: string;
  username: string;
  roleName: string;
  dateOfBirth: Date;
  status: string;
  company: Company[];
  team: Team[];
}

const ProfilePage = () => {
  const [profileUser, setProfileUser] = useState<User | null>(null);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get User Profile
  const getProfileUser = async (accessToken: string) => {
    try {
      const response = await axios.get(API_ENDPOINTS.getMyInfo, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(response.data.result);
      setProfileUser(response.data.result);
    } catch (error) {
      console.error("Error fetching user details: ", error);
    }
  };

  useEffect(() => {
    const accessToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    getProfileUser(accessToken!);
  }, []);
  return (
    <>
      <div className="flex justify-between items-center top-0 ml-6 mr-6 mb-4 mt-5.5 pt-0 pl-0">
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>
      <div className="flex lg:flex-row lg:items-stretch items-center flex-col justify-center gap-5 ml-6 mr-6">
        {/* For Basic Information */}
        <div className="flex flex-col border-2 rounded-3xl lg:w-1/3 w-1/2 border-gray-500 justify-start items-center">
          <div className="w-30 h-30 rounded-full border border-gray-500 m-4 overflow-hidden">
            {profileUser?.image ? (
              <img
                src={`${BASE_URL}/${profileUser?.image}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-row gap-1 mb-4 text-lg font-serif">
            <h1 className="font-semibold">
              {profileUser?.firstname} {profileUser?.lastname}
            </h1>
          </div>
          <div className="flex justify-between items-center w-full px-4">
            <h1 className="font-bold font-serif">Username</h1>
            <h1 className="">{profileUser?.username}</h1>
          </div>
          <div className="h-px bg-gray-300 w-full mb-3 mt-3" />
          <div className="flex justify-between items-center w-full px-4 ">
            <h1 className="font-bold font-serif">Date of Birth</h1>
            <h1 className="">
              {profileUser?.dateOfBirth
                ? formatDate(profileUser?.dateOfBirth)
                : "N/A"}
            </h1>
          </div>
          <div className="h-px bg-gray-300 w-full mb-3 mt-3" />
          <div className="flex justify-between items-center w-full px-4 ">
            <h1 className="font-bold font-serif">Role</h1>
            <h1 className="">
              {profileUser?.roleName
                ? profileUser.roleName
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
            </h1>
          </div>
          <div className="h-px bg-gray-300 w-full mb-3 mt-3" />
          <div className="flex justify-between items-center w-full px-4 ">
            <h1 className="font-bold font-serif">Status</h1>
            <h1 className="">{profileUser?.status}</h1>
          </div>
          <div className="h-pxw-full mb-2 mt-2" />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
