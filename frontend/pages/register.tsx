// pages/auth/register.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        body: JSON.stringify({ email, name, password }),
      });
      setSuccess("¡Registro exitoso! Redirigiendo al panel...");
      setEmail("");
      setPassword("");
      setName("");

      await refresh();
      // Mostrar el mensaje de éxito y redirigir tras 2 segundos
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
        <title>Registro | MyApp</title>
        <meta
          name="description"
          content="Crea una cuenta en MyApp para acceder a todas tus herramientas"
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
                  <Link href="/login" legacyBehavior>
                    <a className="font-medium text-indigo-600 hover:text-indigo-500">
                      Inicia sesión
                    </a>
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>© 2025 MyApp. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 relative">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-white max-w-lg">
              <h2 className="text-4xl font-bold mb-4">
                Únete a la revolución digital
              </h2>
              <p className="text-xl mb-8">
                Accede a todas tus herramientas desde una única plataforma
                eficiente y segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
