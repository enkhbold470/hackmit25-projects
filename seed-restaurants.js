const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Realistic restaurant data with accurate pricing
const RESTAURANTS = [
  {
    name: "McDonald's",
    cuisineType: "Fast Food",
    merchantId: 19, // DoorDash
    items: [
      { name: "Big Mac Meal", price: 12.99 },
      { name: "Quarter Pounder with Cheese", price: 8.49 },
      { name: "Chicken McNuggets (10 pc)", price: 6.99 },
      { name: "McChicken", price: 3.99 },
      { name: "Large Fries", price: 3.49 },
      { name: "Coca-Cola (Large)", price: 2.89 }
    ]
  },
  {
    name: "Chipotle Mexican Grill",
    cuisineType: "Mexican",
    merchantId: 19,
    items: [
      { name: "Chicken Burrito Bowl", price: 11.95 },
      { name: "Carnitas Burrito", price: 12.45 },
      { name: "Barbacoa Quesadilla", price: 10.95 },
      { name: "Guacamole & Chips", price: 6.25 },
      { name: "Chicken Tacos (3)", price: 9.95 },
      { name: "Sofritas Bowl", price: 11.95 }
    ]
  },
  {
    name: "Pizza Hut",
    cuisineType: "Italian",
    merchantId: 36, // UberEats
    items: [
      { name: "Large Pepperoni Pizza", price: 16.99 },
      { name: "Medium Supreme Pizza", price: 15.49 },
      { name: "Meat Lovers Personal Pan", price: 8.99 },
      { name: "Buffalo Wings (8 pc)", price: 9.99 },
      { name: "Breadsticks (8 pc)", price: 6.99 },
      { name: "Cinnamon Sticks", price: 5.99 }
    ]
  },
  {
    name: "Subway",
    cuisineType: "Sandwiches",
    merchantId: 19,
    items: [
      { name: "Footlong Italian B.M.T.", price: 9.99 },
      { name: "Turkey Breast (6-inch)", price: 6.49 },
      { name: "Chicken Teriyaki Footlong", price: 10.49 },
      { name: "Veggie Delite (6-inch)", price: 5.99 },
      { name: "Chocolate Chip Cookie", price: 1.50 },
      { name: "Baked Lay's Chips", price: 2.25 }
    ]
  },
  {
    name: "Taco Bell",
    cuisineType: "Mexican",
    merchantId: 36,
    items: [
      { name: "Crunchwrap Supreme", price: 5.99 },
      { name: "Mexican Pizza", price: 4.99 },
      { name: "Quesadilla Combo", price: 8.99 },
      { name: "Nacho Fries", price: 3.49 },
      { name: "Beefy 5-Layer Burrito", price: 3.99 },
      { name: "Mountain Dew Baja Blast", price: 2.29 }
    ]
  },
  {
    name: "Panda Express",
    cuisineType: "Chinese",
    merchantId: 19,
    items: [
      { name: "Orange Chicken Plate", price: 11.20 },
      { name: "Beijing Beef Bowl", price: 9.80 },
      { name: "Honey Walnut Shrimp", price: 12.95 },
      { name: "Fried Rice (Large)", price: 5.40 },
      { name: "Chow Mein (Large)", price: 5.40 },
      { name: "Cream Cheese Rangoon (3)", price: 2.70 }
    ]
  },
  {
    name: "Starbucks",
    cuisineType: "Coffee",
    merchantId: 36,
    items: [
      { name: "Venti Caramel Macchiato", price: 5.95 },
      { name: "Grande Pike Place Roast", price: 2.65 },
      { name: "Bacon, Egg & Gouda Sandwich", price: 5.45 },
      { name: "Everything Bagel", price: 1.95 },
      { name: "Chocolate Croissant", price: 3.75 },
      { name: "Cake Pop", price: 2.25 }
    ]
  },
  {
    name: "KFC",
    cuisineType: "Fast Food",
    merchantId: 19,
    items: [
      { name: "8-Piece Family Meal", price: 24.99 },
      { name: "3-Piece Chicken Combo", price: 9.99 },
      { name: "Famous Bowl", price: 6.99 },
      { name: "Chicken Sandwich", price: 5.99 },
      { name: "Biscuit", price: 1.99 },
      { name: "Mac & Cheese (Large)", price: 4.99 }
    ]
  },
  {
    name: "Domino's Pizza",
    cuisineType: "Italian",
    merchantId: 36,
    items: [
      { name: "Large Hand Tossed Pizza", price: 14.99 },
      { name: "Medium Thin Crust Pizza", price: 12.99 },
      { name: "Chicken Wings (10 pc)", price: 12.99 },
      { name: "Cheesy Bread (16 pc)", price: 7.99 },
      { name: "Chocolate Lava Cake", price: 5.99 },
      { name: "2-Liter Coca-Cola", price: 3.99 }
    ]
  },
  {
    name: "Five Guys",
    cuisineType: "Burgers",
    merchantId: 19,
    items: [
      { name: "Cheeseburger", price: 9.99 },
      { name: "Little Bacon Cheeseburger", price: 8.69 },
      { name: "Cajun Fries (Large)", price: 5.19 },
      { name: "Bacon Dog", price: 7.39 },
      { name: "Chocolate Milkshake", price: 4.99 },
      { name: "Peanuts", price: 0.00 }
    ]
  }
];

