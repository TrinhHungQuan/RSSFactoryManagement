import { IoClose } from "react-icons/io5";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../services/api";
import { FaUserCircle } from "react-icons/fa";
import { User } from "../hooks/useUsers";

interface DetailsUserProps {
  isOpen: boolean;
  onCancel: () => void;
  userId: string | null;
}

const UserDetails = ({ isOpen, onCancel, userId }: DetailsUserProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Fetch User by ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isOpen && userId) {
        const accessToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!accessToken) {
          console.error("No access token found.");
          return;
        }

        try {
          const res = await axios.get(`${BASE_URL}/users/get/${userId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (res.data && res.data.result) {
            const user = res.data.result;
            const mappedUser: User = {
              userId: user.userId,
              username: user.username,
              firstName: user.firstname,
              lastName: user.lastname,
              company: user.company?.[0]?.companyName || "",
              engineeringTeam: user.team?.[0]?.name || "",
              dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
              role: user.roleName,
              status: user.status === "ACTIVE" ? "Active" : "Inactive",
              image: user.image || "",
              projectManager: user.projectManager || "",
            };
            setUser(mappedUser);
          } else {
            console.error("Invalid user data format:", res.data);
          }
        } catch (err) {
          console.error("Failed to fetch user details", err);
        }
      }
    };

    fetchUserDetails();
  }, [isOpen, userId]);

  return (
    <>
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[360px] bg-white shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full p-4 flex flex-col bg-white">
          {/* Header */}
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-lg font-semibold">User Information</h1>
            <button onClick={onCancel} className="cursor-pointer">
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Image and basic information block */}
          <div className="bg-gray-50 flex flex-col justify-center items-center rounded-lg">
            <div className="w-20 h-20 rounded-full border border-gray-300 m-2 overflow-hidden">
              {user?.image ? (
                <img
                  src={`${BASE_URL}/${user?.image}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-row gap-1 mb-1 text-lg">
              <h1 className="font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
            </div>
            <div
              className={`border mb-1.5 font-semibold rounded-3xl flex items-center justify-center pt-0.5 pb-0.5 pl-1 pr-1 ${
                user?.status === "Active"
                  ? "border-green-600 bg-green-50 text-green-600 text-xs"
                  : "border-gray-600 bg-gray-50 text-gray-600 text-xs"
              }`}
            >
              {user?.status}
            </div>
            <div className="mb-1">
              <h1>
                {user?.role
                  ? user.role
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
          </div>

          {/* Other information */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500">First name:</p>
              <p className="font-semibold">{user?.firstName}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500">Last name:</p>
              <p className="font-semibold">{user?.lastName}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500">Username:</p>
              <p className="font-semibold">{user?.username}</p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500">Date of Birth:</p>
              <p className="font-semibold">
                {user?.dateOfBirth
                  ? format(new Date(user.dateOfBirth), "dd/MM/yyyy")
                  : "-"}
              </p>
            </div>
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500">Project Manager:</p>
              <p className="font-semibold">
                {user?.projectManager ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
