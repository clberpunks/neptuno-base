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
    
    const response = await fetch('/api/firewall', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanRules)
    });
    
    // Manejar respuesta no JSON
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error ${response.status}`);
    }
    
    // Intentar parsear solo si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      await response.json();
    }
    
    alert('Reglas actualizadas')
  } catch (e) {
    console.error('Error saving rules:', e)
    alert(`Error guardando reglas: ${e instanceof Error ? e.message : 'Error desconocido'}`)
  } finally {
    setSaving(false)
  }
}
  // Calcular estadísticas
  const blockedCount = rules.filter(r => r.policy === "block").length;
  const allowedCount = rules.filter(r => r.policy === "allow").length;
  const restrictedCount = rules.filter(r => r.policy === "restricted").length;
  const totalRules = rules.length;
  const totalTokens = rules
    .filter(r => r.policy === "restricted" && r.limit)
    .reduce((acc, r) => acc + (r.limit || 0), 0);

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

      {/* Bloque de estadísticas KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Permitidos */}
        <div className="bg-gradient-to-br from-green-100 to-green-50 border border-green-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-800">{allowedCount}</div>
              <div className="text-sm font-medium text-green-600">Permitidos</div>
            </div>
          </div>
        </div>

        {/* Bloqueados */}
        <div className="bg-gradient-to-br from-red-100 to-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-red-800">{blockedCount}</div>
              <div className="text-sm font-medium text-red-600">Bloqueados</div>
            </div>
          </div>
        </div>

        {/* Restringidos */}
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-800">{restrictedCount}</div>
              <div className="text-sm font-medium text-orange-600">Restringidos</div>
            </div>
          </div>
        </div>

        {/* Reglas aplicadas */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-blue-800">{totalRules}</div>
              <div className="text-sm font-medium text-blue-600">Reglas aplicadas</div>
            </div>
          </div>
        </div>

        {/* Tokens permitidos */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-purple-800">{totalTokens.toLocaleString()}</div>
              <div className="text-sm font-medium text-purple-600">Tokens permitidos</div>
            </div>
          </div>
        </div>
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
                            ? `${policy === "allow" ? "bg-green-500" : policy === "block" ? "bg-red-500" : "bg-orange-500"} text-white shadow-inner`
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