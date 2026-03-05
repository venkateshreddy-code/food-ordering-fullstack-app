import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// TODO: replace these with your real admin pages when you have them
const AdminDashboard = () => <div style={{ padding: 20 }}>Admin Dashboard</div>;
const AdminCategories = () => <div style={{ padding: 20 }}>Admin Categories</div>;
const AdminMenuItems = () => <div style={{ padding: 20 }}>Admin Menu Items</div>;
const AdminOrders = () => <div style={{ padding: 20 }}>Admin Orders</div>;
const AdminPayments = () => <div style={{ padding: 20 }}>Admin Payments</div>;

const AdminRoutes = () => {
  return (
    <Routes>
      {/* default route when you go to /admin */}
      <Route path="/" element={<AdminDashboard />} />

      <Route path="categories" element={<AdminCategories />} />
      <Route path="menu-items" element={<AdminMenuItems />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="payments" element={<AdminPayments />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;