"use client";
import React, { useState, useEffect } from "react";
import { ThemeContext, ThemeContextType } from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultDarkMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultDarkMode = true 
}) => {
  const [darkMode, setDarkMode] = useState<boolean>(defaultDarkMode);

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("appTheme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const contextValue: ThemeContextType = {
    darkMode,
    toggleDarkMode,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`font-sans ${darkMode ? 'bg-[#1a1a1a] text-gray-200' : 'bg-white text-gray-800'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};