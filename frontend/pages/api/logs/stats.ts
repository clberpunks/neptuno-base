// pages/api/logs/stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch('/_backend/logs/stats', {
      credentials: 'include',
      headers: { cookie: req.headers.cookie || '' }
    });

    const json = await r.json();
    res.status(r.status).json(json);
  } catch {
    res.status(500).json({ error: 'Cannot get stats' });
  }
}
