// /api/auth/refresh.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Llamada fetch al backend FastAPI
  const response = await fetch("http://localhost:8000/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    res.status(response.status).json({ error: "No autorizado" });
    return;
  }

  res.status(200).json({ message: "Tokens refreshed" });
}
