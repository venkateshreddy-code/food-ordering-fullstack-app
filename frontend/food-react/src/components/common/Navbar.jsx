import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";

const Navbar = () => {

    const [open, setOpen] = useState(false);

    const isAuthenticated = ApiService.isAuthenticated();
    const isAdmin = ApiService.isAdmin();
    const isCustomer = ApiService.isCustomer();
    const isDeliveryPerson = ApiService.isDeliveryPerson();

    const navigate = useNavigate();

    const handleLogout = () => {
        const isLogout = window.confirm("Are you sure you want to logout?");
        if (isLogout) {
            ApiService.logout();
            navigate("/login");
        }
    };

    const closeMenu = () => {
        setOpen(false);
    };

    return (
        <nav className={open ? "open" : ""}>

            <div className="logo">
                <Link to="/" className="logo-link" onClick={closeMenu}>
                    Food App
                </Link>
            </div>

            <button
                className="hamburger"
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            <div className="desktop-nav">

                <Link to="/home" className="nav-link" onClick={closeMenu}>Home</Link>
                <Link to="/menu" className="nav-link" onClick={closeMenu}>Menu</Link>
                <Link to="/categories" className="nav-link" onClick={closeMenu}>Categories</Link>

                {isAuthenticated ? (
                    <>
                        {isCustomer && (
                            <Link to="/cart" className="nav-link" onClick={closeMenu}>
                                Cart
                            </Link>
                        )}

                        {isDeliveryPerson && (
                            <Link to="/deliveries" className="nav-link" onClick={closeMenu}>
                                Deliveries
                            </Link>
                        )}

                        {isAdmin && (
                            <Link to="/admin" className="nav-link" onClick={closeMenu}>
                                Admin
                            </Link>
                        )}

                        <Link to="/profile" className="nav-link" onClick={closeMenu}>
                            Profile
                        </Link>

                        <button
                            className="nav-button"
                            onClick={() => {
                                closeMenu();
                                handleLogout();
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link" onClick={closeMenu}>
                            Login
                        </Link>

                        <Link to="/register" className="nav-link" onClick={closeMenu}>
                            Register
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
};

export default Navbar;