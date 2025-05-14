import React, { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which dropdown is active
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleDropdownToggle = (dropdown) => {
    // If the clicked dropdown is already open, close it, else open it
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div className="navbar">
      <div className="burger-icon" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <ul className={`nav-list ${isMenuVisible ? "show" : ""}`}>
        <li className="nav-item">Home</li>
        <li className="nav-item">New Arrivals</li>

        {/* Shop Men Dropdown */}
        <li
          className="nav-item dropdown"
          onMouseEnter={() => setActiveDropdown("shopMen")}
          onMouseLeave={closeDropdown}
        >
          <span onClick={() => handleDropdownToggle("shopMen")}>Shop Men</span>
          {activeDropdown === "shopMen" && (
            <ul className="dropdown-menu">
              <li className="dropdown-item">T-Shirts</li>
              <li className="dropdown-item">Oversized</li>
              <li className="dropdown-item">Bottom</li>
              <li className="dropdown-item">Jackets</li>
              <li className="dropdown-item">Polo</li>
            </ul>
          )}
        </li>

        {/* Collection Dropdown */}
        <li
          className="nav-item dropdown"
          onMouseEnter={() => setActiveDropdown("collection")}
          onMouseLeave={closeDropdown}
        >
          <span onClick={() => handleDropdownToggle("collection")}>Collection</span>
          {activeDropdown === "collection" && (
            <ul className="dropdown-menu">
              <li className="dropdown-item">Distress Collection</li>
              <li className="dropdown-item">Untamed Wild</li>
              <li className="dropdown-item">Festive Collection</li>
              <li className="dropdown-item">Knit Wear Collection</li>
            </ul>
          )}
        </li>

        {/* Shop Women Dropdown */}
        <li
          className="nav-item dropdown"
          onMouseEnter={() => setActiveDropdown("shopWomen")}
          onMouseLeave={closeDropdown}
        >
          <span onClick={() => handleDropdownToggle("shopWomen")}>Shop Women</span>
          {activeDropdown === "shopWomen" && (
            <ul className="dropdown-menu">
              <li className="dropdown-item">Crop Tops</li>
              <li className="dropdown-item">Sleeveless Crop Tops</li>
              <li className="dropdown-item">Cargo Pants</li>
            </ul>
          )}
        </li>

        <li className="nav-item">Contact Us</li>
      </ul>
    </div>
  );
};

export default Navbar;
