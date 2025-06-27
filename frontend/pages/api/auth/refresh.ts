// /api/auth/refresh.ts
// frontend/pages/api/auth/refresh.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Llamada al backend FastAPI
  const backendRes = await fetch("/_backend/auth/refresh", {
    method: "POST",
    credentials: "include",
    // reenvía la cookie que trae el cliente
    headers: { cookie: req.headers.cookie || "" },
  });

  // Si falla, devolvemos error
  if (!backendRes.ok) {
    res.status(backendRes.status).json({ error: "No autorizado" });
    return;
  }

  // Recupera la cookie que FastAPI acaba de enviar
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    // ¡Muy importante! Propágala al navegador
    res.setHeader("Set-Cookie", setCookie);
  }

  // Y finalmente la respuesta 200
  res.status(200).json({ message: "Tokens refreshed" });
}
