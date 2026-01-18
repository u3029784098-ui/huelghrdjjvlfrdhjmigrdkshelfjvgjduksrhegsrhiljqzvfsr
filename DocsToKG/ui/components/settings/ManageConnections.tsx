import React, { useState, useEffect } from "react";
import { useTheme } from "../themes";

interface ManageConnectionsProps {
  onSettingsSaved?: () => void;
}

const ManageConnections: React.FC<ManageConnectionsProps> = ({ onSettingsSaved }) => {
  const { themeClasses } = useTheme();
  
  const [uri, setUri] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("neo4j");
  const [isAuraDB, setIsAuraDB] = useState(false);
  const [uriError, setUriError] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadNeo4jSettings();
  }, []);

  const loadNeo4jSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setUri(data.settings.neo_4j_uri || "");
          setUsername(data.settings.neo4j_username || "");
          setPassword(data.settings.neo4j_password || "");
          setDatabase(data.settings.neo4j_database || "neo4j");
          setIsAuraDB(data.settings.neo4j_auradb || false);
        }
      }
    } catch (err) {
      console.error("Failed to load Neo4j settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateUri = (value: string) => {
    const uriPattern = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/;
    if (!value) {
      setUriError("");
      return true;
    }
    if (!uriPattern.test(value)) {
      setUriError("URI must follow the format: protocol://url");
      return false;
    }
    setUriError("");
    return true;
  };

  const handleUriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUri(value);
    validateUri(value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== "string") return;

      const lines = content.split("\n");
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("#") || !trimmed) return;

        if (trimmed.startsWith("NEO4J_URI=")) {
          const value = trimmed.substring("NEO4J_URI=".length);
          setUri(value);
          validateUri(value);
        } else if (trimmed.startsWith("NEO4J_USERNAME=")) {
          setUsername(trimmed.substring("NEO4J_USERNAME=".length));
        } else if (trimmed.startsWith("NEO4J_PASSWORD=")) {
          setPassword(trimmed.substring("NEO4J_PASSWORD=".length));
        } else if (trimmed.startsWith("NEO4J_DATABASE=")) {
          setDatabase(trimmed.substring("NEO4J_DATABASE=".length));
        } else if (trimmed.startsWith("AURA_INSTANCEID=")) {
          setIsAuraDB(true);
        }
      });
    };
    reader.readAsText(file);
  };

  const handleConnect = async () => {
    if (!validateUri(uri)) {
      return;
    }
    if (!uri || !username || !password || !database) {
      alert("Please fill in all required fields");
      return;
    }

    setConnecting(true);
    try {
      const res = await fetch("/api/settings/neo4j", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uri,
          username,
          password,
          database,
          isAuraDB
        })
      });

      if (res.ok) {
        alert("Neo4j connection settings saved successfully!");
        if (onSettingsSaved) {
          onSettingsSaved();
        }
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save Neo4j connection");
      }
    } catch (err) {
      console.error("Failed to connect:", err);
      alert("Failed to save Neo4j connection");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4fb3d9]"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-8 border w-full max-w-2xl mx-auto ${themeClasses.card}`}>
      <h2 className={`text-lg font-semibold mb-6 text-center ${themeClasses.text.primary}`}>
        Connect to Neo4j
      </h2>
      
      <div className="space-y-4">
        {/* URI Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            URI <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={uri}
            onChange={handleUriChange}
            placeholder="neo4j+s://example.databases.neo4j.io"
            className={`w-full px-3 py-2 rounded border outline-none transition-colors ${
              uriError
                ? 'border-red-500 focus:border-red-600'
                : themeClasses.input
            }`}
          />
          {uriError && (
            <p className="text-red-500 text-xs mt-1">{uriError}</p>
          )}
          <p className={`text-xs mt-1 ${themeClasses.text.muted}`}>
            Format: protocol://url (e.g., neo4j+s://, bolt://, neo4j://)
          </p>
        </div>

        {/* Username Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="neo4j"
            className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
          />
        </div>

        {/* Password Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
          />
        </div>

        {/* Database Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Database <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            placeholder="neo4j"
            className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
          />
        </div>

        {/* AuraDB Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auradb"
            checked={isAuraDB}
            onChange={(e) => setIsAuraDB(e.target.checked)}
            className={`w-4 h-4 rounded ${themeClasses.checkbox}`}
          />
          <label htmlFor="auradb" className={`text-sm ${themeClasses.text.secondary}`}>
            AuraDB Instance
          </label>
        </div>

        {/* File Upload */}
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${themeClasses.fileUpload}`}>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            id="connection-file"
          />
          <label htmlFor="connection-file" className="cursor-pointer">
            <div className={`text-sm ${themeClasses.text.muted}`}>
              <p className="mb-2">Upload connection file (.txt)</p>
              <p className="text-xs">Click to browse or drag and drop</p>
            </div>
          </label>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={connecting}
          className={`w-full font-medium py-2 px-4 rounded transition-colors ${themeClasses.button.primary} disabled:opacity-50`}
        >
          {connecting ? "Connecting..." : "Connect to Neo4j"}
        </button>
      </div>
    </div>
  );
};

export default ManageConnections;