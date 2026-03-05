import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";

import HomePage from "./components/home_menu/HomePage.jsx";
import MenuPage from "./components/home_menu/MenuPage.jsx";
import CategoriesPage from "./components/home_menu/CategoryPage.jsx";
import MenuDetailsPage from "./components/home_menu/MenuDetailsPage";

import LoginPage from "./components/auth/LoginPage.jsx";
import RegisterPage from "./components/auth/RegisterPage.jsx";

import ProfilePage from "./components/profile_cart/ProfilePage";
import UpdateProfilePage from "./components/profile_cart/UpdateProfilePage";
import OrderHistoryPage from "./components/profile_cart/OrderHistoryPage";
import LeaveReviewPage from "./components/profile_cart/LeaveReviewPage.jsx";
import CartPage from "./components/profile_cart/CartPage";

import CustomerRoute from "./components/common/CustomerRoute.jsx";
import ProcessPaymenttPage from "./components/payment/ProcessPaymentPage.jsx";

import AdminLayout from "./components/admin/navbar/AdminLayout";
import AdminDashboardPage from "./components/admin/AdminDashboardPage";
import AdminCategoriesPage from "./components/admin/AdminCategoriesPage";
import AdminCategoryFormPage from "./components/admin/AdminCategoryFormPage";
import AdminMenuPage from "./components/admin/AdminMenuPage";
import AdminMenuFormPage from "./components/admin/AdminMenuFormPage.jsx";
import AdminOrdersPage from "./components/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./components/admin/AdminOrderDetailPage";
import AdminPaymentsPage from "./components/admin/AdminPaymentsPage";
import AdminPaymentDetailPage from "./components/admin/AdminPaymentDetailPage";
import AdminUserRegistration from "./components/auth/AdminUserRegistration";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:id" element={<MenuDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/profile"
            element={
              <CustomerRoute>
                <ProfilePage />
              </CustomerRoute>
            }
          />

          <Route
            path="/update"
            element={
              <CustomerRoute>
                <UpdateProfilePage />
              </CustomerRoute>
            }
          />

          <Route
            path="/my-order-history"
            element={
              <CustomerRoute>
                <OrderHistoryPage />
              </CustomerRoute>
            }
          />

          <Route
            path="/leave-review"
            element={
              <CustomerRoute>
                <LeaveReviewPage />
              </CustomerRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <CustomerRoute>
                <CartPage />
              </CustomerRoute>
            }
          />

          <Route
            path="/pay"
            element={
              <CustomerRoute>
                <ProcessPaymenttPage />
              </CustomerRoute>
            }
          />

          {/* ✅ ADMIN ROUTES */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />

            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="categories/new" element={<AdminCategoryFormPage />} />
            <Route path="categories/edit/:id" element={<AdminCategoryFormPage />} />

            <Route path="menu-items" element={<AdminMenuPage />} />
            <Route path="menu-items/new" element={<AdminMenuFormPage />} />
            <Route path="menu-items/edit/:id" element={<AdminMenuFormPage />} />

            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />

            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="payments/:id" element={<AdminPaymentDetailPage />} />
                     <Route path="register" element={<AdminUserRegistration />} />

          </Route>
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;