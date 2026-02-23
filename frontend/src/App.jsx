import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";

import CustomerList from "./pages/customers/CustomerList.jsx";
import CustomerForm from "./pages/customers/CustomerForm.jsx";
import CustomerDetails from "./pages/customers/CustomerDetails.jsx";

import ProductList from "./pages/products/ProductList.jsx";
import ProductForm from "./pages/products/ProductForm.jsx";
import ProductDetails from "./pages/products/ProductDetails.jsx";

import OrderList from "./pages/orders/OrderList.jsx";
import OrderForm from "./pages/orders/OrderForm.jsx";
import OrderDetails from "./pages/orders/OrderDetails.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Customer */}
        <Route path="/" element={<Navigate to="/customers" replace />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerForm mode="create" />} />
        <Route path="/customers/:id/edit" element={<CustomerForm mode="edit" />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />

        {/* Product */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm mode="create" />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/:id/edit" element={<ProductForm mode="edit" />} />

        {/* Order */}
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/new" element={<OrderForm />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
      </Route>

      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}