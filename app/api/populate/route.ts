import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample restaurant data for generating transactions
const sampleRestaurants = [
  { name: 'McDonald\'s', avgAmount: 12.50 },
  { name: 'Subway', avgAmount: 8.99 },
  { name: 'Starbucks', avgAmount: 6.75 },
  { name: 'Chipotle', avgAmount: 14.25 },
  { name: 'Pizza Hut', avgAmount: 18.99 },
  { name: 'KFC', avgAmount: 11.50 },
  { name: 'Taco Bell', avgAmount: 9.25 },
  { name: 'Domino\'s Pizza', avgAmount: 22.75 },
  { name: 'Burger King', avgAmount: 10.99 },
  { name: 'Wendy\'s', avgAmount: 13.50 },
  { name: 'Panda Express', avgAmount: 12.25 },
  { name: 'Five Guys', avgAmount: 16.99 },
  { name: 'In-N-Out', avgAmount: 9.75 },
  { name: 'Chick-fil-A', avgAmount: 11.25 },
  { name: 'Panera Bread', avgAmount: 15.50 }
];

function generateRandomAmount(baseAmount: number): number {
  // Add some randomness to the base amount (±30%)
  const variation = baseAmount * 0.3;
  const randomVariation = (Math.random() - 0.5) * 2 * variation;
  return Math.round((baseAmount + randomVariation) * 100) / 100;
}

function generateRandomDate(daysBack: number): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);
  
  return date;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '20');
  const userId = searchParams.get('userId');
  const daysBack = parseInt(searchParams.get('daysBack') || '30');
  
  try {
    const transactions = [];
    
    // Generate sample transactions
    for (let i = 0; i < count; i++) {
      const restaurant = sampleRestaurants[Math.floor(Math.random() * sampleRestaurants.length)];
      const amount = generateRandomAmount(restaurant.avgAmount);
      const date = generateRandomDate(daysBack);
      
      // Create transaction in database if userId is provided
      if (userId) {
        try {
          const transaction = await prisma.transaction.create({
            data: {
              amount: Math.round(amount * 100), // Convert to cents
              currency: 'USD',
              direction: 'outgoing',
              source: restaurant.name,
              timestamp: date,
              metadata: { userId, type: 'food_delivery', generated: true },
            },
          });
          
          transactions.push({
            id: transaction.id,
            restaurant: restaurant.name,
            amount: amount,
            date: date.toISOString(),
            status: 'completed',
            externalId: `gen_${transaction.id}`,
          });
        } catch (dbError) {
          console.warn('Database insert failed, adding to memory only:', dbError);
          // Fallback to memory-only transaction
          transactions.push({
            id: `temp_${Date.now()}_${i}`,
            restaurant: restaurant.name,
            amount: amount,
            date: date.toISOString(),
            status: 'completed',
            externalId: `temp_${Date.now()}_${i}`,
          });
        }
      } else {
        // Just return sample data without saving to database
        transactions.push({
          id: `sample_${Date.now()}_${i}`,
          restaurant: restaurant.name,
          amount: amount,
          date: date.toISOString(),
          status: 'completed',
          externalId: `sample_${Date.now()}_${i}`,
        });
      }
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
      message: userId ? 'Sample transactions generated and saved to database' : 'Sample transactions generated (memory only)'
    });
    
  } catch (error) {
    console.error('Error generating sample transactions:', error);
    
    // Fallback: return sample data even if database fails
    const fallbackTransactions = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const restaurant = sampleRestaurants[Math.floor(Math.random() * sampleRestaurants.length)];
      const amount = generateRandomAmount(restaurant.avgAmount);
      const date = generateRandomDate(daysBack);
      
      fallbackTransactions.push({
        id: `fallback_${Date.now()}_${i}`,
        restaurant: restaurant.name,
        amount: amount,
        date: date.toISOString(),
        status: 'completed',
        externalId: `fallback_${Date.now()}_${i}`,
      });
    }
    
    return NextResponse.json({
      success: false,
      count: fallbackTransactions.length,
      transactions: fallbackTransactions,
      message: 'Database error occurred, returning fallback sample data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}