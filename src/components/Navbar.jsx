// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-center space-x-6">
      <Link to="/home" className="hover:underline">
        Home
      </Link>
      <Link to="/about" className="hover:underline">
        About
      </Link>
      <Link to="/projects" className="hover:underline">
        Projects
      </Link>
    </nav>
  );
};

export default Navbar;
