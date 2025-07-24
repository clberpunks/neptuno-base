import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import Spinner from "../../shared/Spinner";
import { useTranslation } from "next-i18next";

export interface Plan {
  id: string;
  plan: "free" | "pro" | "business" | "enterprise";
  traffic_limit: number;
  domain_limit: number;
  user_limit: number;
  price: number;
  active: boolean;
  description: string;
}

export default function SubscriptionPlansPanel() {
  const { t } = useTranslation("common");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edited, setEdited] = useState<Partial<Plan>>({});
  const [error, setError] = useState<string | null>(null);
  const backendUrl = process.env.BACKEND_URL;
  const allowedFields = [
    "traffic_limit",
    "domain_limit",
    "user_limit",
    "price",
    "active",
    "description",
  ];

  const fetchPlans = async () => {
    try {
      console.log("Solicitando planes...");
      const data = await apiFetch<Plan[]>(`/rest/admin/subscription-plans/all`);
      console.log("Respuesta recibida:", data);
      setPlans(data);
    } catch (err) {
      console.error("Error:", err);
      setError(t("error_loading_plans"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const load = async () => {
      await fetchPlans();
    };
    load();
  }, [t]);

  const toggleStatus = async (id: string) => {
    await apiFetch(`/rest/admin/subscription-plans/${id}/toggle`, {
      method: "PATCH",
    });
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirm_delete_plan"))) return;
    await apiFetch(`/rest/admin/subscription-plans/${id}`, {
      method: "DELETE",
    });
    fetchPlans();
  };

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEdited(plan);
  };

  const handleSave = async () => {
    if (!editingId) return;

    const payload = Object.fromEntries(
      Object.entries(edited).filter(([key]) => allowedFields.includes(key))
    );

    await apiFetch(`/rest/admin/subscription-plans/${editingId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    setEditingId(null);
    setEdited({});
    fetchPlans();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        {t("subscription_plans_management")}
      </h2>
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr>
            <th>{t("plan")}</th>
            <th>{t("description")}</th>
            <th>{t("traffic")}</th>
            <th>{t("domains")}</th>
            <th>{t("users")}</th>
            <th>{t("price")}</th>
            <th>{t("status")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id} className={`${!p.active ? "opacity-40" : ""}`}>
              <td>{p.plan}</td>
              <td>
                {editingId === p.id ? (
                  <input
                    type="text"
                    value={edited.description ?? p.description}
                    onChange={(e) =>
                      setEdited({ ...edited, description: e.target.value })
                    }
                    className="border px-2 py-1 w-full rounded"
                  />
                ) : (
                  p.description
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    value={edited.traffic_limit ?? p.traffic_limit}
                    onChange={(e) =>
                      setEdited({ ...edited, traffic_limit: +e.target.value })
                    }
                    className="border px-2 py-1 w-24 rounded"
                  />
                ) : (
                  p.traffic_limit.toLocaleString()
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    value={edited.domain_limit ?? p.domain_limit}
                    onChange={(e) =>
                      setEdited({ ...edited, domain_limit: +e.target.value })
                    }
                    className="border px-2 py-1 w-16 rounded"
                  />
                ) : (
                  p.domain_limit
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    value={edited.user_limit ?? p.user_limit}
                    onChange={(e) =>
                      setEdited({ ...edited, user_limit: +e.target.value })
                    }
                    className="border px-2 py-1 w-16 rounded"
                  />
                ) : (
                  p.user_limit
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    value={edited.price ?? p.price}
                    onChange={(e) =>
                      setEdited({ ...edited, price: +e.target.value })
                    }
                    className="border px-2 py-1 w-16 rounded"
                  />
                ) : (
                  `$${p.price}`
                )}
              </td>
              <td>
                <span
                  className={`font-medium ${
                    p.active ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {p.active ? t("active") : t("inactive")}
                </span>
              </td>
              <td className="space-x-2">
                {editingId === p.id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-blue-600 hover:underline"
                    >
                      {t("save")}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 hover:underline"
                    >
                      {t("cancel")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-indigo-600 hover:underline"
                    >
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => toggleStatus(p.id)}
                      className="text-sm"
                    >
                      {p.active ? t("deactivate") : t("activate")}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      {t("delete")}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}