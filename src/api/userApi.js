import axios from "./axios";

const BASE_URL = "/api/users";

// ✅ GET USER BY ID
export const getUserById = (id) =>
  axios.get(`${BASE_URL}/${id}`);