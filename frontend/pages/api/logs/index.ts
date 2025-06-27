// pages/api/logs/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${BACKEND_URL}/logs`, {
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.cookie || '', // pasar cookies si hay sesión
      },
      credentials: 'include',
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}
