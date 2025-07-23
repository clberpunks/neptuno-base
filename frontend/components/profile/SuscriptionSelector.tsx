// frontend/components/profile/SubscriptionSelector.tsx
import { useState, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../Modal";
import Spinner from "../shared/Spinner";

interface SubscriptionPlan {
  id: string;
  plan: "free" | "pro" | "business" | "enterprise";
  traffic_limit: number;
  domain_limit: number;
  user_limit: number;
  price: number;
  active: boolean;
  description: string;
}

export default function SubscriptionSelector() {
  const { user, refresh } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(
    user?.subscription?.plan ?? "free"
  );
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SubscriptionPlan[]>("/rest/admin/subscription-plans")
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (planId: SubscriptionPlan["plan"]) => {
    if (planId === selectedPlan || updating) return;
    setUpdating(true);
    await apiFetch("/rest/user/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    setSelectedPlan(planId);
    setUpdating(false);
    // await refresh();
  };

  const launchPayment = async (endpoint: string, onSuccessMsg: string) => {
    try {
      const res = await apiFetch<{ url?: string }>(
        "/rest/payments/" + endpoint,
        { method: "POST" }
      );
      if (res.url) {
        window.location.href = res.url;
      } else {
        // PayPal devuelve toda la orden con links
        const approval = (res as any).links.find(
          (l: any) => l.rel === "approve"
        );
        if (approval) window.location.href = approval.href;
      }
    } catch (e: any) {
      setModalMsg("Error iniciando pago: " + e.message);
    }
  };

  const handleSimulate = async (provider: "stripe" | "paypal") => {
    const plan = plans.find((p) => p.plan === selectedPlan);
    if (!plan) return;
    await apiFetch("/rest/payments/dev/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        charge_id: `dev_${provider}_${Date.now()}`,
        amount: plan.price * 100,
      }),
    });
    await refresh();
    setModalMsg(
      `Pago simulado (${provider}) completado. Suscripción renovada.`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }
  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
        <h2 className="text-xl font-semibold mb-6">Planes de suscripción</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.plan === selectedPlan;
            return (
              <div
                key={plan.id}
                className={`rounded-lg border p-5 shadow-sm transition-all ${
                  isCurrent
                    ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                <h3 className="text-lg font-bold">{plan.plan}</h3>
                <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                <ul className="text-sm text-gray-700 mb-4 space-y-1">
                  <li>
                    <strong>Tráfico:</strong>{" "}
                    {plan.traffic_limit.toLocaleString()} visitas/mes
                  </li>
                  <li>
                    <strong>Dominios:</strong> {plan.domain_limit}
                  </li>
                  <li>
                    <strong>Usuarios:</strong> {plan.user_limit}
                  </li>
                  <li>
                    <strong>Precio:</strong>{" "}
                    {plan.price === 0 ? "Gratis" : `€${plan.price}/mes`}
                  </li>
                </ul>
                <button
                  disabled={updating}
                  onClick={() => handleSelect(plan.plan)}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${
                    isCurrent
                      ? "bg-indigo-600 text-white cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {isCurrent ? "Plan actual" : "Seleccionar"}
                </button>

                {isCurrent && plan.price > 0 && (
                  <div className="mt-4 space-y-2">
                    {/* {process.env.NODE_ENV !== "development" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            launchPayment(
                              "create-checkout-session",
                              "Pago Stripe completado"
                            )
                          }
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                        >
                          Pagar con tarjeta
                        </button>
                        <button
                          onClick={() =>
                            launchPayment(
                              "create-paypal-order",
                              "Pago PayPal completado"
                            )
                          }
                          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                        >
                          Pagar con PayPal
                        </button>
                      </div>
                    )}
                    {process.env.NODE_ENV === "development" && ( */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSimulate("stripe")}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                        >
                          Simular Stripe
                        </button>
                        <button
                          onClick={() => handleSimulate("paypal")}
                          className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                        >
                          Simular PayPal
                        </button>
                      </div>
                    {/* )} */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de mensajes */}
      <Modal isOpen={!!modalMsg} onClose={() => setModalMsg(null)}>
        <div className="p-6">
          <p className="text-gray-800">{modalMsg}</p>
          <button
            onClick={() => {
              setModalMsg(null);
              refresh();
            }}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            OK
          </button>
        </div>
      </Modal>
    </>
  );
}
