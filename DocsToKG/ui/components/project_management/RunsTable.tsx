"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { useTheme } from "../themes";

interface DocumentExtraction {
  docId: string;
  documentName: string;
  extractions: {
    text: boolean;
    metadata: boolean;
    figures: boolean;
    tables: boolean;
    formulas: boolean;
  };
}

interface Run {
  id: number;
  extractedData: string[];
  completion: number;
  documentCount: number;
  isExecuted: boolean;
  createdAt: string;
  taskStates: {
    metadata: number;
    text: number;
    figures: number;
    tables: number;
    formulas: number;
  };
}

interface RunsTableProps {
  projectName: string;
}

const RunsTable: React.FC<RunsTableProps> = ({ projectName }) => {
  const { themeClasses } = useTheme();
  const [runs, setRuns] = useState<Run[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Record<number, DocumentExtraction[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchRuns();
  }, [projectName]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/runs`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (runId: number) => {
    if (documents[runId]) return; // Already loaded

    try {
      setLoadingDocs(prev => ({ ...prev, [runId]: true }));
      const res = await fetch(
        `/api/projects/${encodeURIComponent(projectName)}/runs/${runId}/documents`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setDocuments(prev => ({ ...prev, [runId]: data.documents || [] }));
      }
    } catch (err) {
      console.error(`Failed to fetch documents for run ${runId}:`, err);
    } finally {
      setLoadingDocs(prev => ({ ...prev, [runId]: false }));
    }
  };

  const toggleRunExpanded = (runId: number) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
    } else {
      setExpandedRunId(runId);
      fetchDocuments(runId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading runs...</div>;
  }

  if (runs.length === 0) {
    return (
      <div className={`text-center py-12 rounded-lg ${themeClasses.bg.hover}`}>
        <p className="text-gray-500">No runs found for this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${themeClasses.border.default}`}>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-8"></th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Run ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Extracted Data</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Completion</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Documents</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <React.Fragment key={run.id}>
                {/* Main run row */}
                <tr
                  className={`border-b ${themeClasses.border.default} hover:${themeClasses.bg.hover} cursor-pointer`}
                  onClick={() => toggleRunExpanded(run.id)}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRunExpanded(run.id);
                      }}
                      className="p-1"
                    >
                      {expandedRunId === run.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">#{run.id}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {run.extractedData.length > 0 ? (
                        run.extractedData.map(type => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">No data</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${run.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-10 text-right">
                        {Math.round(run.completion)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{run.documentCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(run.createdAt)}
                  </td>
                </tr>

                {/* Expanded documents table */}
                {expandedRunId === run.id && (
                  <tr className={`${themeClasses.bg.hover}`}>
                    <td colSpan={6} className="px-4 py-4">
                      {loadingDocs[run.id] ? (
                        <div className="text-center py-4">Loading documents...</div>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">Documents in this run</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={`border-b ${themeClasses.border.default}`}>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                                    Document
                                  </th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                    Text
                                  </th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                    Figures
                                  </th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                    Metadata
                                  </th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                    Tables
                                  </th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">
                                    Formulas
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {documents[run.id]?.map((doc) => (
                                  <tr
                                    key={doc.docId}
                                    className={`border-b ${themeClasses.border.default}`}
                                  >
                                    <td className="px-3 py-2 text-xs font-mono text-gray-700 truncate max-w-xs">
                                      {doc.documentName}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {doc.extractions.text ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {doc.extractions.figures ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {doc.extractions.metadata ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {doc.extractions.tables ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      {doc.extractions.formulas ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RunsTable;
