// app/api/orders/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch('https://knot.tunnel.tel/transactions/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${process.env.KNOT_API_KEY}`,
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