import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Read the DoorDash JSON data
    const jsonPath = path.join(process.cwd(), './Development_DoorDash.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const orders = JSON.parse(rawData);
    
    console.log(`Found ${orders.length} orders to process`);
    
    // Clear existing data (optional - uncomment if you want to reset)
    // await prisma.productEligibility.deleteMany();
    // await prisma.orderProduct.deleteMany();
    // await prisma.priceAdjustment.deleteMany();
    // await prisma.paymentMethod.deleteMany();
    // await prisma.product.deleteMany();
    // await prisma.order.deleteMany();
    
    let processedOrders = 0;
    let processedProducts = 0;
    
    for (const orderData of orders) {
      try {
        // Create or update products first
        const productIds = [];
        
        for (const productData of orderData.products) {
          // Extract base external ID (remove suffix if present)
          const baseExternalId = productData.externalId.split('-')[0];
          
          // Check if product already exists
          let product = await prisma.product.findUnique({
            where: { externalId: baseExternalId }
          });
          
          if (!product) {
            // Create new product
            product = await prisma.product.create({
              data: {
                externalId: baseExternalId,
                name: productData.name,
                url: productData.url
              }
            });
            processedProducts++;
          }
          
          productIds.push({
            productId: product.id,
            productData: productData
          });
          
          // Handle product eligibilities
          if (productData.eligibility && productData.eligibility.length > 0) {
            for (const eligibility of productData.eligibility) {
              await prisma.productEligibility.upsert({
                where: {
                  productId_eligibility: {
                    productId: product.id,
                    eligibility: eligibility
                  }
                },
                update: {},
                create: {
                  productId: product.id,
                  eligibility: eligibility
                }
              });
            }
          }
        }
        
        // Create the order
        const order = await prisma.order.create({
          data: {
            externalId: orderData.externalId,
            dateTime: new Date(orderData.dateTime),
            url: orderData.url,
            orderStatus: orderData.orderStatus,
            subTotal: orderData.price.subTotal,
            total: orderData.price.total,
            currency: orderData.price.currency
          }
        });
        
        // Create payment methods
        for (const paymentData of orderData.paymentMethods) {
          await prisma.paymentMethod.create({
            data: {
              externalId: paymentData.externalId,
              type: paymentData.type,
              brand: paymentData.brand || null,
              lastFour: paymentData.lastFour || null,
              transactionAmount: paymentData.transactionAmount,
              orderId: order.id
            }
          });
        }
        
        // Create price adjustments
        if (orderData.price.adjustments) {
          for (const adjustment of orderData.price.adjustments) {
            await prisma.priceAdjustment.create({
              data: {
                type: adjustment.type,
                label: adjustment.label,
                amount: adjustment.amount,
                orderId: order.id
              }
            });
          }
        }
        
        // Create order products (junction table)
        for (const { productId, productData } of productIds) {
          await prisma.orderProduct.create({
            data: {
              quantity: productData.quantity,
              subTotal: productData.price.subTotal,
              total: productData.price.total,
              currency: productData.price.currency,
              unitPrice: productData.price.unitPrice,
              orderId: order.id,
              productId: productId
            }
          });
        }
        
        processedOrders++;
        
        if (processedOrders % 10 === 0) {
          console.log(`Processed ${processedOrders}/${orders.length} orders...`);
        }
        
      } catch (orderError) {
        console.error(`Error processing order ${orderData.externalId}:`, orderError.message);
        continue;
      }
    }
    
    console.log('\n=== Seeding Complete ===');
    console.log(`✅ Successfully processed ${processedOrders} orders`);
    console.log(`✅ Successfully processed ${processedProducts} unique products`);
    
    // Display some statistics
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalPaymentMethods = await prisma.paymentMethod.count();
    const totalAdjustments = await prisma.priceAdjustment.count();
    
    console.log('\n=== Database Statistics ===');
    console.log(`📊 Total Orders: ${totalOrders}`);
    console.log(`📊 Total Products: ${totalProducts}`);
    console.log(`📊 Total Payment Methods: ${totalPaymentMethods}`);
    console.log(`📊 Total Price Adjustments: ${totalAdjustments}`);
    
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  });

export default main;