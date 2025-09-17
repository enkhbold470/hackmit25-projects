const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Realistic restaurant data with accurate pricing
const RESTAURANTS = [
  {
    name: "McDonald's",
    cuisineType: "Fast Food",
    merchantId: 19, // DoorDash
    items: [
      { name: "Quarter Pounder with Cheese", price: 8.49 },
      { name: "Large Fries", price: 3.49 },
      { name: "Coca-Cola (Large)", price: 2.89 },
    ],
  },
  {
    name: "Chipotle Mexican Grill",
    cuisineType: "Mexican",
    merchantId: 19,
    items: [{ name: "Chicken Burrito Bowl", price: 11.95 }],
  },
  {
    name: "Pizza Hut",
    cuisineType: "Italian",
    merchantId: 36, // UberEats
    items: [
      { name: "Large Pepperoni Pizza", price: 16.99 },
      { name: "Cinnamon Sticks", price: 5.99 },
    ],
  },
  {
    name: "Subway",
    cuisineType: "Sandwiches",
    merchantId: 19,
    items: [
      { name: "Footlong Italian B.M.T.", price: 9.99 },
      { name: "Turkey Breast (6-inch)", price: 6.49 },
      { name: "Chicken Teriyaki Footlong", price: 10.49 },
    ],
  },
  {
    name: "Taco Bell",
    cuisineType: "Mexican",
    merchantId: 36,
    items: [
      { name: "Crunchwrap Supreme", price: 5.99 },
      { name: "Mexican Pizza", price: 4.99 },
    ],
  },
];

// Common fees and adjustments
const COMMON_FEES = [
  { type: "delivery_fee", label: "Delivery Fee", amount: 2.99 },
  { type: "service_fee", label: "Service Fee", amount: 1.99 },
  { type: "small_order_fee", label: "Small Order Fee", amount: 1.5 },
  { type: "taxes", label: "Taxes", amount: 0 }, // Will be calculated
  { type: "tip", label: "Tip", amount: 0 }, // Will be calculated
];

function generateRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Random hour between 11 AM and 10 PM
  date.setHours(Math.floor(Math.random() * 11) + 11);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function generateOrderId() {
  return `order_${Math.random().toString(36).substr(2, 9)}`;
}

function generateProductId() {
  return `prod_${Math.random().toString(36).substr(2, 9)}`;
}

function selectRandomItems(items, maxItems = 4) {
  const numItems = Math.floor(Math.random() * maxItems) + 1;
  const selectedItems = [];
  const usedIndexes = new Set();

  for (let i = 0; i < numItems; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * items.length);
    } while (usedIndexes.has(index));

    usedIndexes.add(index);
    const item = items[index];
    const quantity = Math.random() < 0.8 ? 1 : 2; // 80% chance of quantity 1

    selectedItems.push({
      ...item,
      quantity,
      total: item.price * quantity,
    });
  }

  return selectedItems;
}

