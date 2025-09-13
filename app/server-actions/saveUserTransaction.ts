'use server'

import { PrismaClient, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export interface TransactionData {
  amount: number
  currency: string
  direction: string
  metadata: Prisma.JsonValue
  source: string
}

export interface SaveTransactionResult {
  success: boolean
  transaction?: {
    id: string
    amount: number
    currency: string
    direction: string
    metadata: Prisma.JsonValue
    source: string
    timestamp: Date
  }
  error?: string
}

export async function saveUserTransaction(
  data: TransactionData
): Promise<SaveTransactionResult> {
  try {
    // Validate required fields
    if (!data.amount || !data.currency || !data.direction || !data.source) {
      return {
        success: false,
        error: 'Missing required fields: amount, currency, direction, and source are required'
      }
    }

    // Validate amount is a valid number
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
      return {
        success: false,
        error: 'Amount must be a valid number'
      }
    }

    // Validate direction is either 'in' or 'out'
    if (!['in', 'out', 'credit', 'debit'].includes(data.direction.toLowerCase())) {
      return {
        success: false,
        error: 'Direction must be one of: in, out, credit, debit'
      }
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: Math.round(data.amount), // Store as integer (cents)
        currency: data.currency.toUpperCase(),
        direction: data.direction.toLowerCase(),
        metadata: data.metadata || {},
        source: data.source,
        timestamp: new Date()
      }
    })

    // Revalidate any pages that might display transactions
    revalidatePath('/transactions')
    revalidatePath('/dashboard')

    return {
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        direction: transaction.direction,
        metadata: transaction.metadata,
        source: transaction.source,
        timestamp: transaction.timestamp
      }
    }
  } catch (error) {
    console.error('Error saving transaction:', error)
    return {
      success: false,
      error: 'Failed to save transaction. Please try again.'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to get all transactions for a user (optional)
export async function getUserTransactions(
  limit: number = 50,
  offset: number = 0
): Promise<{
  success: boolean
  transactions?: Array<{
    id: string
    amount: number
    currency: string
    direction: string
    metadata: Prisma.JsonValue
    source: string
    timestamp: Date
  }>
  error?: string
}> {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    })

    return {
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        direction: t.direction,
        metadata: t.metadata,
        source: t.source,
        timestamp: t.timestamp
      }))
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return {
      success: false,
      error: 'Failed to fetch transactions'
    }
  } finally {
    await prisma.$disconnect()
  }
}