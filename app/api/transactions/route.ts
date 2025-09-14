import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // If userId provided, get user-specific transaction view
    if (userId) {
      // Get orders from the database that could be treated as "transactions"
      const orders = await prisma.order.findMany({
        orderBy: { dateTime: 'desc' },
        take: limit,
        include: {
          orderProducts: {
            include: {
              product: true,
            },
          },
        },
      });

      const formattedTransactions = orders.map(order => {
        // Get restaurant name from the first product (simplified approach)
        const firstProduct = order.orderProducts[0]?.product;
        const restaurant = firstProduct ? firstProduct.name.split(' - ')[0] || firstProduct.name.split(' ')[0] || 'Unknown Restaurant' : 'Unknown Restaurant';

        // Determine merchant based on URL pattern and order data
        let merchantId = null;
        let merchantName = 'Unknown';

        // Check URL patterns first for most reliable detection
        if (order.url.includes('doordash.com')) {
          merchantId = 19;
          merchantName = 'DoorDash';
        } else if (order.url.includes('ubereats.com')) {
          merchantId = 36;
          merchantName = 'UberEats';
        } else if (firstProduct) {
          // Fallback to product name patterns
          if (firstProduct.name.toLowerCase().includes('doordash') || firstProduct.url.includes('doordash')) {
            merchantId = 19;
            merchantName = 'DoorDash';
          } else if (firstProduct.name.toLowerCase().includes('uber') || firstProduct.url.includes('uber')) {
            merchantId = 36;
            merchantName = 'UberEats';
          }
        }

        return {
          id: order.id,
          restaurant,
          amount: order.total,
          date: order.dateTime,
          status: order.orderStatus,
          externalId: order.externalId,
          merchantId,
          merchantName,
        };
      });

      return NextResponse.json({ transactions: formattedTransactions });
    }

    // General transaction endpoint - return recent orders
    const orders = await prisma.order.findMany({
      orderBy: { dateTime: 'desc' },
      take: limit,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, restaurant, amount } = body;

    if (!userId || !restaurant || !amount) {
      return NextResponse.json(
        { error: 'userId, restaurant, and amount are required' },
        { status: 400 }
      );
    }

    // When a new transaction is added, we need to:
    // 1. Update character health and status
    // 2. Reset streak to 0
    // 3. Update team power
    // 4. Add a warning message

    // Update character state
    const characterState = await prisma.characterState.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (characterState) {
      // Reduce health by 10, minimum 0
      const newHealth = Math.max(characterState.health - 10, 0);

      await prisma.characterState.update({
        where: { userId },
        data: {
          health: newHealth,
          status: 'weakened',
          streak: 0,
        },
      });

      // Add warning message
      await prisma.gameMessage.create({
        data: {
          userId,
          message: `You ordered from ${restaurant}. Your character is weakened!`,
          type: 'warning',
        },
      });

      // Update team power if user is in a team
      const teamMember = await prisma.teamMember.findFirst({
        where: { userId },
        include: { team: true },
      });

      if (teamMember) {
        // Update member status to weakened
        await prisma.teamMember.update({
          where: { id: teamMember.id },
          data: { status: 'weakened' },
        });

        // Reduce team power by 5, minimum 0
        const newTeamPower = Math.max(teamMember.team.power - 5, 0);
        await prisma.team.update({
          where: { id: teamMember.team.id },
          data: { power: newTeamPower },
        });
      }
    }

    // Create a simple transaction record (you might want to integrate this with the Order model)
    const transaction = await prisma.transaction.create({
      data: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
        direction: 'outgoing',
        source: restaurant,
        metadata: { userId, type: 'food_delivery' },
      },
    });

    return NextResponse.json({
      id: transaction.id,
      restaurant,
      amount,
      date: transaction.timestamp,
      impact: {
        healthReduction: 10,
        statusChange: 'weakened',
        streakReset: true,
        teamPowerReduction: 5,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}