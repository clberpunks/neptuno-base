// /api/auth/logout.ts
// frontend/pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', [
    serialize('jwt_token', '', { path: '/', maxAge: -1 }),
    serialize('refresh_token','', { path: '/', maxAge: -1 }),
  ]);
  res.status(200).end();
}

