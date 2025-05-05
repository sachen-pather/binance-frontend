"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import MarketData from "./components/MarketData";
import Indicators from "./components/Indicators";
import Opportunities from "./components/Opportunities";
import Trades from "./components/Trades";
import OpenPositions from "./components/OpenPositions";
import ClosedTrades from "./components/ClosedTrades";
import RiskParams from "./components/RiskParams";

function App() {
  const [data, setData] = useState({
    timestamp: "",
    paper_trade: true,
    equity: 0,
    market_regime: "",
    opportunities: [],
    executed_trades: [],
    open_positions: [],
    closed_trades: [],
    market_data: { BTC: {}, ETH: {} },
    risk_params: {},
    performance: {
      daily_pnl: 0,
      total_pnl: 0,
      win_rate: 0,
    },
  });

  // Track connection status
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  // Track last time data was received
  const [lastDataTime, setLastDataTime] = useState("No data yet");

  // Use refs to persist these values between renders without causing re-renders
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const lastDataReceivedRef = useRef(Date.now());

  // Max reconnection attempts
  const MAX_RECONNECT_ATTEMPTS = 10;
  // Heartbeat interval (20 seconds)
  const HEARTBEAT_INTERVAL = 20000;
  // Connection timeout (if no data received in 2 minutes, reconnect)
  const CONNECTION_TIMEOUT = 120000;

  // Helper function to find arrays with specific names anywhere in the object structure
  const findArrayInObject = (obj, arrayName) => {
    // If this is the array we're looking for
    if (arrayName in obj && Array.isArray(obj[arrayName])) {
      return obj[arrayName];
    }

    // If the object contains properties, search recursively
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        // Skip prototype properties
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        // Check if the current key matches our target and the value is an array
        if (key === arrayName && Array.isArray(value)) {
          return value;
        }

        // If value is an object, search recursively
        if (value && typeof value === "object") {
          const result = findArrayInObject(value, arrayName);
          if (result) return result;
        }
      }
    }

    // If we get here, we didn't find the array
    return null;
  };

  // Helper function to find a value by key anywhere in an object
  const findValueInObject = (obj, keyName) => {
    // If this is the key we're looking for
    if (keyName in obj) {
      return obj[keyName];
    }

    // If the object contains properties, search recursively
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        // Skip prototype properties
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        // Check if the current key matches our target
        if (key === keyName) {
          return value;
        }

        // If value is an object, search recursively
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const result = findValueInObject(value, keyName);
          if (result !== undefined) return result;
        }
      }
    }

    // If we get here, we didn't find the key
    return undefined;
  };

  const connectWebSocket = () => {
    // Clean up any existing connection
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "Reconnecting");
      } catch (e) {
        console.error("Error closing existing WebSocket:", e);
      }
    }

    console.log("Attempting to connect to WebSocket...");
    setConnectionStatus("connecting");

    // Create a new WebSocket connection
    wsRef.current = new WebSocket("ws://localhost:8765");

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus("connected");
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      lastDataReceivedRef.current = Date.now();

      // Set up a heartbeat to keep the connection alive
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

      pingIntervalRef.current = setInterval(() => {
        // Check if we've received data recently
        const now = Date.now();
        const timeSinceLastData = now - lastDataReceivedRef.current;

        if (timeSinceLastData > CONNECTION_TIMEOUT) {
          console.warn(
            `No data received in ${
              CONNECTION_TIMEOUT / 1000
            } seconds. Reconnecting...`
          );
          if (wsRef.current) {
            wsRef.current.close(3000, "Connection timeout");
          }
          return;
        }

        // Send a ping message
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: "ping",
                timestamp: new Date().toISOString(),
              })
            );
          } catch (error) {
            console.warn(
              "Could not send ping, connection may be unstable:",
              error
            );
          }
        }
      }, HEARTBEAT_INTERVAL);
    };

    wsRef.current.onmessage = (event) => {
      // Update the last data received timestamp
      lastDataReceivedRef.current = Date.now();
      setLastDataTime(new Date().toLocaleTimeString());

      try {
        const newData = JSON.parse(event.data);

        // Log the received data, but not too often to avoid console spam
        // Only log complete data with timestamp changes to reduce console noise
        if (newData.timestamp && newData.timestamp !== data.timestamp) {
          console.log(`Data received at: ${new Date().toISOString()}`);

          // Extract key data
          const extractedOpportunities = findArrayInObject(
            newData,
            "opportunities"
          );
          const extractedTrades = findArrayInObject(newData, "executed_trades");
          const extractedOpenPositions = findArrayInObject(
            newData,
            "open_positions"
          );
          const extractedClosedTrades =
            findArrayInObject(newData, "closed_trades") ||
            findArrayInObject(newData, "recent_closed_trades");

          // Extract performance metrics
          const dailyPnl = findValueInObject(newData, "daily_pnl");
          const totalPnl = findValueInObject(newData, "total_pnl");
          const winRate = findValueInObject(newData, "win_rate");

          // Log what we found with the recursive search
          console.log("Data found in message:", {
            opportunities: extractedOpportunities
              ? extractedOpportunities.length
              : 0,
            executed_trades: extractedTrades ? extractedTrades.length : 0,
            open_positions: extractedOpenPositions
              ? extractedOpenPositions.length
              : 0,
            closed_trades: extractedClosedTrades
              ? extractedClosedTrades.length
              : 0,
            daily_pnl: dailyPnl,
            total_pnl: totalPnl,
            win_rate: winRate,
          });
        }

        // Check if newData has the expected structure before updating state
        if (newData && typeof newData === "object") {
          // Handle pong response if any
          if (newData.type === "pong") {
            console.log("Received pong from server");
            return;
          }

          // Process meaningful data updates with recursive search
          setData((prevData) => {
            // Use the recursive search to find arrays anywhere in the object
            const extractedOpportunities = findArrayInObject(
              newData,
              "opportunities"
            );
            const extractedTrades = findArrayInObject(
              newData,
              "executed_trades"
            );
            const extractedOpenPositions = findArrayInObject(
              newData,
              "open_positions"
            );
            const extractedClosedTrades =
              findArrayInObject(newData, "closed_trades") ||
              findArrayInObject(newData, "recent_closed_trades");

            // Extract performance metrics
            const dailyPnl =
              findValueInObject(newData, "daily_pnl") ||
              prevData.performance.daily_pnl;
            const totalPnl =
              findValueInObject(newData, "total_pnl") ||
              prevData.performance.total_pnl;
            const winRate =
              findValueInObject(newData, "win_rate") ||
              prevData.performance.win_rate;

            // Create a safe new data object with all the extracted info
            const safeNewData = {
              ...newData,
              opportunities: extractedOpportunities || [],
              executed_trades: extractedTrades || [],
              open_positions: extractedOpenPositions || [],
              closed_trades: extractedClosedTrades || [],
              performance: {
                daily_pnl: dailyPnl,
                total_pnl: totalPnl,
                win_rate: winRate,
              },
            };

            // Compare with previous data to see if anything important changed
            if (JSON.stringify(prevData) !== JSON.stringify(safeNewData)) {
              return safeNewData;
            }
            return prevData;
          });
        } else {
          console.error("Invalid data structure received:", newData);
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
        console.error("Raw message:", event.data);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log(
        `WebSocket closed with code: ${event.code}, reason: ${event.reason}`
      );
      setConnectionStatus("disconnected");

      // Clear the ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Don't attempt to reconnect if this was a normal closure
      if (event.code === 1000) {
        console.log("WebSocket closed normally");
        return;
      }

      // Attempt to reconnect with exponential backoff
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const timeout = Math.min(
          1000 * Math.pow(1.5, reconnectAttemptsRef.current),
          30000
        );
        console.log(
          `Attempting to reconnect in ${timeout / 1000} seconds... (Attempt ${
            reconnectAttemptsRef.current + 1
          }/${MAX_RECONNECT_ATTEMPTS})`
        );

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Set a new timeout for reconnecting
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, timeout);
      } else {
        console.error(
          "Max reconnection attempts reached. Please refresh the page."
        );
        setConnectionStatus("failed");
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      // Let onclose handle reconnection
    };
  };

  // Function to manually reconnect - can be called from a button
  const handleReconnect = () => {
    console.log("Manual reconnection requested");
    reconnectAttemptsRef.current = 0; // Reset attempts for manual reconnection
    connectWebSocket();
  };

  useEffect(() => {
    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      // Clear all timers
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Close the WebSocket connection if it exists
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, "Component unmounting");
        } catch (e) {
          console.error("Error during WebSocket cleanup:", e);
        }
      }

      console.log("WebSocket cleanup complete");
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="min-h-screen bg-dark-background text-dark-text-primary p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Connection status indicator */}
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-opacity-20 border border-dark-border">
              {connectionStatus === "connected" ? (
                <span className="flex items-center text-dark-accent-green">
                  <span className="w-2 h-2 rounded-full bg-dark-accent-green mr-2"></span>
                  Connected
                </span>
              ) : connectionStatus === "connecting" ? (
                <span className="flex items-center text-dark-accent-yellow">
                  <span className="w-2 h-2 rounded-full bg-dark-accent-yellow mr-2 animate-pulse"></span>
                  Connecting...
                </span>
              ) : connectionStatus === "error" ||
                connectionStatus === "failed" ? (
                <span className="flex items-center text-dark-accent-red">
                  <span className="w-2 h-2 rounded-full bg-dark-accent-red mr-2"></span>
                  Connection Error
                </span>
              ) : (
                <span className="flex items-center text-dark-accent-red">
                  <span className="w-2 h-2 rounded-full bg-dark-accent-red mr-2"></span>
                  Disconnected
                </span>
              )}
            </div>

            {/* Trading mode indicator */}
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-opacity-20 border border-dark-border">
              {data.paper_trade ? (
                <span className="flex items-center text-dark-accent-yellow">
                  <span className="w-2 h-2 rounded-full bg-dark-accent-yellow mr-2"></span>
                  Paper Trading
                </span>
              ) : (
                <span className="flex items-center text-dark-accent-green">
                  <span className="w-2 h-2 rounded-full bg-dark-accent-green mr-2"></span>
                  Live Trading
                </span>
              )}
            </div>

            {/* Manual reconnect button - only show when disconnected */}
            {connectionStatus !== "connected" &&
              connectionStatus !== "connecting" && (
                <button
                  onClick={handleReconnect}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-dark-accent-blue text-white hover:bg-opacity-80 transition-colors"
                >
                  Reconnect
                </button>
              )}
          </div>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-dark-accent-blue to-dark-accent-purple opacity-50"></div>

        {/* Last data update timestamp */}
        <div className="text-sm text-gray-400 mt-2 flex justify-between">
          <span>Last update: {data.timestamp || "Waiting for data..."}</span>
          <span>Last received: {lastDataTime}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MarketData marketData={data.market_data} timestamp={data.timestamp} />
        <Indicators
          indicators={
            data.market_data && data.market_data.BTC
              ? data.market_data.BTC.indicators || {}
              : {}
          }
          signalConditions={
            data.market_data && data.market_data.BTC
              ? data.market_data.BTC.signal_conditions || {}
              : {}
          }
          params={
            data.market_data && data.market_data.BTC
              ? data.market_data.BTC.indicator_params || {}
              : {}
          }
        />
        <Opportunities opportunities={data.opportunities} />

        {/* Open Positions Component */}
        <OpenPositions positions={data.open_positions} equity={data.equity} />

        {/* Closed Trades Component */}
        <ClosedTrades trades={data.closed_trades} />

        <RiskParams
          params={data.risk_params}
          equity={data.equity}
          marketRegime={data.market_regime}
          performance={data.performance}
        />
      </div>

      {/* Debug section with enhanced functionality */}
      <div className="mt-8 p-4 bg-gray-800 rounded-md text-xs">
        <h3 className="text-gray-400 mb-2">Debug Info</h3>
        <div>
          <p>Connection Status: {connectionStatus}</p>
          <p>
            WebSocket State:{" "}
            {wsRef.current ? wsRef.current.readyState : "No connection"}
          </p>
          <p>
            Reconnect Attempts: {reconnectAttemptsRef.current}/
            {MAX_RECONNECT_ATTEMPTS}
          </p>
          <p>
            Opportunities Count:{" "}
            {data.opportunities ? data.opportunities.length : 0}
          </p>
          <p>
            Open Positions Count:{" "}
            {data.open_positions ? data.open_positions.length : 0}
          </p>
          <p>
            Closed Trades Count:{" "}
            {data.closed_trades ? data.closed_trades.length : 0}
          </p>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => {
                console.log("Current state:", data);
                console.log("WebSocket:", wsRef.current);
                console.log("Open Positions:", data.open_positions);
                console.log("Closed Trades:", data.closed_trades);
              }}
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Log State
            </button>
            <button
              onClick={() => {
                // Force a re-render with a small data manipulation
                setData((prev) => ({
                  ...prev,
                  timestamp: new Date().toISOString(),
                }));
              }}
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Refresh UI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
