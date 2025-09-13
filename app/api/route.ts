// app/api/route.ts - KnotAPI integration with game state sync
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { userId } = body; // Expect userId to be passed for game state updates

  // Basic auth with client_id:secret encoded in base64
  const clientId = process.env.KNOT_CLIENT_ID as string;
  const secret = process.env.KNOT_SECRET as string;
  const KNOT_SECRET = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
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
    const foodDeliveryOrders = data.orders?.filter(
      (order: { merchant_id: number }) => order.merchant_id === 19 || order.merchant_id === 36
    ) || [];

    // If userId provided and there are new food delivery orders, update game state
    if (userId && foodDeliveryOrders.length > 0) {
      // Get the most recent order to trigger game state changes
      const recentOrder = foodDeliveryOrders[0];

      // Update character state for food delivery orders
      const characterState = await prisma.characterState.findUnique({
        where: { userId },
      });

      if (characterState) {
        // Each food delivery order impacts the game
        const ordersCount = foodDeliveryOrders.length;
        const healthReduction = Math.min(ordersCount * 10, characterState.health);
        const newHealth = Math.max(characterState.health - healthReduction, 0);

        await prisma.characterState.update({
          where: { userId },
          data: {
            health: newHealth,
            status: newHealth < 50 ? 'weakened' : 'neutral',
            streak: 0, // Reset streak when food is ordered
          },
        });

        // Add message about the order impact
        if (recentOrder) {
          const merchantName = recentOrder.merchant_id === 19 ? 'DoorDash' : 'UberEats';
          await prisma.gameMessage.create({
            data: {
              userId,
              message: `${ordersCount > 1 ? `${ordersCount} orders` : 'New order'} detected from ${merchantName}. Character weakened!`,
              type: 'warning',
            },
          });
        }

        // Update team status if user is in a team
        const teamMember = await prisma.teamMember.findFirst({
          where: { userId },
          include: { team: true },
        });

        if (teamMember) {
          await prisma.teamMember.update({
            where: { id: teamMember.id },
            data: { status: newHealth < 50 ? 'weakened' : 'neutral' },
          });

          // Reduce team power
          const powerReduction = ordersCount * 5;
          const newTeamPower = Math.max(teamMember.team.power - powerReduction, 0);
          await prisma.team.update({
            where: { id: teamMember.team.id },
            data: { power: newTeamPower },
          });
        }
      }
    }

    return NextResponse.json({
      orders: foodDeliveryOrders,
      gameImpact: userId && foodDeliveryOrders.length > 0 ? {
        ordersDetected: foodDeliveryOrders.length,
        characterImpacted: true,
        healthReduction: Math.min(foodDeliveryOrders.length * 10, 100),
        streakReset: true,
      } : null
    });
  } catch (error) {
    console.error('Error syncing with KnotAPI:', error);
    return NextResponse.json({ error: 'Failed to sync with KnotAPI' }, { status: 500 });
  }
}