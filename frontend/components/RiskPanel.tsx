import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function RiskPanel() {
  const [blockRate, setBlockRate] = useState(0);
  const [spikeAlert, setSpikeAlert] = useState(false);

  useEffect(() => {
    apiFetch("/api/logs/stats").then((data: { allow: number; block: number; limit: number }) => {
      const total = data.allow + data.block + data.limit;
      const rate = total > 0 ? (data.block / total) * 100 : 0;
      setBlockRate(rate);
      setSpikeAlert(rate > 50); // threshold de riesgo
    });
  }, []);

  return (
    <div className={`p-4 rounded-lg shadow-md ${spikeAlert ? 'bg-red-100' : 'bg-green-100'}`}>
      <h3 className="text-lg font-semibold mb-2">Nivel de Riesgo</h3>
      <p>
        Porcentaje de bloqueos: <strong>{blockRate.toFixed(1)}%</strong>
      </p>
      {spikeAlert ? (
        <p className="text-red-600 font-bold mt-2">¡Actividad sospechosa elevada!</p>
      ) : (
        <p className="text-green-700">Todo bajo control.</p>
      )}
    </div>
  );
}
