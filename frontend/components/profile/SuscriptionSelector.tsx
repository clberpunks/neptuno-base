import { useState } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";

interface SubscriptionPlan {
  id: "free" | "pro" | "business" | "enterprise";
  name: string;
  description: string;
  features: {
    traffic_limit: string;
    domain_limit: string;
    user_limit: string;
  };
  price: number; // Nuevo campo
}

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Ideal para comenzar",
    features: {
      traffic_limit: "10.000 visitas/mes",
      domain_limit: "1 dominio",
      user_limit: "1 usuario",
    },
    price: 0,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para proyectos en crecimiento",
    features: {
      traffic_limit: "100.000 visitas/mes",
      domain_limit: "5 dominios",
      user_limit: "5 usuarios",
    },
    price: 10,
  },
  {
    id: "business",
    name: "Business",
    description: "Uso avanzado y equipos medianos",
    features: {
      traffic_limit: "1 millón de visitas/mes",
      domain_limit: "10 dominios",
      user_limit: "10 usuarios",
    },
    price: 50,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Solución personalizada para grandes organizaciones",
    features: {
      traffic_limit: "10M+ visitas/mes",
      domain_limit: "Ilimitado",
      user_limit: "Ilimitado",
    },
    price: 200,
  },
];

export default function SubscriptionSelector() {
  const { user, refresh } = useAuth();
  const [updating, setUpdating] = useState(false);

  const currentPlanId = user?.subscription?.plan ?? "free";

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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h2 className="text-xl font-semibold mb-6">Planes de suscripción</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isEnterprise = plan.id === "enterprise";

          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-5 shadow-sm transition-all ${
                isCurrent
                  ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50"
                  : "border-gray-200 hover:shadow-md"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <ul className="text-sm text-gray-700 mb-4 space-y-1">
                <li>
                  <strong>Tráfico:</strong> {plan.features.traffic_limit}
                </li>
                <li>
                  <strong>Dominios:</strong> {plan.features.domain_limit}
                </li>
                <li>
                  <strong>Usuarios:</strong> {plan.features.user_limit}
                </li>
                <li>
                  <strong>Precio:</strong> {plan.price === 0 ? "Gratis" : `€${plan.price}/mes`}
                </li>
              </ul>

              {isEnterprise ? (
                <a
                  href="/contact"
                  className="block text-center text-indigo-700 font-medium text-sm underline"
                >
                  Contactar ventas
                </a>
              ) : (
                <button
                  disabled={updating || isCurrent}
                  onClick={() => handleChange(plan.id)}
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
