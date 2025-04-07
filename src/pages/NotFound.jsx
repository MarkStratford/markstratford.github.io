// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="mb-4">That page wandered off like a toddler in Target.</p>
      <Link to="/home" className="text-blue-500 hover:underline">
        Back to safety
      </Link>
    </div>
  );
};

export default NotFound;
