import React from "react";
import { useTheme } from "./themes";

const Evaluation: React.FC = () => {
  const { themeClasses } = useTheme();

  return (
    <div className={`rounded-lg p-6 border w-full max-w-2xl mx-auto ${themeClasses.card}`}>
      <p className={`text-center ${themeClasses.text.secondary}`}>
        This panel represents the content area for{" "}
        <span className={themeClasses.text.accent + " font-medium"}>Evaluation</span>.
      </p>
    </div>
  );
};

export default Evaluation;