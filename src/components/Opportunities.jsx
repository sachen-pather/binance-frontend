import { TrendingUp, TrendingDown } from "lucide-react";

export default function Opportunities({ opportunities = [] }) {
  // Add debugging console logs
  console.log("Opportunities component received:", opportunities);

  // Default to empty array if opportunities is undefined or null
  const validOpportunities = Array.isArray(opportunities) ? opportunities : [];

  // Log details about the first opportunity if present
  if (validOpportunities.length > 0) {
    console.log("First opportunity details:", {
      symbol: validOpportunities[0].symbol,
      signal: validOpportunities[0].signal,
      score: validOpportunities[0].score,
      price: validOpportunities[0].price,
      typeof_price: typeof validOpportunities[0].price,
      typeof_score: typeof validOpportunities[0].score,
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
        <h2 className="text-xl font-semibold">Trading Opportunities</h2>
      </div>

      <div className="p-5">
        {validOpportunities.length > 0 ? (
          <ul className="space-y-4">
            {validOpportunities.map((opp, index) => (
              <li
                key={index}
                className="p-3 rounded-lg bg-dark-background border border-dark-border flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {opp?.symbol || "Unknown"}
                    </span>
                    {opp?.signal === "BUY" ? (
                      <span className="text-dark-accent-green flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {opp.signal}
                      </span>
                    ) : (
                      <span className="text-dark-accent-red flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" />
                        {opp?.signal || "SELL"}
                      </span>
                    )}
                  </div>
                  <p className="text-dark-text-secondary text-sm">
                    Price: ${safeFormat(opp?.price)}
                  </p>
                </div>
                <div className="bg-dark-card px-3 py-1 rounded-full text-sm border border-dark-border">
                  Score:{" "}
                  <span className="font-medium">{safeFormat(opp?.score)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-dark-text-muted">
            <p className="text-center">No opportunities found</p>
            <p className="text-sm mt-1">Waiting for market signals...</p>
          </div>
        )}
      </div>
    </div>
  );
}
