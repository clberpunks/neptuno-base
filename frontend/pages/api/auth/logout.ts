// frontend/pages/api/auth/logout.ts
// API route: elimina las cookies y redirige
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', [
    serialize('id_token', '', { path: '/', maxAge: -1 }),
    serialize('user_info', '', { path: '/', maxAge: -1 }),
  ]);
  res.status(200).json({ success: true });
}
