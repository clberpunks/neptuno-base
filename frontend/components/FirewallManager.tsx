// frontend/components/FirewallManager.tsx
import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

interface Rule {
  id?: string;
  llm_name: string;
  pattern: string;
  policy: "allow" | "block" | "restricted";
  limit?: number | null;
}

// Mapa de iconos para cada bot
const botIcons: Record<string, string> = {
  "ChatGPT": "🤖",
  "Bard": "🔮",
  "Claude": "📚",
  "Llama": "🦙",
  "GPT-4": "🧠",
  "Mistral": "🌫️",
  "Default": "💻"
};

export default function FirewallManager() {
  const { user, loading } = useAuth()
  const [rules, setRules] = useState<Rule[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && user && rules.length === 0) {
      apiFetch<Rule[]>('/api/firewall')
        .then(setRules)
        .catch(console.error)
    }
  }, [user, loading])

  const updateRule = (idx: number, updated: Partial<Rule>) => {
    setRules(rules.map((r, i) => i === idx ? { ...r, ...updated } : r))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanRules = rules.map(({ llm_name, pattern, policy, limit }) => ({
        llm_name,
        pattern,
        policy,
        limit: limit === undefined ? null : limit
      }));
      await apiFetch('/api/firewall', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanRules)
      });
      alert('Reglas actualizadas')
    } catch (e) {
      console.error(e)
      alert('Error guardando reglas')
    } finally {
      setSaving(false)
    }
  }

  // Función para obtener el color según la política
  const getPolicyColor = (policy: string) => {
    switch(policy) {
      case "allow": return "bg-green-500";
      case "block": return "bg-red-500";
      case "restricted": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Firewall LLM - Administración</h2>
          <p className="text-gray-600 mt-2">Gestiona las reglas de acceso para tus modelos de lenguaje</p>
        </div>
        <button
          className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-300 ${
            saving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          ) : 'Guardar cambios'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icono</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bot</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Política</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Configuración</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((r, idx) => (
              <tr key={r.id ?? r.llm_name+"-"+idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-gray-100 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center text-2xl">
                      {botIcons[r.llm_name] || botIcons.Default}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.llm_name}</div>
                  <div className="text-sm text-gray-500">{r.pattern}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {(["allow", "block", "restricted"] as const).map(policy => (
                      <button
                        key={policy}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          r.policy === policy 
                            ? `${getPolicyColor(policy)} text-white shadow-inner`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => updateRule(idx, { policy })}
                      >
                        {policy === "allow" && "Permitir"}
                        {policy === "block" && "Bloquear"}
                        {policy === "restricted" && "Restringido"}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {r.policy === 'restricted' && (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Límite de tokens</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={r.limit ?? 0}
                            onChange={e => updateRule(idx, { limit: parseInt(e.target.value) })}
                            className="w-48 accent-orange-500"
                          />
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            step="100"
                            value={r.limit ?? 0}
                            onChange={e => updateRule(idx, { limit: parseInt(e.target.value) || 0 })}
                            className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rules.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay reglas configuradas</h3>
          <p className="mt-1 text-gray-500">Comienza agregando nuevas reglas para tu firewall</p>
        </div>
      )}
    </div>
  )
}