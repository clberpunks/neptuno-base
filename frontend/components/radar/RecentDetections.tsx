// components/radar/RecentDetections.tsx
// components/radar/RecentDetections.tsx
import { useState, useEffect } from "react";
import { Log } from "../types/radar";
import CollapsiblePanel from "../shared/CollapsiblePanel";
import { apiFetch } from "../../utils/api";
import { toast } from "react-toastify";

interface LogsResponse {
  data: Log[];
  total: number;
}

interface RecentDetectionsProps {
  initialLogs: Log[];
  totalCount: number;
}

const ITEMS_PER_PAGE = 10;

export default function RecentDetections({ initialLogs, totalCount }: RecentDetectionsProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiFetch<LogsResponse>(`/api/logs?page=${page}&limit=${ITEMS_PER_PAGE}`);
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error al cargar los registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      fetchLogs(currentPage);
    }
  }, [currentPage]);

  return (
    <CollapsiblePanel title="Detecciones Recientes" defaultExpanded loading={loading}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Fecha", "IP", "Ruta", "Agente", "Estado", "Regla"].map((h) => (
                <th key={h} className="px-4 py-2 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 truncate max-w-xs">{l.ip_address}</td>
                <td className="px-4 py-2 truncate max-w-xs">{l.path}</td>
                <td className="px-4 py-2 truncate max-w-xs">{l.user_agent}</td>
                <td className="px-4 py-2 capitalize">{l.outcome}</td>
                <td className="px-4 py-2 whitespace-nowrap">{l.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1 || loading
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} ({totalCount} total)
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages || loading
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      )}
    </CollapsiblePanel>
  );
}