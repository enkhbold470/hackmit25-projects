"use client";

import { useApp, Transaction } from "../../context/AppContext";
import { useState, useEffect } from "react";

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const getMerchantInfo = (transaction: Transaction) => {
    if (transaction.merchantId === 19 || transaction.merchantName === 'DoorDash') {
      return {
        name: 'DoorDash',
        logo: '/doordash-logo.jpeg',
        color: 'bg-red-50 border-red-100',
        textColor: 'text-red-600'
      };
    } else if (transaction.merchantId === 36 || transaction.merchantName === 'UberEats') {
      return {
        name: 'UberEats',
        logo: '/ubereats-logo.jpeg',
        color: 'bg-black/5 border-black/10',
        textColor: 'text-black'
      };
    }
    return {
      name: 'Unknown',
      logo: null,
      color: 'bg-gray-50 border-gray-100',
      textColor: 'text-gray-600'
    };
  };

  const merchantInfo = getMerchantInfo(transaction);

  return (
    <div className={`rounded-xl p-4 shadow-sm border ${merchantInfo.color}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {merchantInfo.logo && (
              <img
                src={merchantInfo.logo}
                alt={merchantInfo.name}
                className="w-5 h-5 object-cover rounded"
              />
            )}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${merchantInfo.color} ${merchantInfo.textColor}`}>
              {merchantInfo.name}
            </span>
          </div>
          <h4 className="font-semibold text-foreground mb-1">
            {transaction.restaurant}
          </h4>
          <p className="text-sm text-gray-500">
            {new Date(transaction.date).toLocaleDateString().slice(0, 10)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-foreground">
            ${transaction.amount.toFixed(2)}
          </span>
          {transaction.status && (
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {transaction.status.toLowerCase()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsTab() {
  const { state, userId, refreshData } = useApp();
  const { transactions } = state;
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Don't preload KnotAPI - create fresh instances on each use
      console.log('TransactionsTab mounted - KnotAPI will be loaded per connection');
    }
  }, []);

  const connectMerchant = async (merchantId: number, merchantName: string) => {
    if (!userId) return;

    // Prevent rapid successive calls (add 2 second cooldown)
    const now = Date.now();
    if (now - lastConnectionAttempt < 2000) {
      console.log('⏳ Connection cooldown active, please wait...');
      return;
    }
    setLastConnectionAttempt(now);

    console.log(`Starting connection to ${merchantName} (ID: ${merchantId})`);
    setIsConnecting(merchantName);

    try {
      // Aggressive cleanup of KnotAPI state
      console.log('🧹 Starting aggressive KnotAPI cleanup...');

      if (typeof window !== 'undefined') {
        // Clear any KnotAPI-related items from storage
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('knot') || key.includes('knotapi') || key.includes('transaction'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ Cleared localStorage:', key);
          });

          // Clear sessionStorage too
          const sessionKeysToRemove: string[] = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('knot') || key.includes('knotapi') || key.includes('transaction'))) {
              sessionKeysToRemove.push(key);
            }
          }
          sessionKeysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
            console.log('🗑️ Cleared sessionStorage:', key);
          });
        } catch (storageError) {
          console.log('⚠️ Could not clear storage:', storageError);
        }

        // Clear any existing KnotAPI instances from window/global scope
        // @ts-ignore - Clear potential cached instances
        delete window.KnotAPI;
        // @ts-ignore
        delete window.knotapi;
        // @ts-ignore
        delete window.KnotapiJS;

        // Remove any existing KnotAPI iframes or elements
        const existingFrames = document.querySelectorAll('iframe[src*="knotapi"], div[id*="knotapi"], div[class*="knotapi"]');
        existingFrames.forEach(frame => {
          console.log('🗑️ Removing existing KnotAPI element:', frame.tagName);
          frame.remove();
        });
      }

      // Force reload the module and create a completely fresh instance
      console.log('🔄 Creating completely fresh KnotAPI instance...');

      const KnotapiJS = (await import('knotapi-js')).default;
      const freshKnotapi = new KnotapiJS();
      console.log('✅ Fresh KnotAPI instance created');

      // Create a fresh session each time to ensure SDK auth modal appears
      console.log('Creating new session...');
      const sessionResponse = await fetch("/api/knot/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add timestamp to prevent caching
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        body: JSON.stringify({
          merchantId,
          userId,
          // Add timestamp to ensure uniqueness
          timestamp: Date.now(),
          // Add random value to force new session
          requestId: Math.random().toString(36).substring(7)
        }),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        console.error("Session creation error:", errorData);
        throw new Error(
          `Failed to create session: ${errorData.error || "Unknown error"}`
        );
      }

      const { sessionId } = await sessionResponse.json();
      console.log("Session created successfully:", sessionId);

      const clientId = process.env.NEXT_PUBLIC_KNOT_CLIENT_ID || "";
      console.log("Frontend client ID:", clientId);

      if (!clientId) {
        throw new Error(
          "NEXT_PUBLIC_KNOT_CLIENT_ID environment variable not set"
        );
      }

      console.log("Opening KnotAPI SDK with:", {
        sessionId,
        clientId,
        merchantId,
        merchantName
      });

      console.log('🚀 Opening KnotAPI with fresh session...');

      // Add a small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force the SDK to treat this as a completely new connection
      freshKnotapi.open({
        sessionId,
        clientId,
        environment: "development",
        product: "transaction_link",
        merchantIds: [merchantId],
        entryPoint: `transactions_tab_${merchantName}_${Date.now()}`, // Unique entry point with merchant name
        useCategories: false,
        useSearch: false,
        onSuccess: async (product: string, merchant: string) => {
          console.log("🎉 Authentication successful!", { product, merchant, merchantId });

          try {
            console.log("⏱️ Waiting 3 seconds for KnotAPI to process authentication...");
            // Wait longer for KnotAPI to fully process the authentication
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log("🔄 Starting transaction sync...");
            // Sync transactions with the specific merchant
            const syncResponse = await fetch("/api", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
              },
              body: JSON.stringify({
                userId,
                merchantId,
                product,
                timestamp: Date.now()
              }),
            });

            console.log("Sync response status:", syncResponse.status);

            if (syncResponse.ok) {
              const syncResult = await syncResponse.json();
              console.log("✅ Sync successful:", syncResult);
              console.log("📊 Transactions found:", syncResult.transactions?.length || 0);

              console.log("🔄 Refreshing UI data...");
              await refreshData();
              console.log("✅ UI data refreshed");
            } else {
              const errorText = await syncResponse.text();
              console.error("❌ Sync failed:", errorText);
              // Try to parse as JSON for better error handling
              try {
                const errorJson = JSON.parse(errorText);
                console.error("❌ Sync error details:", errorJson);
              } catch (e) {
                console.error("❌ Raw sync error:", errorText);
              }
            }
          } catch (error) {
            console.error("❌ Error during sync:", error);
          }

          setIsConnecting(null);
        },
        onError: (_product: string, errorCode: string, message: string) => {
          console.error("KnotAPI Error:", errorCode, message);
          setIsConnecting(null);
        },
        onExit: () => {
          setIsConnecting(null);
        },
      });
    } catch (error) {
      console.error("Error connecting to merchant:", error);
      setIsConnecting(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Transactions
            </h2>
            <p className="text-gray-600 text-sm">
              Your food delivery orders during this quest
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => connectMerchant(19, "DoorDash")}
              disabled={isConnecting !== null}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white hover:bg-gray-50 disabled:bg-gray-300 transition-colors shadow-sm border border-gray-200"
              title="Connect DoorDash"
            >
              {isConnecting === "DoorDash" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src="/doordash-logo.jpeg"
                  alt="DoorDash"
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </button>
            <button
              onClick={() => connectMerchant(36, "UberEats")}
              disabled={isConnecting !== null}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white hover:bg-gray-50 disabled:bg-gray-300 transition-colors shadow-sm border border-gray-200"
              title="Connect Uber Eats"
            >
              {isConnecting === "UberEats" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <img
                  src="/ubereats-logo.jpeg"
                  alt="Uber Eats"
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </button>
            {/* Debug/Test button */}
            <button
              onClick={async () => {
                console.log('🗋 Testing transaction sync and refresh...');
                // First test the sync endpoint
                try {
                  const response = await fetch('/api/test-sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                  });
                  const result = await response.json();
                  console.log('🗋 Test sync result:', result);

                  // Then refresh the UI data
                  await refreshData();
                  console.log('✅ Data refreshed successfully');
                } catch (error) {
                  console.error('❌ Test failed:', error);
                }
              }}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm border border-blue-200"
              title="Test Sync (Debug)"
            >
              🗋
            </button>
          </div>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Spent This Quest</p>
            <p className="text-2xl font-bold text-primary">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Connect Your Accounts
            </h3>
            <p className="text-gray-600 mb-4">
              Click the DoorDash or UberEats icons above to connect your accounts and see your transaction history.
            </p>
            <p className="text-sm text-gray-500">
              After connecting, your food delivery orders will automatically appear here and impact your character&apos;s health.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
