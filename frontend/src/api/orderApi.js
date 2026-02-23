import axios from "axios";

const API = "/api/orders";

export async function listOrders() {
  const res = await axios.get(API);
  return res.data;
}

export async function getOrder(id) {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
}

export async function listOrdersByCustomer(customerId) {
  const res = await axios.get(`${API}/customer/${customerId}`);
  return res.data;
}

export async function createOrder(payload) {
  const res = await axios.post(API, payload);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await axios.patch(`${API}/${id}/status`, { status });
  return res.data;
}

export async function deleteOrder(id) {
  await axios.delete(`${API}/${id}`);
}