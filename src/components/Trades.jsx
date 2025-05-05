import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Trades({ trades = [], paperTrade = true }) {
  // Add debugging console logs
  console.log("Trades component received:", trades);
  console.log("Paper trade mode:", paperTrade);

  // Default to empty array if trades is undefined or null
  const validTrades = Array.isArray(trades) ? trades : [];

  // Log details about the first trade if present
  if (validTrades.length > 0) {
    console.log("First trade details:", {
      symbol: validTrades[0].symbol,
      side: validTrades[0].side,
      entry_price: validTrades[0].entry_price,
      typeof_entry_price: typeof validTrades[0].entry_price,
      quantity: validTrades[0].quantity,
      timestamp: validTrades[0].timestamp,
    });
  }

  // Helper function to safely format numbers
  const safeFormat = (value, decimals = 2) => {
    if (value === undefined || value === null) return "N/A";

    // Try to convert to number if it's a string
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    // Check if it's a valid number after conversion
    if (typeof numValue === "number" && !isNaN(numValue)) {
      // Handle small decimal values (like crypto prices) differently
      if (Math.abs(numValue) < 0.01 && numValue !== 0) {
        return numValue.toExponential(decimals);
      }
      return numValue.toFixed(decimals);
    }

    // If all else fails, return as is
    return value.toString();
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border shadow-dark-md overflow-hidden">
      <div className="border-b border-dark-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Executed Trades</h2>
          {paperTrade ? (
            <span className="px-2 py-1 bg-dark-accent-yellow bg-opacity-20 text-dark-accent-yellow text-xs rounded-md">
              Paper
            </span>
          ) : (
            <span className="px-2 py-1 bg-dark-accent-green bg-opacity-20 text-dark-accent-green text-xs rounded-md">
              Live
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        {validTrades.length > 0 ? (
          <ul className="space-y-4">
            {validTrades.map((trade, index) => (
              <li
                key={index}
                className="p-3 rounded-lg bg-dark-background border border-dark-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {trade?.symbol || "Unknown"}
                    </span>
                    {trade?.side === "BUY" ? (
                      <span className="text-dark-accent-green flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />
                        {trade.side}
                      </span>
                    ) : (
                      <span className="text-dark-accent-red flex items-center gap-1">
                        <ArrowDownRight className="w-4 h-4" />
                        {trade?.side || "SELL"}
                      </span>
                    )}
                  </div>
                  <span className="text-dark-text-secondary text-sm">
                    {trade?.timestamp || ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dark-text-secondary">
                    Entry Price:{" "}
                    <span className="text-dark-text-primary">
                      ${safeFormat(trade?.entry_price)}
                    </span>
                  </span>
                  {trade?.quantity && (
                    <span className="text-dark-text-secondary">
                      Quantity:{" "}
                      <span className="text-dark-text-primary">
                        {typeof trade.quantity === "number"
                          ? safeFormat(trade.quantity, 6)
                          : trade.quantity}
                      </span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-dark-text-muted">
            <p className="text-center">No trades executed</p>
            <p className="text-sm mt-1">Waiting for trade signals...</p>
          </div>
        )}
      </div>
    </div>
  );
}
