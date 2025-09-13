'use client'

import { useState } from 'react'
import { saveUserTransaction, type TransactionData, type SaveTransactionResult } from '../server-actions/saveUserTransaction'

export default function SaveTestPage() {
  const [formData, setFormData] = useState<TransactionData>({
    amount: 0,
    currency: 'USD',
    direction: 'out',
    metadata: {},
    source: ''
  })
  const [metadataInput, setMetadataInput] = useState('')
  const [result, setResult] = useState<SaveTransactionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Parse metadata if provided
      let metadata = {}
      if (metadataInput.trim()) {
        try {
          metadata = JSON.parse(metadataInput)
        } catch {
          setResult({ success: false, error: 'Invalid JSON in metadata field' })
          setLoading(false)
          return
        }
      }

      const transactionData: TransactionData = {
        ...formData,
        metadata
      }

      const response = await saveUserTransaction(transactionData)
      setResult(response)
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      })
    } finally {
      setLoading(false)
    }
  }

  const fillSampleData = () => {
    setFormData({
      amount: 25.99,
      currency: 'USD',
      direction: 'out',
      metadata: {},
      source: 'doordash'
    })
    setMetadataInput(JSON.stringify({
      orderId: 'DD-' + Date.now(),
      merchant: 'Test Restaurant',
      category: 'food_delivery'
    }, null, 2))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Save Transaction Test
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction *
                </label>
                <select
                  required
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in">In (Credit)</option>
                  <option value="out">Out (Debit)</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source *
                </label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="doordash, ubereats, manual"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metadata (JSON)
              </label>
              <textarea
                rows={4}
                value={metadataInput}
                onChange={(e) => setMetadataInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"orderId": "12345", "merchant": "Restaurant Name"}'
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
              
              <button
                type="button"
                onClick={fillSampleData}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Fill Sample Data
              </button>
            </div>
          </form>
          
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Result:</h3>
              <div className={`p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}