import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { useError } from "../../common/ErrorDisplay";

const AdminTopbar = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const { ErrorDisplay, showError } = useError();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiService.myProfile();
        if (response.statusCode === 200) setUserProfile(response.data);
      } catch (error) {
        showError(error.response?.data?.message || error.message);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    ApiService.logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    const sidebar = document.querySelector(".admin-sidebar");
    if (sidebar) sidebar.classList.toggle("active");
  };

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          Menu
        </button>
      </div>

      <ErrorDisplay />

      <div className="topbar-right">
        <div className="user-profile">
          <img
            src={userProfile?.profileUrl}
            alt="User Profile"
            className="profile-image"
          />
          <div className="profile-info">
            <span className="profile-name">{userProfile?.name || "Admin"}</span>
            <span className="profile-role">Admin</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;