// frontend/components/Firewall.tsx
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface Rule {
  id?: string;
  llm_name: string;
  pattern: string;
  policy: "allow" | "block" | "restricted" | "redirect";
  limit?: number | null;
  redirect_url?: string;
}

export default function Firewall() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Rule[]>("/api/firewall").then(setRules);
  }, []);

  function updateRule<K extends keyof Rule>(i: number, field: K, value: Rule[K]) {
    const newRules = [...rules];
    newRules[i][field] = value;
    setRules(newRules);
  }

  function addRule() {
    setRules([...rules, { llm_name: "", pattern: "", policy: "allow" }]);
  }

  async function save() {
    setSaving(true);
    await apiFetch("/api/firewall", {
      method: "PUT",
      body: JSON.stringify(rules),
      headers: { "Content-Type": "application/json" }
    });
    setSaving(false);
  }

  return (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Gestión de reglas de acceso</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th>Nombre</th><th>Patrón</th><th>Política</th><th>Límite</th><th>Redirección</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r, i) => (
            <tr key={i}>
              <td><input className="input" value={r.llm_name} onChange={e => updateRule(i, 'llm_name', e.target.value)} /></td>
              <td><input className="input" value={r.pattern} onChange={e => updateRule(i, 'pattern', e.target.value)} /></td>
              <td>
                <select value={r.policy} onChange={e => updateRule(i, 'policy', e.target.value as Rule["policy"])}>
                  <option value="allow">allow</option>
                  <option value="block">block</option>
                  <option value="restricted">restricted</option>
                  <option value="redirect">redirect</option>
                </select>
              </td>
              <td><input type="number" className="input" value={r.limit || ""} onChange={e => updateRule(i, 'limit', Number(e.target.value))} /></td>
              <td><input className="input" value={r.redirect_url || ""} onChange={e => updateRule(i, 'redirect_url', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 space-x-2">
        <button onClick={addRule} className="btn">+ Añadir</button>
        <button onClick={save} className="btn bg-indigo-600 text-white">{saving ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </div>
  );
}
