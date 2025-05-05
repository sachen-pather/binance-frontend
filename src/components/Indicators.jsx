import { Check, X } from "lucide-react";

export default function Indicators({ indicators, signalConditions, params }) {
  return (
    <div className="bg-dark-card rounded-xl border border-dark-border shadow-dark-md overflow-hidden">
      <div className="border-b border-dark-border px-5 py-4">
        <h2 className="text-xl font-semibold">Technical Indicators</h2>
      </div>

      <div className="p-5">
        {Object.keys(indicators).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(indicators).map(([key, value]) => (
              <div
                key={key}
                className="p-3 rounded-lg bg-dark-background border border-dark-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <span className="text-sm text-dark-text-secondary">
                    {typeof value === "number"
                      ? value.toFixed(2)
                      : value.toString()}
                  </span>
                </div>

                {signalConditions[key] && (
                  <div className="flex items-center mt-1">
                    {signalConditions[key] ? (
                      <Check className="w-4 h-4 text-dark-accent-green mr-1" />
                    ) : (
                      <X className="w-4 h-4 text-dark-accent-red mr-1" />
                    )}
                    <span
                      className={`text-xs ${
                        signalConditions[key]
                          ? "text-dark-accent-green"
                          : "text-dark-accent-red"
                      }`}
                    >
                      {signalConditions[key]
                        ? "Condition met"
                        : "Condition not met"}
                    </span>
                  </div>
                )}

                {params[key] && (
                  <div className="mt-2 text-xs text-dark-text-muted">
                    <span>Parameters: {JSON.stringify(params[key])}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-dark-text-muted">
            <p className="text-center">No indicator data available</p>
            <p className="text-sm mt-1">Waiting for market data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
