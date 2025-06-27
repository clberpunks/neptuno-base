// pages/api/firewall.ts
import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookie = req.headers.cookie || '';
  const backend = 'http://localhost:8001/firewall/';

  if (req.method === 'GET') {
    const r = await fetch(backend, { headers: { cookie }, credentials:'include' });
    const json = await r.json();
    return res.status(r.status).json(json);
  }

  if (req.method === 'PUT') {
    const r = await fetch(backend, {
      method: 'PUT',
      body: JSON.stringify(req.body),
      headers: { 'Content-Type': 'application/json', cookie },
      credentials: 'include'
    });
    const json = await r.json();
    return res.status(r.status).json(json);
  }

  res.setHeader('Allow', ['GET','PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
