// app/api/route.ts - KnotAPI integration with game state sync
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log('🔄 Sync API called');
  const body = await request.json();
  const { userId, merchantId } = body; // Expect userId and optional merchantId for filtering

  console.log('📨 Sync request body:', { userId, merchantId });

  // Basic auth with client_id:secret encoded in base64
  const clientId = process.env.KNOT_CLIENT_ID as string;
  const secret = process.env.KNOT_SECRET as string;

  if (!clientId || !secret) {
    console.error('❌ Missing KnotAPI credentials');
    return NextResponse.json({ error: 'Missing KnotAPI credentials' }, { status: 500 });
  }

  if (!userId) {
    console.error('❌ Missing userId');
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const KNOT_SECRET = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
    const maxRetries = 3;
    let attempt = 0;
    let data: any = null;
    let res: any = null;

    while (attempt < maxRetries) {
      attempt++;
      console.log(`🌐 KnotAPI sync attempt ${attempt}/${maxRetries}`);

      try {
        // Prepare request body for KnotAPI sync endpoint
        const syncRequestBody = {
          merchant_id: merchantId || 19, // Default to DoorDash if not specified
          external_user_id: userId,
          limit: 50, // Get up to 50 recent transactions
        };

        console.log('🌐 KnotAPI sync request:', syncRequestBody);

        res = await fetch('https://development.knotapi.com/transactions/sync', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${KNOT_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(syncRequestBody),
        });

        console.log('📡 KnotAPI response status:', res.status);
        data = await res.json();
        console.log('📦 KnotAPI sync response:', data);

        // If we get a USER_NOT_FOUND error, wait and retry
        if (!res.ok && data?.error_code === 'USER_NOT_FOUND' && attempt < maxRetries) {
          console.log(`⏱️ USER_NOT_FOUND, waiting 3 seconds before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }

        // Break out of retry loop if successful or if it's a different error
        break;
      } catch (fetchError) {
        console.error(`❌ Fetch error on attempt ${attempt}:`, fetchError);
        if (attempt === maxRetries) {
          throw fetchError;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Check for errors in KnotAPI response
    if (res && !res.ok) {
      console.error('❌ KnotAPI sync failed:', data);
      return NextResponse.json({
        error: 'KnotAPI sync failed',
        details: data,
        status: res.status
      }, { status: res.status });
    }

    // Get transactions from the response (KnotAPI returns 'transactions' field)
    const transactions = data.transactions || data || [];
    console.log(`📊 Found ${transactions.length} transactions from KnotAPI`);
    console.log('🗑️ Sample transaction structure:', transactions.length > 0 ? transactions[0] : 'No transactions');

    // For UberEats and DoorDash, all transactions should be food delivery
    const foodDeliveryTransactions = transactions;

    console.log(`🍕 Processing ${foodDeliveryTransactions.length} food delivery transactions`);

    // Store transactions in database
    if (userId && foodDeliveryTransactions.length > 0) {
      const merchantName = data.merchant?.name || (merchantId === 19 ? 'DoorDash' : merchantId === 36 ? 'UberEats' : 'Unknown');
      console.log(`💾 Storing transactions for merchant: ${merchantName} (ID: ${merchantId})`);

      let storedCount = 0;

      // Store each transaction as an Order in the database
      for (const [index, transaction] of foodDeliveryTransactions.entries()) {
        console.log(`💾 Processing transaction ${index + 1}/${foodDeliveryTransactions.length}:`, transaction.externalId || transaction.id);
        try {
          // Check if transaction already exists
          const existingOrder = await prisma.order.findUnique({
            where: { externalId: transaction.externalId || transaction.external_id || transaction.id },
          });

          if (!existingOrder && (transaction.id || transaction.externalId)) {
            console.log(`✨ Creating new order for transaction: ${transaction.externalId || transaction.id}`);

            // Handle different date formats
            let orderDate: Date;
            if (transaction.dateTime) {
              // Handle timestamp in milliseconds (like "1740196575340")
              const timestamp = parseInt(transaction.dateTime.toString());
              orderDate = new Date(timestamp);
            } else if (transaction.datetime) {
              orderDate = new Date(transaction.datetime);
            } else {
              orderDate = new Date();
            }

            // Create new order from transaction data
            const newOrder = await prisma.order.create({
              data: {
                externalId: transaction.externalId || transaction.external_id || transaction.id,
                dateTime: orderDate,
                url: transaction.url || '',
                orderStatus: transaction.orderStatus || transaction.order_status || 'COMPLETED',
                subTotal: parseFloat(transaction.price?.subTotal || transaction.price?.sub_total || '0'),
                total: parseFloat(transaction.price?.total || '0'),
                currency: transaction.price?.currency || 'USD',
              },
            });

            // Add products if available
            if (transaction.products && transaction.products.length > 0) {
              for (const productData of transaction.products) {
                // Create or find product
                const productExternalId = productData.externalId || productData.external_id;
                if (!productExternalId) continue;

                let product = await prisma.product.findUnique({
                  where: { externalId: productExternalId },
                });

                if (!product) {
                  product = await prisma.product.create({
                    data: {
                      externalId: productExternalId,
                      name: productData.name,
                      url: productData.url || '',
                    },
                  });
                }

                // Create order-product relationship with proper price handling
                const productPrice = productData.price || 0;
                const productSubTotal = parseFloat(productData.price?.subTotal || productData.price?.sub_total || productPrice.toString());
                const productTotal = parseFloat(productData.price?.total || productPrice.toString());
                const productUnitPrice = parseFloat(productData.price?.unitPrice || productData.price?.unit_price || productPrice.toString());

                await prisma.orderProduct.create({
                  data: {
                    orderId: newOrder.id,
                    productId: product.id,
                    quantity: productData.quantity || 1,
                    subTotal: productSubTotal,
                    total: productTotal,
                    currency: productData.price?.currency || 'USD',
                    unitPrice: productUnitPrice,
                  },
                });
              }
            }

            // Add payment methods if available
            const paymentMethods = transaction.paymentMethods || transaction.payment_methods;
            if (paymentMethods && paymentMethods.length > 0) {
              for (const paymentMethod of paymentMethods) {
                await prisma.paymentMethod.create({
                  data: {
                    orderId: newOrder.id,
                    externalId: paymentMethod.externalId || paymentMethod.external_id || '',
                    type: paymentMethod.type,
                    brand: paymentMethod.brand,
                    lastFour: paymentMethod.lastFour || paymentMethod.last_four,
                    transactionAmount: (paymentMethod.transactionAmount || paymentMethod.transaction_amount || '0').toString(),
                  },
                });
              }
            }

            // Add price adjustments if available
            if (transaction.price?.adjustments && transaction.price.adjustments.length > 0) {
              for (const adjustment of transaction.price.adjustments) {
                await prisma.priceAdjustment.create({
                  data: {
                    orderId: newOrder.id,
                    type: adjustment.type,
                    label: adjustment.label || '',
                    amount: parseFloat(adjustment.amount || '0'),
                  },
                });
              }
            }

            storedCount++;
            console.log(`✅ Successfully stored transaction: ${transaction.externalId || transaction.id}`);
          } else if (existingOrder) {
            console.log(`⏭️ Transaction already exists, skipping: ${transaction.externalId || transaction.id}`);
          } else {
            console.log(`⚠️ Transaction missing ID, skipping:`, transaction);
          }
        } catch (error) {
          console.error(`❌ Error storing transaction ${transaction.externalId || transaction.id}:`, error);
        }
      }

      console.log(`💾 Stored ${storedCount} new transactions out of ${foodDeliveryTransactions.length} total`);

      // Get the most recent transaction to trigger game state changes
      const recentTransaction = foodDeliveryTransactions[0];

      // Update character state for food delivery transactions
      const characterState = await prisma.characterState.findUnique({
        where: { userId },
      });

      if (characterState) {
        // Each food delivery transaction impacts the game
        const transactionsCount = foodDeliveryTransactions.length;
        const healthReduction = Math.min(transactionsCount * 10, characterState.health);
        const newHealth = Math.max(characterState.health - healthReduction, 0);

        await prisma.characterState.update({
          where: { userId },
          data: {
            health: newHealth,
            status: newHealth < 50 ? 'weakened' : 'neutral',
            streak: 0, // Reset streak when food is ordered
          },
        });

        // Add message about the transaction impact
        if (recentTransaction) {
          await prisma.gameMessage.create({
            data: {
              userId,
              message: `${transactionsCount > 1 ? `${transactionsCount} transactions` : 'New transaction'} synced from ${merchantName}. Character weakened!`,
              type: 'warning',
            },
          });
        }

        // Update team status if user is in a team
        const teamMember = await prisma.teamMember.findFirst({
          where: { userId },
          include: { team: true },
        });

        if (teamMember) {
          await prisma.teamMember.update({
            where: { id: teamMember.id },
            data: { status: newHealth < 50 ? 'weakened' : 'neutral' },
          });

          // Reduce team power
          const powerReduction = transactionsCount * 5;
          const newTeamPower = Math.max(teamMember.team.power - powerReduction, 0);
          await prisma.team.update({
            where: { id: teamMember.team.id },
            data: { power: newTeamPower },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      merchant: data.merchant,
      transactions: foodDeliveryTransactions,
      transactionsStored: foodDeliveryTransactions.length,
      gameImpact: userId && foodDeliveryTransactions.length > 0 ? {
        transactionsDetected: foodDeliveryTransactions.length,
        characterImpacted: true,
        healthReduction: Math.min(foodDeliveryTransactions.length * 10, 100),
        streakReset: true,
      } : null,
      nextCursor: data.next_cursor,
    });
  } catch (error) {
    console.error('Error syncing with KnotAPI:', error);
    return NextResponse.json({ error: 'Failed to sync with KnotAPI' }, { status: 500 });
  }
}