// Common fees and adjustments
const COMMON_FEES = [
  { type: "delivery_fee", label: "Delivery Fee", amount: 2.99 },
  { type: "service_fee", label: "Service Fee", amount: 1.99 },
  { type: "small_order_fee", label: "Small Order Fee", amount: 1.50 },
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
      total: item.price * quantity
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
        where: { name: restaurant.name }
      });

      if (!existingRestaurant) {
        const newRestaurant = await prisma.restaurant.create({
          data: {
            name: restaurant.name,
            cuisineType: restaurant.cuisineType,
            merchantId: restaurant.merchantId,
            logo: `https://logo.clearbit.com/${restaurant.name.toLowerCase().replace(/\s+/g, '')}.com`
          }
        });
        createdRestaurants.push({ ...restaurant, id: newRestaurant.id });
        console.log(`✅ Created ${restaurant.name}`);
      } else {
        createdRestaurants.push({ ...restaurant, id: existingRestaurant.id });
        console.log(`⏭️  Using existing ${restaurant.name}`);
      }
    }

    console.log("🛒 Creating orders with products...");

    // Generate 15-25 realistic orders over the past 30 days
    const numOrders = Math.floor(Math.random() * 11) + 15;
    const createdOrders = [];

    for (let i = 0; i < numOrders; i++) {
      const restaurant = createdRestaurants[Math.floor(Math.random() * createdRestaurants.length)];
      const orderDate = generateRandomDate(Math.floor(Math.random() * 30));
      const selectedItems = selectRandomItems(restaurant.items);

      // Calculate subtotal
      const subTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);

      // Calculate fees
      const tax = subTotal * 0.0875; // 8.75% tax
      const tip = subTotal * (0.15 + Math.random() * 0.10); // 15-25% tip
      const deliveryFee = COMMON_FEES.find(f => f.type === "delivery_fee").amount;
      const serviceFee = COMMON_FEES.find(f => f.type === "service_fee").amount;
      const smallOrderFee = subTotal < 15 ? COMMON_FEES.find(f => f.type === "small_order_fee").amount : 0;

      const total = subTotal + tax + tip + deliveryFee + serviceFee + smallOrderFee;

      const orderId = generateOrderId();
      const merchantUrl = restaurant.merchantId === 19 ? "doordash.com" : "ubereats.com";

      // Create the order
      const order = await prisma.order.create({
        data: {
          externalId: orderId,
          dateTime: orderDate,
          url: `https://${merchantUrl}/store/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`,
          orderStatus: "delivered",
          subTotal: Math.round(subTotal * 100) / 100,
          total: Math.round(total * 100) / 100,
          currency: "USD",
          restaurantId: restaurant.id
        }
      });

      // Create products and order products
      for (const item of selectedItems) {
        const productId = generateProductId();

        // Create or find product
        let product = await prisma.product.findUnique({
          where: { externalId: productId }
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              externalId: productId,
              name: item.name,
              url: `https://${merchantUrl}/store/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}/item/${item.name.toLowerCase().replace(/\s+/g, '-')}`
            }
          });
        }

        // Create order product relationship
        await prisma.orderProduct.create({
          data: {
            quantity: item.quantity,
            subTotal: Math.round(item.total * 100) / 100,
            total: Math.round(item.total * 100) / 100,
            currency: "USD",
            unitPrice: Math.round(item.price * 100) / 100,
            orderId: order.id,
            productId: product.id
          }
        });

        // Add product eligibility
        await prisma.productEligibility.create({
          data: {
            eligibility: "food_delivery",
            productId: product.id
          }
        }).catch(() => {}); // Ignore if already exists
      }

      // Create payment method
      const cardBrands = ["Visa", "Mastercard", "American Express"];
      const cardBrand = cardBrands[Math.floor(Math.random() * cardBrands.length)];

      await prisma.paymentMethod.create({
        data: {
          externalId: `pm_${Math.random().toString(36).substr(2, 9)}`,
          type: "credit_card",
          brand: cardBrand,
          lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
          transactionAmount: Math.round(total * 100).toString(), // in cents as string
          orderId: order.id
        }
      });

      // Create price adjustments
      const adjustments = [
        { type: "taxes", label: "Taxes", amount: Math.round(tax * 100) / 100 },
        { type: "tip", label: "Tip", amount: Math.round(tip * 100) / 100 },
        { type: "delivery_fee", label: "Delivery Fee", amount: deliveryFee },
        { type: "service_fee", label: "Service Fee", amount: serviceFee }
      ];

      if (smallOrderFee > 0) {
        adjustments.push({ type: "small_order_fee", label: "Small Order Fee", amount: smallOrderFee });
      }

      for (const adj of adjustments) {
        await prisma.priceAdjustment.create({
          data: {
            type: adj.type,
            label: adj.label,
            amount: adj.amount,
            orderId: order.id
          }
        });
      }

      createdOrders.push({
        restaurant: restaurant.name,
        total: Math.round(total * 100) / 100,
        items: selectedItems.length,
        date: orderDate.toLocaleDateString()
      });

      console.log(`🍽️  Order ${i + 1}: ${restaurant.name} - $${Math.round(total * 100) / 100} (${selectedItems.length} items)`);
    }

    console.log("\n=== Restaurant Transaction Seeding Complete ===");
    console.log(`🏪 Restaurants: ${createdRestaurants.length}`);
    console.log(`📦 Orders: ${createdOrders.length}`);
    console.log(`💰 Total spent: $${createdOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);

    // Show breakdown by restaurant
    console.log("\n=== Order Summary ===");
    const restaurantSummary = {};
    createdOrders.forEach(order => {
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
      prisma.priceAdjustment.count()
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