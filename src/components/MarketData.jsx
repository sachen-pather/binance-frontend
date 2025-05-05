import { ArrowUp, ArrowDown } from "lucide-react";

export default function MarketData({ marketData, timestamp }) {
  // Add safety check for marketData itself before trying to access properties
  const hasData = marketData && Object.keys(marketData).length > 0;
  const btc = hasData && marketData.BTC ? marketData.BTC : {};
  const eth = hasData && marketData.ETH ? marketData.ETH : {};

  // Helper function to determine price change direction
  const getPriceChangeIndicator = (current, previous) => {
    if (!current || !previous) return null;
    return current > previous ? (
      <ArrowUp className="inline text-dark-accent-green w-4 h-4" />
    ) : (
      <ArrowDown className="inline text-dark-accent-red w-4 h-4" />
    );
  };

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border shadow-dark-md overflow-hidden">
      <div className="border-b border-dark-border px-5 py-4">
        <h2 className="text-xl font-semibold">Market Data</h2>
        <p className="text-dark-text-muted text-sm mt-1">
          Last Update: {timestamp || "Waiting for data..."}
        </p>
      </div>

      <div className="p-5 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dark-accent-yellow"></div>
              BTC/USDT
            </h3>
            <span className="text-xl font-bold">
              ${btc.price?.toFixed(2) || "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">High (1min)</p>
              <p className="font-medium">${btc.high?.toFixed(2) || "N/A"}</p>
            </div>
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">Low (1min)</p>
              <p className="font-medium">${btc.low?.toFixed(2) || "N/A"}</p>
            </div>
            <div className="bg-dark-background rounded-lg p-3">
              <p className="text-dark-text-secondary text-xs">Volume</p>
              <p className="font-medium">{btc.volume?.toFixed(2) || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dark-accent-purple"></div>
              ETH/USDT
            </h3>
            <span className="text-xl font-bold">
              ${eth.price?.toFixed(2) || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
