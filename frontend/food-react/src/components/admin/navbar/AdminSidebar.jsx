import { NavLink, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Panel</h2>
      </div>

      <div className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin" className={location.pathname === "/admin" ? "active" : ""} end>
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/categories"
              className={location.pathname.includes("/admin/categories") ? "active" : ""}
            >
              <span>Categories</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/menu-items"
              className={location.pathname.includes("/admin/menu-items") ? "active" : ""}
            >
              <span>Menu Items</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/orders"
              className={location.pathname.includes("/admin/orders") ? "active" : ""}
            >
              <span>Orders</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/admin/payments"
              className={location.pathname.includes("/admin/payments") ? "active" : ""}
            >
              <span>Payments</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;