export const getThemeClasses = (darkMode: boolean) => {
  return {
    // Container classes
    container: darkMode ? "bg-[#1a1a1a] text-gray-200" : "bg-white text-gray-800",
    
    // Card classes
    card: darkMode 
      ? "bg-[#121212] border-[#2a2a2a] text-gray-300" 
      : "bg-white border-gray-200 text-gray-700",
    
    // Input classes
    input: darkMode
      ? "bg-[#1a1a1a] border-[#2a2a2a] text-gray-200 focus:border-[#4fb3d9] placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-800 focus:border-blue-500 placeholder-gray-400",
    
    // Button classes
    button: {
      primary: darkMode
        ? "bg-[#4fb3d9] hover:bg-[#3da3c9] text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: darkMode
        ? "bg-[#2a2a2a] hover:bg-[#333333] text-gray-300"
        : "bg-gray-200 hover:bg-gray-300 text-gray-700",
      danger: darkMode
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "bg-red-600 hover:bg-red-700 text-white",
      outline: darkMode
        ? "border border-[#4fb3d9] text-[#4fb3d9] hover:bg-[#4fb3d9] hover:text-white"
        : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    
    // Text classes
    text: {
      primary: darkMode ? "text-gray-200" : "text-gray-800",
      secondary: darkMode ? "text-gray-300" : "text-gray-700",
      muted: darkMode ? "text-gray-500" : "text-gray-600",
      accent: darkMode ? "text-[#4fb3d9]" : "text-blue-600",
      danger: darkMode ? "text-red-400" : "text-red-600",
      success: darkMode ? "text-green-400" : "text-green-600",
    },
    
    // Border classes
    border: {
      default: darkMode ? "border-[#2a2a2a]" : "border-gray-200",
      accent: darkMode ? "border-[#4fb3d9]" : "border-blue-500",
      danger: darkMode ? "border-red-500" : "border-red-600",
      success: darkMode ? "border-green-500" : "border-green-600",
      sidebar: darkMode ? "border-[#2a2a2a]" : "border-gray-200",
    },
    
    // Background classes
    bg: {
      main: darkMode ? "bg-[#1a1a1a]" : "bg-gray-50",
      sidebar: darkMode ? "bg-[#121212]" : "bg-gray-50",
      card: darkMode ? "bg-[#121212]" : "bg-white",
      input: darkMode ? "bg-[#1a1a1a]" : "bg-white",
      hover: darkMode ? "hover:bg-[#1e1e1e]" : "hover:bg-gray-100",
      active: darkMode ? "bg-[#2a2a2a]" : "bg-blue-50",
    },
    
    // Special components
    sidebarTab: (isActive: boolean) => 
      isActive
        ? darkMode
          ? "bg-[#2a2a2a] text-[#4fb3d9] border-l-2 border-[#4fb3d9]"
          : "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
        : darkMode
          ? "text-gray-400 hover:bg-[#1e1e1e] border-l-2 border-transparent hover:text-gray-300"
          : "text-gray-600 hover:bg-gray-100 border-l-2 border-transparent hover:text-gray-900",
    
    tab: (isActive: boolean) =>
      isActive
        ? darkMode
          ? "text-[#4fb3d9] border-b-2 border-[#4fb3d9]"
          : "text-blue-600 border-b-2 border-blue-600"
        : darkMode
          ? "text-gray-400 hover:text-gray-300 hover:bg-[#1a1a1a]"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    
    // Form elements
    checkbox: darkMode
      ? "rounded border-[#2a2a2a] text-[#4fb3d9] focus:ring-[#4fb3d9]"
      : "rounded border-gray-300 text-blue-600 focus:ring-blue-500",
    
    radio: darkMode
      ? "text-[#4fb3d9] focus:ring-[#4fb3d9]"
      : "text-blue-600 focus:ring-blue-500",
    
    // Slider
    slider: darkMode
      ? "bg-[#2a2a2a] [&::-webkit-slider-thumb]:bg-[#4fb3d9] [&::-moz-range-thumb]:bg-[#4fb3d9]"
      : "bg-gray-200 [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:bg-blue-600",
    
    // File upload area
    fileUpload: darkMode
      ? "border-[#2a2a2a] hover:border-[#4fb3d9]"
      : "border-gray-300 hover:border-blue-400",
  };
};