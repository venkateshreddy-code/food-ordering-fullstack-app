import React from "react";
import { Navigate } from "react-router-dom";
import ApiService from "../../services/ApiService";

const CustomerRoute = ({ children }) => {
  const isAuthenticated = ApiService.isAuthenticated();

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default CustomerRoute;