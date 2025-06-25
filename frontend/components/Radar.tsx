// frontend/components/Radar.tsx
// frontend/components/Radar.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

interface Stats { allow: number; block: number; limit: number; }
interface Log {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  path: string;
  outcome: string;
  rule: string;
}
interface Rule {
  id: string;
  llm_name: string;
  policy: string;
  limit: number | null;
  redirect_url?: string;
}

export default function Radar() {
  const [stats, setStats] = useState<Stats>({allow:0,block:0,limit:0});
  const [logs, setLogs] = useState<Log[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Stats>('/api/logs/stats'),
      apiFetch<Log[]>('/api/logs'),
      apiFetch<Rule[]>('/api/firewall'),
    ])
    .then(([s, l, r]) => {
      setStats(s);
      setLogs(l);
      setRules(r.filter(x=>x.policy==='restricted'));
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-10">Cargando datos…</p>;

  // --- 1. Pie Resumen Allow/Block/Limit ---
  const colors = ['#60a5fa','#ef4444','#f59e0b'];
  const summaryData = {
    labels: ['Allow','Block','Limit'],
    datasets: [{ data:[stats.allow,stats.block,stats.limit], backgroundColor: colors }]
  };

  // --- 2. Pie Hits por Agente ---
  const byAgent = logs.reduce<Record<string,number>>((acc, l) => {
    const a = l.user_agent.split(/[\/\s]/)[0];
    acc[a] = (acc[a]||0)+1;
    return acc;
  }, {});
  const agentLabels = Object.keys(byAgent);
  const agentData = agentLabels.map(k=>byAgent[k]);

  // --- 3. Línea de hits por hora (últimas 24h) ---
  const now = new Date();
  const hours: string[] = [];
  const hitsByHour: Record<string,number> = {};
  for(let i=23;i>=0;i--){
    const d = new Date(now.getTime() - i*3600_000);
    const label = d.getHours().toString().padStart(2,'0') + ':00';
    hours.push(label);
    hitsByHour[label] = 0;
  }
  logs.forEach(l => {
    const d = new Date(l.timestamp);
    const label = d.getHours().toString().padStart(2,'0') + ':00';
    if(hitsByHour[label]!==undefined) hitsByHour[label]++;
  });
  const lineData = {
    labels: hours,
    datasets: [{ label:'Hits/Hora', data: hours.map(h=>hitsByHour[h]), fill:false }]
  };

  // --- 4. Doughnut de consumo de límites / restante ---
  // Extraer de logs último usage por patrón
  const usageMap: Record<string,{used:number,max:number}> = {};
  logs.forEach(l => {
    if(l.rule.startsWith('limit:')){
      const m = l.rule.match(/limit:(.*?) \((\d+)\/(\d+)\)/);
      if(m){
        const pat=m[1], used=+m[2], max=+m[3];
        usageMap[pat]={used,max};
      }
    }
  });
  const limitPatterns = Object.keys(usageMap);
  const doughnutData = {
    labels: limitPatterns,
    datasets: limitPatterns.map(p=>({
      label: p,
      data: [usageMap[p].used, usageMap[p].max-usageMap[p].used],
      backgroundColor: ['#f59e0b','#e5e7eb']
    }))
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Resumen General</h3>
          <Pie data={summaryData}/>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hits por Agente</h3>
          <Pie data={{
            labels: agentLabels,
            datasets:[{ data: agentData, backgroundColor: agentLabels.map((_,i)=>colors[i%3]) }]
          }}/>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hits Últimas 24 h</h3>
          <Line data={lineData}/>
        </div>
      </div>

      {limitPatterns.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
          {limitPatterns.map((p, i) => (
            <div key={p} className="text-center">
              <h4 className="font-medium">{p}</h4>
              <Doughnut data={{
                labels: ['Usado','Restante'],
                datasets: [{ data: [usageMap[p].used, usageMap[p].max-usageMap[p].used], backgroundColor: ['#ef4444','#10b981'] }]
              }} />
              <p className="mt-2 text-sm">
                {usageMap[p].used}/{usageMap[p].max} usadas
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <h3 className="font-semibold mb-2">Detecciones Recientes</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Fecha','IP','Ruta','Agente','Estado','Regla'].map(h=>(
                <th key={h} className="px-2 py-1 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(l=>(
              <tr key={l.id} className="border-t">
                <td className="px-2 py-1">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="px-2 py-1">{l.ip_address}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.path}</td>
                <td className="px-2 py-1 truncate max-w-xs">{l.user_agent}</td>
                <td className="px-2 py-1 capitalize">{l.outcome}</td>
                <td className="px-2 py-1">{l.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
