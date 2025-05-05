import { DollarSign, BarChart3 } from "lucide-react";

export default function RiskParams({ params, equity, marketRegime }) {
  // Helper function to determine market regime color
  const getRegimeColor = (regime) => {
    if (!regime) return "text-dark-text-muted";

    switch (regime.toLowerCase()) {
      case "bullish":
        return "text-dark-accent-green";
      case "bearish":
        return "text-dark-accent-red";
      case "neutral":
        return "text-dark-accent-yellow";
      default:
        return "text-dark-text-primary";
    }
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border shadow-dark-md overflow-hidden">
      <div className="border-b border-dark-border px-5 py-4">
        <h2 className="text-xl font-semibold">Risk Parameters</h2>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-background rounded-lg">
              <DollarSign className="w-5 h-5 text-dark-accent-blue" />
            </div>
            <div>
              <p className="text-dark-text-secondary text-sm">Total Equity</p>
              <p className="text-xl font-bold">
                ${equity?.toFixed(2) || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-background rounded-lg">
              <BarChart3 className="w-5 h-5 text-dark-accent-purple" />
            </div>
            <div>
              <p className="text-dark-text-secondary text-sm">Market Regime</p>
              <p
                className={`text-lg font-medium ${getRegimeColor(
                  marketRegime
                )}`}
              >
                {marketRegime || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">
                Base Position Size
              </p>
              <p className="font-medium">
                {params.base_position_size?.toFixed(1) || "N/A"}%
              </p>
            </div>
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">
                Max Position Size
              </p>
              <p className="font-medium">
                {params.max_position_size?.toFixed(1) || "N/A"}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">
                Max Open Positions
              </p>
              <p className="font-medium">
                {params.max_open_positions || "N/A"}
              </p>
            </div>
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">
                Daily Loss Limit
              </p>
              <p className="font-medium text-dark-accent-red">
                {params.max_daily_loss?.toFixed(1) || "N/A"}%
              </p>
            </div>
          </div>

          <div className="bg-dark-background rounded-lg p-3">
            <p className="text-dark-text-secondary text-xs">Daily P&L</p>
            <p
              className={`font-medium ${
                (params.daily_pnl || 0) >= 0
                  ? "text-dark-accent-green"
                  : "text-dark-accent-red"
              }`}
            >
              ${params.daily_pnl?.toFixed(2) || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
