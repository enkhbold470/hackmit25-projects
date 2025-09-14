// Test endpoint to debug transaction sync with sample UberEats data
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { detectRestaurant, generateRestaurantName } from '../../utils/restaurantDetection';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  const { userId = '257d2fc7-e7e3-45e9-afa5-efaa6127dfd6' } = body; // Default to seeded user

  console.log('🧪 Test sync endpoint called with userId:', userId);

  // Complete sample UberEats transaction data from your file
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
        },
        {
          "externalId": "f035d4a3-4826-4fb9-9cb3-f5e5a0b36d05",
          "name": "Essentia Ionized Alkaline Water, 33.8 Oz",
          "url": null,
          "quantity": 1,
          "price": 6.98,
          "eligibility": null
        },
        {
          "externalId": "62b8b723-29fa-484b-b647-6aa9a50fee1c",
          "name": "10 pc. Chicken McNuggets\u00ae Meal",
          "url": null,
          "quantity": 1,
          "price": 12.59,
          "eligibility": null
        },
        {
          "externalId": "1ced0ca7-fda1-496d-ac1c-8bb1df165fa2",
          "name": "Groovy Fries",
          "url": null,
          "quantity": 1,
          "price": 4.5,
          "eligibility": null
        },
        {
          "externalId": "44a9c0c6-104e-406a-bc1d-25d679c6874c",
          "name": "Essentia Ionized Alkaline Water, 33.8 Oz",
          "url": null,
          "quantity": 1,
          "price": 6.98,
          "eligibility": null
        }
      ]
    },
    {
      "externalId": "synthetic-2",
      "dateTime": "1727319375340",
      "url": "https://www.ubereats.com/orders/54eeb3c8-89e2-46fd-a407-c79f7c09d553",
      "orderStatus": "COMPLETED",
      "paymentMethods": [
        {
          "externalId": null,
          "type": "CARD",
          "brand": null,
          "lastFour": "2975",
          "transactionAmount": 169.71
        }
      ],
      "price": {
        "subTotal": 149.74,
        "adjustments": [
          {
            "type": "TAX",
            "label": "Tax",
            "amount": 11.98
          },
          {
            "type": "TIP",
            "label": "Tip",
            "amount": 5.0
          },
          {
            "type": "FEE",
            "label": "Service Fee",
            "amount": 2.99
          }
        ],
        "total": 169.71,
        "currency": "USD"
      },
      "products": [
        {
          "externalId": "0107ea0a-8ae1-4509-b734-01f85df62ed7",
          "name": "Pad Thai",
          "url": null,
          "quantity": 3,
          "price": 89.7,
          "eligibility": null
        },
        {
          "externalId": "3262deed-d4ae-4613-8fee-785eb82682f0",
          "name": "Dirty Dr Pepper\u00ae",
          "url": null,
          "quantity": 2,
          "price": 7.78,
          "eligibility": null
        },
        {
          "externalId": "f7eb0862-663b-4a85-913b-dcf249e476f0",
          "name": "Thai Fried Rice",
          "url": null,
          "quantity": 1,
          "price": 29.9,
          "eligibility": null
        },
        {
          "externalId": "93a89dbf-cba4-44e6-a354-52e039aa2cf8",
          "name": "Medium Vanilla Shake",
          "url": null,
          "quantity": 2,
          "price": 22.36,
          "eligibility": null
        }
      ]
    },
    {
      "externalId": "synthetic-3",
      "dateTime": "1757213775340",
      "url": "https://www.ubereats.com/orders/8c1b5cc4-b4b9-4271-a01e-ac84b83e538b",
      "orderStatus": "COMPLETED",
      "paymentMethods": [
        {
          "externalId": null,
          "type": "GIFT_CARD",
          "brand": "AMEX",
          "lastFour": "7619",
          "transactionAmount": 135.29
        }
      ],
      "price": {
        "subTotal": 118.31,
        "adjustments": [
          {
            "type": "TAX",
            "label": "Tax",
            "amount": 9.46
          },
          {
            "type": "TIP",
            "label": "Tip",
            "amount": 4.53
          },
          {
            "type": "FEE",
            "label": "Service Fee",
            "amount": 2.99
          }
        ],
        "total": 135.29,
        "currency": "USD"
      },
      "products": [
        {
          "externalId": "93a89dbf-cba4-44e6-a354-52e039aa2cf8",
          "name": "Medium Vanilla Shake",
          "url": null,
          "quantity": 3,
          "price": 33.54,
          "eligibility": null
        },
        {
          "externalId": "e123b33a-9445-4c1a-97f5-0a2b4081b300",
          "name": "Burrito Bowl",
          "url": null,
          "quantity": 3,
          "price": 56.85,
          "eligibility": null
        },
        {
          "externalId": "44a9c0c6-104e-406a-bc1d-25d679c6874c",
          "name": "Essentia Ionized Alkaline Water, 33.8 Oz",
          "url": null,
          "quantity": 3,
          "price": 20.94,
          "eligibility": null
        },
        {
          "externalId": "f035d4a3-4826-4fb9-9cb3-f5e5a0b36d05",
          "name": "Essentia Ionized Alkaline Water, 33.8 Oz",
          "url": null,
          "quantity": 1,
          "price": 6.98,
          "eligibility": null
        }
      ]
    },
    {
      "externalId": "synthetic-4",
      "dateTime": "1754967375340",
      "url": "https://www.ubereats.com/orders/5216f3b1-d1c8-4162-ac0a-051b72c5a475",
      "orderStatus": "COMPLETED",
      "paymentMethods": [
        {
          "externalId": null,
          "type": "GIFT_CARD",
          "brand": null,
          "lastFour": "3556",
          "transactionAmount": 98.86
        }
      ],
      "price": {
        "subTotal": 84.96,
        "adjustments": [
          {
            "type": "TAX",
            "label": "Tax",
            "amount": 6.8
          },
          {
            "type": "TIP",
            "label": "Tip",
            "amount": 4.11
          },
          {
            "type": "FEE",
            "label": "Service Fee",
            "amount": 2.99
          }
        ],
        "total": 98.86,
        "currency": "USD"
      },
      "products": [
        {
          "externalId": "93a89dbf-cba4-44e6-a354-52e039aa2cf8",
          "name": "Medium Vanilla Shake",
          "url": null,
          "quantity": 2,
          "price": 22.36,
          "eligibility": null
        },
        {
          "externalId": "62b8b723-29fa-484b-b647-6aa9a50fee1c",
          "name": "10 pc. Chicken McNuggets\u00ae Meal",
          "url": null,
          "quantity": 3,
          "price": 37.77,
          "eligibility": null
        },
        {
          "externalId": "3262deed-d4ae-4613-8fee-785eb82682f0",
          "name": "Dirty Dr Pepper\u00ae",
          "url": null,
          "quantity": 1,
          "price": 3.89,
          "eligibility": null
        },
        {
          "externalId": "44a9c0c6-104e-406a-bc1d-25d679c6874c",
          "name": "Essentia Ionized Alkaline Water, 33.8 Oz",
          "url": null,
          "quantity": 3,
          "price": 20.94,
          "eligibility": null
        }
      ]
    },
    {
      "externalId": "synthetic-5",
      "dateTime": "1735098975340",
      "url": "https://www.ubereats.com/orders/da2d4ca2-a0b8-461a-8e75-58d11a752079",
      "orderStatus": "COMPLETED",
      "paymentMethods": [
        {
          "externalId": null,
          "type": "GIFT_CARD",
          "brand": "MASTERCARD",
          "lastFour": "9365",
          "transactionAmount": 164.27
        }
      ],
      "price": {
        "subTotal": 143.28,
        "adjustments": [
          {
            "type": "TAX",
            "label": "Tax",
            "amount": 11.46
          },
          {
            "type": "TIP",
            "label": "Tip",
            "amount": 6.54
          },
          {
            "type": "FEE",
            "label": "Service Fee",
            "amount": 2.99
          }
        ],
        "total": 164.27,
        "currency": "USD"
      },
      "products": [
        {
          "externalId": "0107ea0a-8ae1-4509-b734-01f85df62ed7",
          "name": "Pad Thai",
          "url": null,
          "quantity": 4,
          "price": 119.6,
          "eligibility": null
        },
        {
          "externalId": "f7eb0862-663b-4a85-913b-dcf249e476f0",
          "name": "Thai Fried Rice",
          "url": null,
          "quantity": 1,
          "price": 23.68,
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

          // Detect restaurant from products
          const restaurantInfo = detectRestaurant(transaction.products);
          console.log(`🍽️ Detected restaurant: ${restaurantInfo.name} (${restaurantInfo.cuisineType}) - confidence: ${restaurantInfo.confidence}`);

          // Find or create restaurant
          let restaurant = await prisma.restaurant.findUnique({
            where: { name: restaurantInfo.name }
          });

          if (!restaurant) {
            restaurant = await prisma.restaurant.create({
              data: {
                name: restaurantInfo.name,
                cuisineType: restaurantInfo.cuisineType,
                merchantId: merchantId
              }
            });
            console.log(`🆕 Created new restaurant: ${restaurant.name}`);
          }

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
              restaurantId: restaurant.id,
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

        // Skip creating user-facing messages for test sync - this is a debug endpoint
        // await prisma.gameMessage.create({
        //   data: {
        //     userId,
        //     message: `${storedCount} test transactions synced from ${merchantName}. Character weakened!`,
        //     type: 'warning',
        //   },
        // });

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
      restaurantsCreated: await prisma.restaurant.count(),
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