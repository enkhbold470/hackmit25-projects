import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const characterState = await prisma.characterState.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!characterState) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: characterState.user.id,
      name: characterState.user.name,
      avatar: characterState.user.avatar,
      health: characterState.health,
      status: characterState.status,
      streak: characterState.streak,
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { health, status, streak } = body;

    const updatedCharacter = await prisma.characterState.update({
      where: { userId },
      data: {
        ...(health !== undefined && { health }),
        ...(status !== undefined && { status }),
        ...(streak !== undefined && { streak }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedCharacter.user.id,
      name: updatedCharacter.user.name,
      avatar: updatedCharacter.user.avatar,
      health: updatedCharacter.health,
      status: updatedCharacter.status,
      streak: updatedCharacter.streak,
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, avatar, health = 85, status = 'neutral', streak = 3 } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        avatar: avatar || '😊',
        characterState: {
          create: {
            health,
            status,
            streak,
          },
        },
      },
      include: {
        characterState: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      health: user.characterState!.health,
      status: user.characterState!.status,
      streak: user.characterState!.streak,
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}