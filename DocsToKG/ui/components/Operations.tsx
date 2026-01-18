import React, { useState } from "react";
import { useTheme } from "./themes";
import { Database, Network } from "lucide-react";

const Operations: React.FC = () => {
  const { themeClasses } = useTheme();
  const [isStartingNeo4j, setIsStartingNeo4j] = useState(false);

  const handleNeo4jClick = async () => {
    setIsStartingNeo4j(true);
    try {
      const res = await fetch("/api/operations/neo4j", {
        method: "POST"
      });

      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || "Neo4j is starting...");
      } else {
        alert(data.message || "Failed to start Neo4j");
      }
    } catch (err) {
      console.error("Failed to start Neo4j:", err);
      alert("Failed to start Neo4j");
    } finally {
      setIsStartingNeo4j(false);
    }
  };

  return (
    <div className={`rounded-lg p-6 border w-full max-w-3xl mx-auto ${themeClasses.card}`}>
      <div className="space-y-6">
        <p className={themeClasses.text.secondary}>
          Quick actions for <span className={themeClasses.text.accent + " font-medium"}>Operations</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleNeo4jClick}
            disabled={isStartingNeo4j}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${themeClasses.button.primary} disabled:opacity-50`}
          >
            <Database className="h-5 w-5" />
            <span className="font-medium">{isStartingNeo4j ? "Starting..." : "Neo4j"}</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Opening LLM Graph Builder...")}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${themeClasses.button.secondary}`}
          >
            <Network className="h-5 w-5" />
            <span className="font-medium">LLM-Graph-Builder</span>
          </button>
        </div>

        <div className="text-xs text-gray-500">
          You can hook these buttons to specific workflows or pages later.
        </div>
      </div>
    </div>
  );
};

export default Operations;