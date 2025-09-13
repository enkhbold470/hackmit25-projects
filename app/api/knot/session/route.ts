import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { merchantId, userId } = body;

  if (!merchantId) {
    return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const clientId = process.env.KNOT_CLIENT_ID;
  const secret = process.env.KNOT_SECRET;

  if (!clientId || !secret) {
    return NextResponse.json({ error: 'KnotAPI credentials not configured' }, { status: 500 });
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
    console.log('Creating session for merchant ID:', merchantId);
    console.log('Using client ID:', clientId);

    const response = await fetch('https://development.knotapi.com/session/create', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'transaction_link',
        merchant_ids: [merchantId],
        external_user_id: userId
      }),
    });

    console.log('KnotAPI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('KnotAPI session creation failed:', response.status, errorText);
      return NextResponse.json({
        error: `KnotAPI session creation failed: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Session created successfully:', data);

    return NextResponse.json({
      sessionId: data.session,
      merchantId
    });
  } catch (error) {
    console.error('Error creating KnotAPI session:', error);
    return NextResponse.json({
      error: 'Failed to create KnotAPI session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}