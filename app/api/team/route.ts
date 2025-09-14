import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
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
        quest: {
          select: {
            id: true,
            name: true,
            endDate: true,
            status: true,
            result: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const formattedMembers = team.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      status: member.status,
    }));

    return NextResponse.json({
      id: team.id,
      name: team.name,
      power: team.power,
      members: formattedMembers,
      quest: team.quest,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { power, memberUpdates, questUpdates } = body;

    // Update team power if provided
    const updatedTeam = await prisma.team.update({
      where: { id: teamId as string },
      data: { power  },
    });

    // Update quest if provided
    if (questUpdates) {
      await prisma.quest.update({
        where: { id: updatedTeam.questId as string },
        data: questUpdates,
      });
    }

    // Update member statuses if provided
    if (memberUpdates && Array.isArray(memberUpdates)) {
      for (const update of memberUpdates) {
        if (update.userId && update.status) {
          await prisma.teamMember.updateMany({
            where: {
              teamId: teamId as string,
              userId: update.userId as string,
            },
            data: {
              status: update.status,
            },
          });
        }
      }
    }

    // Return updated team data
    const team = await prisma.team.findUnique({
      where: { id: teamId as string },  
      include: {
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
        quest: {
          select: {
            id: true,
            name: true,
            endDate: true,
            status: true,
            result: true,
          },
        },
      },
    });

    const formattedMembers = team!.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      status: member.status,
    }));

    return NextResponse.json({
      id: team!.id,
      name: team!.name,
      power: team!.power,
      members: formattedMembers,
      quest: team!.quest,
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, userIds = [], questEndDate } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Create quest if endDate provided
    let quest;
    if (questEndDate) {
      quest = await prisma.quest.create({
        data: {
          endDate: new Date(questEndDate),
        },
      });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        questId: quest?.id,
      },
    });

    // Add members to team
    if (userIds.length > 0) {
      await prisma.teamMember.createMany({
        data: userIds.map((userId: string) => ({
          userId,
          teamId: team.id,
        })),
      });
    }

    // Return created team with members
    const createdTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
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
        quest: {
          select: {
            id: true,
            name: true,
            endDate: true,
            status: true,
            result: true,
          },
        },
      },
    });

    const formattedMembers = createdTeam!.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      status: member.status,
    }));

    return NextResponse.json({
      id: createdTeam!.id,
      name: createdTeam!.name,
      power: createdTeam!.power,
      members: formattedMembers,
      quest: createdTeam!.quest,
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}