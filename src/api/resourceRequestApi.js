import axios from "./axios";

const BASE_URL = "/api/requests";

// ✅ SUBMIT RESOURCE REQUEST (Student)
export const submitResourceRequest = (payload) =>
  axios.post(`${BASE_URL}/resource`, payload);

// ✅ SUBMIT INFRASTRUCTURE REQUEST (Faculty)
export const submitInfrastructureRequest = (payload) =>
  axios.post(`${BASE_URL}/infrastructure`, payload);

// ✅ GET REQUESTS BY REQUESTER
export const getRequestsByRequester = (userId) =>
  axios.get(`${BASE_URL}/by-requester/${userId}`);

// ✅ GET ALL SUBMITTED REQUESTS
export const getSubmittedRequests = () =>
  axios.get(`${BASE_URL}?status=SUBMITTED`);

// ✅ APPROVE
export const approveRequest = (id, approverUserId) =>
  axios.post(`${BASE_URL}/${id}/approve`, null, {
    params: { approverUserId }
  });

// ✅ DECLINE
export const declineRequest = (id, approverUserId) =>
  axios.post(`${BASE_URL}/${id}/decline`, null, {
    params: { approverUserId, reason: "Rejected by Manager" }
  });