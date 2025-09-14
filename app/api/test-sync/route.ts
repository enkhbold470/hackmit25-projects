// Test endpoint to debug transaction sync with sample UberEats data
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { userId = '257d2fc7-e7e3-45e9-afa5-efaa6127dfd6' } = body; // Default to seeded user

  console.log('🧪 Test sync endpoint called with userId:', userId);

  // Sample UberEats transaction data from your file
  const sampleTransactions = [
    {
      "externalId": "synthetic-1",
      "dateTime": "1740196575340",
      "url": "https://www.ubereats.com/orders/da2d4ca2-a0b8-461a-8e75-58d11a752079",
      "orderStatus": "COMPLETED",
      "paymentMethods": [
        {
          "externalId": null,
          "type": "GIFT_CARD",
          "brand": "VISA",
          "lastFour": "4833",
          "transactionAmount": 122.63
        }
      ],
      "price": {
        "subTotal": 108.85000000000001,
        "adjustments": [
          {
            "type": "TAX",
            "label": "Tax",
            "amount": 8.71
          },
          {
            "type": "TIP",
            "label": "Tip",
            "amount": 2.08
          },
          {
            "type": "FEE",
            "label": "Service Fee",
            "amount": 2.99
          }
        ],
        "total": 122.63,
        "currency": "USD"
      },
      "products": [
        {
          "externalId": "d477e4ee-41e6-42d6-acb2-b1c2ced416f4",
          "name": "Groovy Fries",
          "url": null,
          "quantity": 2,
          "price": 18,
          "eligibility": null
        },
        {
          "externalId": "0107ea0a-8ae1-4509-b734-01f85df62ed7",
          "name": "Pad Thai",
          "url": null,
          "quantity": 2,
          "price": 59.8,
          "eligibility": null
        }
      ]
    }
  ];

  const merchantId = 36; // UberEats
  const merchantName = 'UberEats';

  try {
    console.log(`🧪 Processing ${sampleTransactions.length} test transactions`);

    let storedCount = 0;

    for (const [index, transaction] of sampleTransactions.entries()) {
      console.log(`💾 Processing transaction ${index + 1}/${sampleTransactions.length}:`, transaction.externalId);

      try {
        // Check if transaction already exists
        const existingOrder = await prisma.order.findUnique({
          where: { externalId: transaction.externalId },
        });

        if (!existingOrder) {
          console.log(`✨ Creating new order for transaction: ${transaction.externalId}`);

          // Handle date
          const timestamp = parseInt(transaction.dateTime.toString());
          const orderDate = new Date(timestamp);
          console.log(`📅 Parsed date: ${orderDate.toISOString()}`);

          // Create new order from transaction data
          const newOrder = await prisma.order.create({
            data: {
              externalId: transaction.externalId,
              dateTime: orderDate,
              url: transaction.url || '',
              orderStatus: transaction.orderStatus || 'COMPLETED',
              subTotal: parseFloat(transaction.price?.subTotal?.toString() || '0'),
              total: parseFloat(transaction.price?.total?.toString() || '0'),
              currency: transaction.price?.currency || 'USD',
            },
          });

          console.log(`✅ Order created with ID: ${newOrder.id}`);

          // Add products
          if (transaction.products && transaction.products.length > 0) {
            for (const productData of transaction.products) {
              if (!productData.externalId) continue;

              let product = await prisma.product.findUnique({
                where: { externalId: productData.externalId },
              });

              if (!product) {
                product = await prisma.product.create({
                  data: {
                    externalId: productData.externalId,
                    name: productData.name,
                    url: productData.url || '',
                  },
                });
                console.log(`✨ Created product: ${product.name}`);
              }

              // Create order-product relationship
              const productPrice = parseFloat(productData.price?.toString() || '0');

              await prisma.orderProduct.create({
                data: {
                  orderId: newOrder.id,
                  productId: product.id,
                  quantity: productData.quantity || 1,
                  subTotal: productPrice,
                  total: productPrice,
                  currency: 'USD',
                  unitPrice: productPrice / (productData.quantity || 1),
                },
              });
              console.log(`🔗 Linked product: ${product.name}`);
            }
          }

          // Add payment methods
          if (transaction.paymentMethods && transaction.paymentMethods.length > 0) {
            for (const paymentMethod of transaction.paymentMethods) {
              await prisma.paymentMethod.create({
                data: {
                  orderId: newOrder.id,
                  externalId: paymentMethod.externalId || '',
                  type: paymentMethod.type,
                  brand: paymentMethod.brand,
                  lastFour: paymentMethod.lastFour,
                  transactionAmount: paymentMethod.transactionAmount?.toString() || '0',
                },
              });
              console.log(`💳 Added payment method: ${paymentMethod.type}`);
            }
          }

          // Add price adjustments
          if (transaction.price?.adjustments) {
            for (const adjustment of transaction.price.adjustments) {
              await prisma.priceAdjustment.create({
                data: {
                  orderId: newOrder.id,
                  type: adjustment.type,
                  label: adjustment.label || '',
                  amount: parseFloat(adjustment.amount?.toString() || '0'),
                },
              });
              console.log(`💰 Added adjustment: ${adjustment.type} - ${adjustment.amount}`);
            }
          }

          storedCount++;
          console.log(`✅ Successfully stored transaction: ${transaction.externalId}`);
        } else {
          console.log(`⏭️ Transaction already exists, skipping: ${transaction.externalId}`);
        }
      } catch (error) {
        console.error(`❌ Error storing transaction ${transaction.externalId}:`, error);
      }
    }

    console.log(`💾 Stored ${storedCount} new transactions`);

    // Update character state if transactions were stored
    if (userId && storedCount > 0) {
      const characterState = await prisma.characterState.findUnique({
        where: { userId },
      });

      if (characterState) {
        const healthReduction = Math.min(storedCount * 10, characterState.health);
        const newHealth = Math.max(characterState.health - healthReduction, 0);

        await prisma.characterState.update({
          where: { userId },
          data: {
            health: newHealth,
            status: newHealth < 50 ? 'weakened' : 'neutral',
            streak: 0,
          },
        });

        await prisma.gameMessage.create({
          data: {
            userId,
            message: `${storedCount} test transactions synced from ${merchantName}. Character weakened!`,
            type: 'warning',
          },
        });

        console.log(`🎮 Updated character: health=${newHealth}, status=${newHealth < 50 ? 'weakened' : 'neutral'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test sync completed',
      transactionsProcessed: sampleTransactions.length,
      transactionsStored: storedCount,
      merchantId,
      merchantName,
      userId,
    });

  } catch (error) {
    console.error('❌ Test sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}