async function seedRestaurantTransactions() {
  console.log("🍕 Starting restaurant transaction seeding...");

  try {
    // Get the first user for transactions
    const user = await prisma.user.findFirst();
    if (!user) {
      throw new Error("No users found. Please run seed-game.js first.");
    }

    console.log(`👤 Using user: ${user.name} (${user.id})`);

    // Create restaurants
    console.log("🏪 Creating restaurants...");
    const createdRestaurants = [];

    for (const restaurant of RESTAURANTS) {
      const existingRestaurant = await prisma.restaurant.findUnique({
        where: { name: restaurant.name },
      });

      if (!existingRestaurant) {
        const newRestaurant = await prisma.restaurant.create({
          data: {
            name: restaurant.name,
            cuisineType: restaurant.cuisineType,
            merchantId: restaurant.merchantId,
            logo: `https://logo.clearbit.com/${restaurant.name
              .toLowerCase()
              .replace(/\s+/g, "")}.com`,
          },
        });
        createdRestaurants.push({ ...restaurant, id: newRestaurant.id });
        console.log(`✅ Created ${restaurant.name}`);
      } else {
        createdRestaurants.push({ ...restaurant, id: existingRestaurant.id });
        console.log(`⏭️  Using existing ${restaurant.name}`);
      }
    }

    console.log("🛒 Creating orders with products...");

    // Generate just 3 simple orders
    const numOrders = 3;
    const createdOrders = [];

    // Simple order data
    const simpleOrders = [
      { restaurant: createdRestaurants[0], item: createdRestaurants[0].items[0], days: 1 },
      { restaurant: createdRestaurants[1], item: createdRestaurants[1].items[0], days: 3 },
      { restaurant: createdRestaurants[2], item: createdRestaurants[2].items[0], days: 5 }
    ];

    for (let i = 0; i < numOrders; i++) {
      try {
        console.log(`🛒 Creating order ${i + 1}/${numOrders}...`);

        const { restaurant, item, days } = simpleOrders[i];
        const orderDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        // Simple calculation
        const subTotal = item.price;
        const total = subTotal + 2.99 + 1.99; // delivery + service fee

        const orderId = generateOrderId();
        const merchantUrl = restaurant.merchantId === 19 ? "doordash.com" : "ubereats.com";

        // Create simple order (no complex relationships)
        const order = await prisma.order.create({
          data: {
            externalId: orderId,
            dateTime: orderDate,
            url: `https://${merchantUrl}/store/${restaurant.name}`,
            orderStatus: "delivered",
            subTotal: Math.round(subTotal * 100) / 100,
            total: Math.round(total * 100) / 100,
            currency: "USD",
            restaurantId: restaurant.id,
          },
        });

        createdOrders.push({
          restaurant: restaurant.name,
          total: Math.round(total * 100) / 100,
          items: 1,
          date: orderDate.toLocaleDateString(),
        });

        console.log(`🍽️  Order ${i + 1}: ${restaurant.name} - $${Math.round(total * 100) / 100}`);

      } catch (orderError) {
        console.log(`❌ Failed to create order ${i + 1}:`, orderError.message);
      }
    }

    console.log("\n=== Restaurant Transaction Seeding Complete ===");
    console.log(`🏪 Restaurants: ${createdRestaurants.length}`);
    console.log(`📦 Orders: ${createdOrders.length}`);
    console.log(
      `💰 Total spent: $${createdOrders
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2)}`
    );

    // Show breakdown by restaurant
    console.log("\n=== Order Summary ===");
    const restaurantSummary = {};
    createdOrders.forEach((order) => {
      if (!restaurantSummary[order.restaurant]) {
        restaurantSummary[order.restaurant] = { count: 0, total: 0 };
      }
      restaurantSummary[order.restaurant].count++;
      restaurantSummary[order.restaurant].total += order.total;
    });

    Object.entries(restaurantSummary).forEach(([name, stats]) => {
      console.log(`${name}: ${stats.count} orders, $${stats.total.toFixed(2)}`);
    });

    // Display final database statistics
    const stats = await Promise.all([
      prisma.restaurant.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.orderProduct.count(),
      prisma.paymentMethod.count(),
      prisma.priceAdjustment.count(),
    ]);

    console.log("\n=== Database Statistics ===");
    console.log(`🏪 Restaurants: ${stats[0]}`);
    console.log(`📦 Orders: ${stats[1]}`);
    console.log(`🍕 Products: ${stats[2]}`);
    console.log(`🛒 Order Products: ${stats[3]}`);
    console.log(`💳 Payment Methods: ${stats[4]}`);
    console.log(`💰 Price Adjustments: ${stats[5]}`);
  } catch (error) {
    console.error("❌ Restaurant seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function for use in other scripts
module.exports = seedRestaurantTransactions;

// Run directly if this script is executed
if (require.main === module) {
  seedRestaurantTransactions().catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  });
}
