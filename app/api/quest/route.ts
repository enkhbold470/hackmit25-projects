import { NextResponse } from 'next/server';
import { PrismaClient, Quest } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questId = searchParams.get('questId');
  const teamId = searchParams.get('teamId');

  if (!questId && !teamId) {
    return NextResponse.json({ error: 'questId or teamId is required' }, { status: 400 });
  }

  try {
    const quest = await prisma.quest.findFirst({
      where: questId ? { id: questId } : { team: { id: teamId as string } },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            power: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    const now = new Date();
    const timeRemaining = quest.endDate.getTime() - now.getTime();
    const isActive = timeRemaining > 0 && quest.status === 'active';

    const formattedTeamMembers = quest.team?.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      status: member.status,
    })) || [];

    return NextResponse.json({
      id: quest.id,
      name: quest.name,
      startDate: quest.startDate,
      endDate: quest.endDate,
      status: quest.status,
      result: quest.result,
      isActive,
      timeRemaining: Math.max(0, timeRemaining),
      team: quest.team ? {
        id: quest.team.id,
        name: quest.team.name,
        power: quest.team.power,
        members: formattedTeamMembers,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const questId = searchParams.get('questId');

  if (!questId) {
    return NextResponse.json({ error: 'questId is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, result, endDate } = body;

    const updateData: Partial<Quest> = {};
    if (status !== undefined) updateData.status = status;
    if (result !== undefined) updateData.result = result;
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    const updatedQuest = await prisma.quest.update({
      where: { id: questId },
      data: updateData,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            power: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const timeRemaining = updatedQuest.endDate.getTime() - now.getTime();
    const isActive = timeRemaining > 0 && updatedQuest.status === 'active';

    const formattedTeamMembers = updatedQuest.team?.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      status: member.status,
    })) || [];

    return NextResponse.json({
      id: updatedQuest.id,
      name: updatedQuest.name,
      startDate: updatedQuest.startDate,
      endDate: updatedQuest.endDate,
      status: updatedQuest.status,
      result: updatedQuest.result,
      isActive,
      timeRemaining: Math.max(0, timeRemaining),
      team: updatedQuest.team ? {
        id: updatedQuest.team.id,
        name: updatedQuest.team.name,
        power: updatedQuest.team.power,
        members: formattedTeamMembers,
      } : null,
    });
  } catch (error) {
    console.error('Error updating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name = 'Defeat the Takeout Titan', endDate, teamId } = body;

    if (!endDate) {
      return NextResponse.json({ error: 'endDate is required' }, { status: 400 });
    }

    const quest = await prisma.quest.create({
      data: {
        name,
        endDate: new Date(endDate),
      },
    });

    // If teamId provided, link the quest to the team
    if (teamId) {
      await prisma.team.update({
        where: { id: teamId },
        data: { questId: quest.id },
      });
    }

    const createdQuest = await prisma.quest.findUnique({
      where: { id: quest.id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            power: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const timeRemaining = createdQuest!.endDate.getTime() - now.getTime();
    const isActive = timeRemaining > 0 && createdQuest!.status === 'active';

    const formattedTeamMembers = createdQuest!.team?.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      status: member.status,
    })) || [];

    return NextResponse.json({
      id: createdQuest!.id,
      name: createdQuest!.name,
      startDate: createdQuest!.startDate,
      endDate: createdQuest!.endDate,
      status: createdQuest!.status,
      result: createdQuest!.result,
      isActive,
      timeRemaining: Math.max(0, timeRemaining),
      team: createdQuest!.team ? {
        id: createdQuest!.team.id,
        name: createdQuest!.team.name,
        power: createdQuest!.team.power,
        members: formattedTeamMembers,
      } : null,
    });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}