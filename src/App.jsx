// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
