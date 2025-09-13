// app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Basic auth with client_id:secret encoded in base64
  const clientId = process.env.KNOT_CLIENT_ID as string;
  const secret = process.env.KNOT_SECRET as string;
  const KNOT_SECRET = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch('https://development.knotapi.com/transactions/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${KNOT_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  // Filter for Doordash (19) and Ubereats (36)
  const filtered = data.orders?.filter(
    (order: { merchant_id: number }) => order.merchant_id === 19 || order.merchant_id === 36
  );

  return NextResponse.json({ orders: filtered });
}