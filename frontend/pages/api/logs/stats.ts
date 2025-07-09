// pages/api/logs/stats.ts
// pages/api/logs/stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    const r = await fetch(`${backendUrl}/logs/stats/user`, {
      credentials: 'include',
      headers: { cookie: req.headers.cookie || '' }
    });

    const json = await r.json();
    res.status(r.status).json(json);
  } catch {
    res.status(500).json({ error: 'Cannot get stats' });
  }
}