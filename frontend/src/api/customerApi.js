import { http } from "./http";

export async function listCustomers() {
  const res = await http.get("/api/customers");
  return res.data;
}

export async function getCustomer(id) {
  const res = await http.get(`/api/customers/${id}`);
  return res.data;
}

export async function createCustomer(payload) {
  const res = await http.post("/api/customers", payload);
  return res.data;
}

export async function updateCustomer(id, payload) {
  const res = await http.put(`/api/customers/${id}`, payload);
  return res.data;
}

export async function deleteCustomer(id) {
  await http.delete(`/api/customers/${id}`);
}