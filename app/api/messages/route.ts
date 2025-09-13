import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const messages = await prisma.gameMessage.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      message: message.message,
      type: message.type,
      timestamp: message.timestamp,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, message, type = 'info' } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    const validTypes = ['success', 'warning', 'info'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'type must be one of: success, warning, info' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.gameMessage.create({
      data: {
        userId,
        message,
        type,
      },
    });

    // Keep only the last 10 messages for this user
    const allMessages = await prisma.gameMessage.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    if (allMessages.length > 10) {
      const messagesToDelete = allMessages.slice(10);
      await prisma.gameMessage.deleteMany({
        where: {
          id: {
            in: messagesToDelete.map(msg => msg.id),
          },
        },
      });
    }

    return NextResponse.json({
      id: newMessage.id,
      message: newMessage.message,
      type: newMessage.type,
      timestamp: newMessage.timestamp,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    await prisma.gameMessage.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}