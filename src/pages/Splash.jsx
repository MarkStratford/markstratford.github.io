// src/pages/Splash.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const Splash = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRedirect(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return redirect ? (
    <Navigate to="/home" replace />
  ) : (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <h1 className="text-4xl animate-pulse">Loading Mark Stratford...</h1>
    </div>
  );
};

export default Splash;
