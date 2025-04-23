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
  createUser:  `${BASE_URL}/users/create`
};