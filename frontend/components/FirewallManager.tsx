// frontend/components/FirewallManager.tsx
import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'
import { useAuth } from '../hooks/useAuth' // autenticación

interface Rule {
  id?: string;
  llm_name: string;
  pattern: string;
  policy: "allow" | "block" | "restricted" | "redirect";
  limit?: number | null;
  redirect_url?: string;
}


export default function FirewallManager() {
  const { user, loading } = useAuth()
  const [rules, setRules] = useState<Rule[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && user) {
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
      // Limpiar reglas para enviar solo los campos esperados por el backend
      const cleanRules = rules.map(({ llm_name, pattern, policy, limit, redirect_url }) => ({
        llm_name,
        pattern,
        policy,
        limit: limit === undefined ? null : limit,
        redirect_url: redirect_url || null
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Firewall LLM – Administración</h2>
      {rules.map((r, idx) => (
        <div key={r.id} className="flex items-center space-x-4 border-b py-2">
          <div className="w-48 font-medium">{r.llm_name}</div>
          <select
            className="border rounded px-2 py-1"
            value={r.policy}
            onChange={e => updateRule(idx, { policy: e.target.value as any })}
          >
            <option value="allow">Allow</option>
            <option value="block">Block</option>
            <option value="restricted">Restricted</option>
          </select>
          {r.policy === 'restricted' && (
            <>
              <input
                type="number"
                className="border rounded px-2 py-1 w-24"
                value={r.limit ?? ''}
                onChange={e =>
                  updateRule(idx, { limit: parseInt(e.target.value, 10) || 0 })
                }
              />
              <input
                type="text"
                placeholder="Redirección (URL)"
                className="border rounded px-2 py-1 flex-1"
                value={r.redirect_url ?? ''}
                onChange={e =>
                  updateRule(idx, { redirect_url: e.target.value })
                }
              />
            </>
          )}
          <div className="flex-1" />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
            onClick={() => updateRule(idx, { policy: r.policy })}
          >
            Edit
          </button>
        </div>
      ))}
      <div className="text-right">
        <button
          className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
