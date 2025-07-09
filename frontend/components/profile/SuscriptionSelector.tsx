// frontend/components/profile/SubscriptionSelector.tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

interface SubscriptionPlan {
  id: string;
  plan: "free" | "pro" | "business" | "enterprise";
  traffic_limit: number;
  domain_limit: number;
  user_limit: number;
  price: number;
  active: boolean;
  description: string; // ← NUEVO
}


export default function SubscriptionSelector() {
  const { user, refresh } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const currentPlanId = user?.subscription?.plan ?? "free";

  useEffect(() => {
    apiFetch<SubscriptionPlan[]>("/rest/admin/subscription-plans")
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (plan: string) => {
    if (plan === currentPlanId || updating) return;
    setUpdating(true);
    await apiFetch("/rest/user/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    await refresh();
    setUpdating(false);
  };

  if (loading) return <p className="text-sm">Cargando planes...</p>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h2 className="text-xl font-semibold mb-6">Planes de suscripción</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.plan === currentPlanId;
          const isEnterprise = plan.plan === "enterprise";

          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-5 shadow-sm transition-all ${
                isCurrent
                  ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.plan}</h3>
              <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
              <ul className="text-sm text-gray-700 mb-4 space-y-1">
                <li><strong>Tráfico:</strong> {plan.traffic_limit.toLocaleString()} visitas/mes</li>
                <li><strong>Dominios:</strong> {plan.domain_limit}</li>
                <li><strong>Usuarios:</strong> {plan.user_limit}</li>
                <li><strong>Precio:</strong> {plan.price === 0 ? "Gratis" : `€${plan.price}/mes`}</li>
              </ul>

              {isEnterprise ? (
                <a href="/contact" className="block text-center text-indigo-700 font-medium text-sm underline">
                  Contactar ventas
                </a>
              ) : (
                <button
                  disabled={updating || isCurrent}
                  onClick={() => handleChange(plan.plan)}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${
                    isCurrent
                      ? "bg-indigo-600 text-white cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {isCurrent ? "Plan actual" : "Seleccionar"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
