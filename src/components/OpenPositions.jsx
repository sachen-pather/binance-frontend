import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function OpenPositions({ positions = [], equity = 0 }) {
  // Default to empty array if positions is undefined or null
  const validPositions = Array.isArray(positions) ? positions : [];

  // Calculate totals
  const totalPositionValue = validPositions.reduce(
    (total, pos) => total + (pos.current_value || 0),
    0
  );

  const totalUnrealizedPnL = validPositions.reduce(
    (total, pos) => total + (pos.pnl || 0),
    0
  );

  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `$${parseFloat(value).toFixed(2)}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "N/A";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border shadow-dark-md overflow-hidden">
      <div className="border-b border-dark-border px-5 py-4">
        <h2 className="text-xl font-semibold">Open Positions</h2>
      </div>

      <div className="p-5">
        {validPositions.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-dark-text-secondary border-b border-dark-border">
                    <th className="text-left pb-2">Symbol</th>
                    <th className="text-left pb-2">Side</th>
                    <th className="text-right pb-2">Entry</th>
                    <th className="text-right pb-2">Current</th>
                    <th className="text-right pb-2">P&L</th>
                    <th className="text-right pb-2">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {validPositions.map((position, index) => (
                    <tr
                      key={index}
                      className={`border-b border-dark-border ${
                        index % 2 === 0
                          ? "bg-dark-background bg-opacity-30"
                          : ""
                      }`}
                    >
                      <td className="py-2 font-medium">{position.symbol}</td>
                      <td>
                        {position.side === "BUY" ? (
                          <span className="flex items-center text-dark-accent-green text-xs">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            BUY
                          </span>
                        ) : (
                          <span className="flex items-center text-dark-accent-red text-xs">
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                            SELL
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        {formatCurrency(position.entry_price)}
                      </td>
                      <td className="text-right">
                        {formatCurrency(position.current_price)}
                      </td>
                      <td
                        className={`text-right ${
                          position.pnl >= 0
                            ? "text-dark-accent-green"
                            : "text-dark-accent-red"
                        }`}
                      >
                        {formatCurrency(position.pnl)}
                      </td>
                      <td
                        className={`text-right ${
                          position.pnl_percentage >= 0
                            ? "text-dark-accent-green"
                            : "text-dark-accent-red"
                        }`}
                      >
                        {formatPercentage(position.pnl_percentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-dark-border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-dark-text-secondary">
                  Total Position Value:
                </div>
                <div className="text-right">
                  {formatCurrency(totalPositionValue)}
                </div>

                <div className="text-dark-text-secondary">
                  Total Unrealized P&L:
                </div>
                <div
                  className={`text-right ${
                    totalUnrealizedPnL >= 0
                      ? "text-dark-accent-green"
                      : "text-dark-accent-red"
                  }`}
                >
                  {formatCurrency(totalUnrealizedPnL)} (
                  {formatPercentage((totalUnrealizedPnL / equity) * 100)})
                </div>

                <div className="text-dark-text-secondary">
                  Total Account Value:
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(equity + totalUnrealizedPnL)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-dark-text-muted">
            <p className="text-center">No open positions</p>
            <p className="text-sm mt-1">Waiting for trade signals...</p>
          </div>
        )}
      </div>
    </div>
  );
}
