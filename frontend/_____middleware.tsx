// frontend/middleware.tsx
// middleware to handle authentication and public routes in a Next.js application
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define las rutas públicas que no requieren autenticación
const PUBLIC_PATHS = [
  /^\/$/, 
  /^\/auth\/.*/,
  /^\/api\/.*/,
  /^\/_next\/.*/,
  /^\/favicon\.ico$/,
  /^\/fonts\/.*/,
  /^\/images\/.*/,
  /^\/.*\.png$/,
  /^\/.*\.jpg$/,
  /^\/.*\.jpeg$/,
  /^\/.*\.svg$/,
  /^\/.*\.webp$/,
  /^\/.*\.ico$/,
  /^\/.*\.gif$/
];

export function middleware(request: NextRequest) {
  console.info(`[middleware] Triggered for: ${request.nextUrl.pathname}`);

  const { pathname } = request.nextUrl;

  // Excluir rutas públicas y recursos de imagen
  if (PUBLIC_PATHS.some(path => path.test(pathname))) {
    return NextResponse.next();
  }

  // Aquí va tu lógica de autenticación, cookies, etc.
  const token = request.cookies.get("jwt_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
