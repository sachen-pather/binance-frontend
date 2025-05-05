import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function ClosedTrades({ trades = [] }) {
  // Default to empty array if trades is undefined or null
  const validTrades = Array.isArray(trades) ? trades : [];

  // Calculate win rate
  const winningTrades = validTrades.filter(
    (trade) =>
      (trade.pnl && trade.pnl > 0) || (trade.net_pnl && trade.net_pnl > 0)
  );

  const winRate = validTrades.length
    ? (winningTrades.length / validTrades.length) * 100
    : 0;

  // Calculate total P&L
  const totalPnL = validTrades.reduce(
    (total, trade) => total + (trade.pnl || trade.net_pnl || 0),
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
        <h2 className="text-xl font-semibold">Recent Closed Trades</h2>
      </div>

      <div className="p-5">
        {validTrades.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-dark-text-secondary border-b border-dark-border">
                    <th className="text-left pb-2">Symbol</th>
                    <th className="text-left pb-2">Side</th>
                    <th className="text-right pb-2">Entry</th>
                    <th className="text-right pb-2">Exit</th>
                    <th className="text-right pb-2">P&L</th>
                    <th className="text-right pb-2">P&L %</th>
                    <th className="text-right pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {validTrades.map((trade, index) => {
                    // Get the P&L value (could be either pnl or net_pnl in the data)
                    const pnlValue = trade.pnl || trade.net_pnl || 0;

                    return (
                      <tr
                        key={index}
                        className={`border-b border-dark-border ${
                          index % 2 === 0
                            ? "bg-dark-background bg-opacity-30"
                            : ""
                        }`}
                      >
                        <td className="py-2 font-medium">{trade.symbol}</td>
                        <td>
                          {trade.side === "BUY" ? (
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
                          {formatCurrency(trade.entry_price)}
                        </td>
                        <td className="text-right">
                          {formatCurrency(trade.exit_price)}
                        </td>
                        <td
                          className={`text-right ${
                            pnlValue >= 0
                              ? "text-dark-accent-green"
                              : "text-dark-accent-red"
                          }`}
                        >
                          {formatCurrency(pnlValue)}
                        </td>
                        <td
                          className={`text-right ${
                            pnlValue >= 0
                              ? "text-dark-accent-green"
                              : "text-dark-accent-red"
                          }`}
                        >
                          {formatPercentage(trade.pnl_percentage)}
                        </td>
                        <td className="text-right text-dark-text-secondary">
                          {trade.exit_time || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-dark-border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-dark-text-secondary">Win Rate:</div>
                <div className="text-right">{formatPercentage(winRate)}</div>

                <div className="text-dark-text-secondary">
                  Total Realized P&L:
                </div>
                <div
                  className={`text-right ${
                    totalPnL >= 0
                      ? "text-dark-accent-green"
                      : "text-dark-accent-red"
                  }`}
                >
                  {formatCurrency(totalPnL)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-dark-text-muted">
            <p className="text-center">No closed trades</p>
            <p className="text-sm mt-1">
              Trades will appear here after closing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
