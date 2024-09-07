import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import { Toaster } from "react-hot-toast";

const App = () => {
  // XOR decryption function (same as encryption)
  const encryptedToken = localStorage.getItem("authToken");
  const secretKey = "launchpadkey"; // Use the same key as for encryption
  let authToken = "";

  if (encryptedToken) {
    try {
      const token = atob(encryptedToken); // Decode the Base64 string first
      for (let i = 0; i < token.length; i++) {
        authToken += String.fromCharCode(
          token.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length)
        );
      }
    } catch (error) {
      console.error("Failed to decode or decrypt the token", error);
      authToken = ""; // Reset authToken if there's an error
    }
  }

  return (
    <>
    <Routes>
      {!authToken && <Route path="/auth/*" element={<AuthLayout />} />}
      {authToken && <Route path="/admin/*" element={<AdminLayout />} />}
      <Route path="*" element={<Navigate to={authToken ? "/admin/index" : "/auth/login"} replace />} />
    </Routes>
    <Toaster />
    </>
  );
};

export default App;
