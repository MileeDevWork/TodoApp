import React from "react";
import Logo_header from "../assets/Logo_header.png";

const Header = () => {
  return (
    <header className="bg-white h-14 w-full flex items-center px-6 shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src={Logo_header}
          alt="Logo"
          className="w-40 h-full object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex justify-center space-x-24">
        <a href="/" className="text-gray-900 font-medium">
          List
        </a>
        <a href="/Calendar" className="text-gray-400 hover:text-gray-900">
          Calendar
        </a>
        <a href="/Board" className="text-gray-400 hover:text-gray-900">
          Board
        </a>
        <a href="/Analyst" className="text-gray-400 hover:text-gray-900">
          Analyst
        </a>
      </nav>

      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium">Nobita</p>
          <p className="text-xs text-gray-500">User</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">N</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
