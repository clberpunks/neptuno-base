// pages/auth/register.tsx
// pages/auth/register.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../utils/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

interface SubscriptionPlan {
  id: string;
  plan: "free" | "pro" | "business" | "enterprise";
  traffic_limit: number;
  domain_limit: number;
  user_limit: number;
  price: number;
  active: boolean;
  description?: string; // Añadido para compatibilidad
}

export default function RegisterPage() {
  const { t } = useTranslation("common");
  const appName = process.env.NEXT_PUBLIC_APP_NAME;
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan["plan"]>("free");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Cargar planes al montar el componente
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await apiFetch<SubscriptionPlan[]>(
          "/rest/admin/subscription-plans"
        );
        setPlans(data.filter((p) => p.active)); // Solo planes activos
        setLoadingPlans(false);
      } catch (err) {
        setError(t("error_loading_plans"));
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [t]);

  const selectedPlan = plans.find((p) => p.plan === plan) || plans[0];

  // Mapear los planes a un formato más amigable para mostrar
  const getPlanDisplayInfo = (plan: SubscriptionPlan) => ({
    id: plan.id,
    name: t(plan.plan),
    priceText: plan.price === 0 ? t("free") : `$${plan.price}/mes`,
    description: plan.description,
  });

  const validateForm = () => {
    if (!name || !email || !password) {
      setError(t("all_fields_required"));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t("invalid_email"));
      return false;
    }
    if (password.length < 6) {
      setError(t("password_too_short"));
      return false;
    }
    return true;
  };

  const handleGoogleRegister = () => {
    setIsRedirecting(true);
    window.location.href = `/rest/auth/login?plan=${plan}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await apiFetch<{ token: string }>("/rest/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, plan }),
      });
      setSuccess(t("registration_success"));
      setEmail("");
      setPassword("");
      setName("");

      await refresh();
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    } catch (err) {
      setError((err as Error).message || t("registration_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t("register_title", { appName })}</title>
        <meta
          name="description"
          content={t("register_description", { appName })}
        />
      </Head>

      <div className="min-h-screen flex">
        {/* Panel izquierdo */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50">
          <div className="max-w-md w-full">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("create_account")}
              </h1>
              <p className="text-gray-600">
                {t("start_managing_services")}
              </p>
            </div>

            {/* Selector de planes 
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("select_your_plan")}
              </h2>

              {loadingPlans ? (
                <p className="text-center py-4">{t("loading_plans")}</p>
              ) : (
                <div className="flex gap-3">
                  {plans.map((p) => {
                    const planInfo = getPlanDisplayInfo(p);
                    return (
                      <div
                        key={p.id}
                        className={`flex-1 rounded-lg border p-4 cursor-pointer transition-all ${
 Plan === p.plan
                            ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50"
                            : "border-gray-200 hover:shadow-md"
                        }`}
                        onClick={() => setPlan(p.plan)}
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="font-bold text-gray-900 text-center">
                            {planInfo.name}
                          </h3>
                          <div className="text-center my-2">
                            <span className="text-xl font-bold">
                              {planInfo.priceText}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 text-center mb-3">
                            {planInfo.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )} 
            </div>
            */}

            {/* Botón de Google - Ahora antes del formulario */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={isRedirecting}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                {isRedirecting ? t("redirecting") : t("register_with_google")}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {t("or_with_email")}
                  </span>
                </div>
              </div>
              {/* Formulario de registro */}
              <form
                onSubmit={handleRegister}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                noValidate
              >
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("full_name")}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("email_address")}
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("password")}
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("registering") : t("register")}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    {t("already_have_account")}{" "}
                    <Link href="login" legacyBehavior>
                      <a className="font-medium text-indigo-600 hover:text-indigo-500">
                        {t("login")}
                      </a>
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                © 2025 {process.env.NEXT_PUBLIC_APP_NAME}. {t("all_rights_reserved")}
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Detalles del plan seleccionado */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 relative">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-white max-w-lg">
              {selectedPlan && (
                <>
                  <h2 className="text-4xl font-bold mb-4">
                    {t("plan")}{" "}
                    {t(selectedPlan.plan)}
                  </h2>
                  <div className="text-3xl font-bold mb-8">
                    {selectedPlan.price === 0 ? t("free") : `$${selectedPlan.price}/mes`}
                  </div>

                  <p className="text-xl mb-8">
                    {selectedPlan.description}
                  </p>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        <strong>{t("traffic")}:</strong>{" "}
                        {selectedPlan.traffic_limit.toLocaleString()}{" "}
                        {t("visits_per_month")}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        <strong>{t("domains")}:</strong> {selectedPlan.domain_limit}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-6 w-6 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        <strong>{t("users")}:</strong> {selectedPlan.user_limit}
                      </span>
                    </li>
                  </ul>
                </>
              )}

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">
                  {t("additional_benefits")}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("priority_support")}
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("continuous_updates")}
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-green-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("satisfaction_guarantee")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
