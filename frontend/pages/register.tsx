// pages/auth/register.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../utils/api";

interface SubscriptionPlan {
  id: "free" | "pro" | "business";
  name: string;
  description: string;
  features: {
    traffic_limit: string;
    domain_limit: string;
    user_limit: string;
  };
  price: number; // precio anual
  priceText: string;
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
    priceText: "Gratis",
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
    price: 99, // 10€/mes * 12 meses
    priceText: "120€/año",
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
    price: 499, // 50€/mes * 12 meses
    priceText: "600€/año",
  }
];

export default function RegisterPage() {
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
  const [plan, setPlan] = useState<SubscriptionPlan["id"]>("free");

  const selectedPlan = plans.find(p => p.id === plan) || plans[0];

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("Todos los campos son obligatorios.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Correo electrónico no válido.");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const handleGoogleRegister = () => {
    setIsRedirecting(true);
    window.location.href = "/rest/auth/login";
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
      setSuccess("¡Registro exitoso! Redirigiendo al panel...");
      setEmail("");
      setPassword("");
      setName("");

      await refresh();
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    } catch (err) {
      setError((err as Error).message || "Error al registrarse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registro | {appName}</title>
        <meta
          name="description"
          content={`Crea una cuenta en ${appName} para acceder a todas tus herramientas`}
        />
      </Head>

      <div className="min-h-screen flex">
        {/* Panel izquierdo */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50">
          <div className="max-w-md w-full">
            <div className="mb-12 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Crea una cuenta
              </h1>
              <p className="text-gray-600">
                Comienza a gestionar tus servicios fácilmente
              </p>
            </div>

            <form
              onSubmit={handleRegister}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
              noValidate
            >
              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm"
                >
                  {success}
                </div>
              )}
              
              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={isRedirecting}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mb-6"
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
                {isRedirecting ? "Redirigiendo..." : "Regístrate con Google"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    O regístrate con tu correo
                  </span>
                </div>
              </div>

              {/* Selector de planes - 3 en fila */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Plan de suscripción
                </label>
                <div className="flex flex-wrap gap-4">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className={`flex-1 min-w-[120px] rounded-lg border p-4 cursor-pointer transition-all ${
                        plan === p.id
                          ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50"
                          : "border-gray-200 hover:shadow-md"
                      }`}
                      onClick={() => setPlan(p.id)}
                    >
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900">{p.name}</h3>
                          <span className="font-semibold text-sm">
                            {p.priceText}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
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
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Registrarse"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="login" legacyBehavior>
                    <a className="font-medium text-indigo-600 hover:text-indigo-500">
                      Inicia sesión
                    </a>
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                © 2025 {process.env.NEXT_PUBLIC_APP_NAME}. Todos los derechos
                reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Detalles del plan seleccionado */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 relative">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-white max-w-lg">
              <h2 className="text-4xl font-bold mb-4">
                Plan {selectedPlan.name}
              </h2>
              <div className="text-3xl font-bold mb-8">
                {selectedPlan.priceText}
              </div>
              
              <p className="text-xl mb-8">
                {selectedPlan.description}
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Tráfico:</strong> {selectedPlan.features.traffic_limit}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Dominios:</strong> {selectedPlan.features.domain_limit}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    <strong>Usuarios:</strong> {selectedPlan.features.user_limit}
                  </span>
                </li>
              </ul>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Beneficios adicionales</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Actualizaciones continuas
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Garantía de satisfacción
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