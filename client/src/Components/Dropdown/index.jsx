import React, { useEffect, useRef, useState } from "react";
import styles from "./Dropdown.module.scss";

export default function Dropdown({ options = [], value, onChange, placeholder = "Select option", className = "", children }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange && onChange(option);
    setIsOpen(false);
  };

  const label = children || value || placeholder;

  return (
    <div ref={wrapperRef} className={`${styles.dropdownWrapper} ${className}`}>
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={() => setIsOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.label}>{label}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          {options.map((option) => (
            <div
              key={option}
              role="option"
              aria-selected={value === option}
              className={`${styles.dropdownItem} ${value === option ? styles.active : ""}`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
