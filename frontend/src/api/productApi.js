import axios from "axios";

const API = "/api/products";

export async function listProducts() {
  const res = await axios.get(API);
  return res.data;
}

export async function getProduct(id) {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
}

export async function createProduct(dto) {
  const res = await axios.post(API, dto);
  return res.data;
}

export async function updateProduct(id, dto) {
  const res = await axios.put(`${API}/${id}`, dto);
  return res.data;
}

export async function deleteProduct(id) {
  await axios.delete(`${API}/${id}`);
}