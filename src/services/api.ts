export const BASE_URL = "http://localhost:8080/factory/api";

export const API_ENDPOINTS = {
  getMyInfo: `${BASE_URL}/users/getmyinfo`,
  login: `${BASE_URL}/auth/login`,
  logout: `${BASE_URL}/auth/logout`,
  getUser: `${BASE_URL}/users/get`,
  uploadImage: `${BASE_URL}/users/upload-image`,
  getRoles: `${BASE_URL}/roles/get`,
  getCompanies: `${BASE_URL}/companys/dropdown-list`,
  getEngineeringTeams: `${BASE_URL}/teams/get`,
  createUser:  `${BASE_URL}/users/create`,
  deleteUser: `${BASE_URL}/users/delete`,
  updateUser: `${BASE_URL}/users/update`,
  changePassword: `${BASE_URL}/users/change-password`,
  getCompaniesTable: `${BASE_URL}/companys/get`,
  createCompany: `${BASE_URL}/companys/create`,
  updateCompany: `${BASE_URL}/companys/update`,
  deleteCompany: `${BASE_URL}/companys/delete`
};