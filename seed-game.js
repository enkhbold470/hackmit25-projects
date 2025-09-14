const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting game database seeding...");

    // Create a sample user
    const user = await prisma.user.create({
      data: {
        name: "You",
        avatar: "😊",
        characterState: {
          create: {
            health: 85,
            status: "neutral",
            streak: 3,
          },
        },
      },
      include: {
        characterState: true,
      },
    });

    console.log("✅ Created user:", user.name);

    // Create sample team members (other users)
    const teamMembers = await Promise.all([
      prisma.user.create({
        data: {
          name: "Dave",
          avatar: "😵‍💫",
          characterState: {
            create: {
              health: 45,
              status: "weakened",
              streak: 0,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          name: "Sarah",
          avatar: "💪",
          characterState: {
            create: {
              health: 100,
              status: "powered",
              streak: 7,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          name: "Mike",
          avatar: "😊",
          characterState: {
            create: {
              health: 75,
              status: "neutral",
              streak: 2,
            },
          },
        },
      }),
    ]);

    console.log("✅ Created team members");

    // Create a quest (12 days from now)
    const questEndDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
    const quest = await prisma.quest.create({
      data: {
        name: "Defeat the Takeout Titan",
        endDate: questEndDate,
        status: "active",
      },
    });

    console.log("✅ Created quest:", quest.name);

    // Create a team and link it to the quest
    const team = await prisma.team.create({
      data: {
        name: "Food Warriors",
        power: 78,
        questId: quest.id,
      },
    });

    console.log("✅ Created team:", team.name);

    // Add all users to the team
    const allUsers = [user, ...teamMembers];
    await Promise.all(
      allUsers.map((u, index) =>
        prisma.teamMember.create({
          data: {
            userId: u.id,
            teamId: team.id,
            status:
              index === 0
                ? "neutral"
                : index === 1
                ? "weakened"
                : index === 2
                ? "powered"
                : "neutral",
          },
        })
      )
    );

    console.log("✅ Added users to team");

    // Create some sample messages for the main user
    await Promise.all([
      prisma.gameMessage.create({
        data: {
          userId: user.id,
          message: "Congrats on your 3-day streak! 🔥",
          type: "success",
        },
      }),
      prisma.gameMessage.create({
        data: {
          userId: user.id,
          message: "Dave ordered from Pizza Palace. His character is weakened!",
          type: "warning",
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
      }),
      prisma.gameMessage.create({
        data: {
          userId: user.id,
          message: "No orders from the team yesterday. Great job!",
          type: "success",
          timestamp: new Date(Date.now() - 2 * 86400000), // 2 days ago
        },
      }),
    ]);

    console.log("✅ Created sample messages");

    // Create some sample transaction records (these would normally come from KnotAPI)
    const sampleTransactions = [
      { restaurant: "Pizza Palace", amount: 24.99, days: 5 },
      { restaurant: "Burger Junction", amount: 18.5, days: 8 },
      { restaurant: "Sushi Express", amount: 32.75, days: 10 },
      { restaurant: "Taco Time", amount: 15.25, days: 12 },
      { restaurant: "Chinese Garden", amount: 28.9, days: 15 },
    ];

    for (const tx of sampleTransactions) {
      await prisma.transaction.create({
        data: {
          amount: Math.round(tx.amount * 100), // Convert to cents
          currency: "USD",
          direction: "outgoing",
          source: tx.restaurant,
          metadata: { userId: user.id, type: "food_delivery" },
          timestamp: new Date(Date.now() - tx.days * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log("✅ Created sample transactions");

    console.log("\n=== Game Database Seeding Complete ===");
    console.log(`👤 Main User ID: ${user.id}`);
    console.log(`👥 Team ID: ${team.id}`);
    console.log(`🎯 Quest ID: ${quest.id}`);
    console.log(`⏰ Quest ends: ${quest.endDate.toLocaleDateString()}`);

    // Display database statistics
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.quest.count(),
      prisma.gameMessage.count(),
      prisma.transaction.count(),
    ]);

    console.log("\n=== Database Statistics ===");
    console.log(`👥 Users: ${stats[0]}`);
    console.log(`🏆 Teams: ${stats[1]}`);
    console.log(`🎯 Quests: ${stats[2]}`);
    console.log(`📧 Messages: ${stats[3]}`);
    console.log(`💳 Transactions: ${stats[4]}`);
  } catch (error) {
    console.error("Game seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
main().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});

module.exports = main;
