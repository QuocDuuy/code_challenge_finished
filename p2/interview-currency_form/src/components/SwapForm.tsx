import React, { useState, useMemo, useEffect } from "react";
import { useFetchPrices } from "../hooks/useFetchPrices";
import TokenSelector from "./TokenSelector";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";

// 1. Separate reset function for reusability
const resetLocalStorage = () => {
  localStorage.removeItem("swap_from");
  localStorage.removeItem("swap_to");
  localStorage.removeItem("swap_amount");
};

const SwapForm: React.FC = () => {
  // Assuming useFetchPrices now returns { tokens, loading, error }
  // We'll only destructure tokens and loading for simplicity as error handling wasn't explicitly added here.
  const { tokens, loading } = useFetchPrices(); 

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [maxAmountExceeded, setMaxAmountExceeded] = useState(false); // Error state

  // Grouped useEffect to Load old data 
  useEffect(() => {
    const savedFrom = localStorage.getItem("swap_from");
    const savedTo = localStorage.getItem("swap_to");
    const savedAmount = localStorage.getItem("swap_amount");
    if (savedFrom) setFromToken(savedFrom);
    if (savedTo) setToToken(savedTo);
    if (savedAmount) setAmount(savedAmount);
  }, []);

  // Grouped useEffect for Auto-saving data
  useEffect(() => {
    // Only save when a value exists
    if (fromToken) localStorage.setItem("swap_from", fromToken);
    if (toToken) localStorage.setItem("swap_to", toToken);
    if (amount) localStorage.setItem("swap_amount", amount);
  }, [fromToken, toToken, amount]);

  // Logic to Swap Token Positions
  const handleSwitchTokens = () => {
    // Swap positions
    setFromToken(toToken);
    setToToken(fromToken);
  };

  // Logic to Calculate Exchange Rate (Price FROM / Price TO)
  const exchangeRate = useMemo(() => {
    const from = tokens.find((t) => t.currency === fromToken);
    const to = tokens.find((t) => t.currency === toToken);
    
    // Return 0 if tokens are not found, or if TO price is 0 to avoid division by zero
    if (!from || !to || to.price === 0) return 0;

    // Rate: How many units of TO are received for 1 unit of FROM
    return from.price / to.price;
  }, [fromToken, toToken, tokens]);

  // Calculate received amount
  const receiveAmount = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;
    return num * exchangeRate;
  }, [amount, exchangeRate]);

  // Update Validation and Max Amount Handling 
  const MAX_SWAP_AMOUNT = 1_000_000_000;
  
  const isInvalid =
    !fromToken ||
    !toToken ||
    fromToken === toToken ||
    !amount ||
    parseFloat(amount) <= 0 ||
    maxAmountExceeded; // Use error state for validation

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseFloat(val);
    
    // Update error state
    if (num > MAX_SWAP_AMOUNT) {
      setMaxAmountExceeded(true);
    } else {
      setMaxAmountExceeded(false);
      // setAmount(val); // Removed redundant setAmount here, kept one below
    }
    // Always update amount state to allow user to type, even if it exceeds the limit (error message will show)
    setAmount(val); 
  };

  // Swap Handler
  const handleSwap = async () => {
    if (isInvalid) return;
    setIsSwapping(true);

    // Fake 2-second loading
    await new Promise((r) => setTimeout(r, 2000));

    alert(`Swap simulated!\nYou received ${receiveAmount.toFixed(6)} ${toToken}`);

    // Clear data after successful swap and reset state
    resetLocalStorage();
    setFromToken("");
    setToToken("");
    setAmount("");
    setMaxAmountExceeded(false);

    setIsSwapping(false);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-6 w-[400px] text-center">
        <p>Loading tokens...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-[400px] space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">Currency Swap</h2>

      {/* Amount input */}
      <div>
        <label className="text-sm font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange} // Use new handler
          placeholder="Enter amount"
          className={`border rounded-lg p-2 w-full ${maxAmountExceeded ? "border-red-500" : "border-gray-300"}`}
        />
        {maxAmountExceeded && (
          <p className="text-red-500 text-xs mt-1">
            Amount exceeds maximum limit ({MAX_SWAP_AMOUNT.toLocaleString()}).
          </p>
        )}
      </div>

      {/* Token Selectors Container */}
      <div className="flex items-center space-x-2">
        {/* Token From */}
        <div className="flex-1">
          <label className="text-sm font-medium">From</label>
          <TokenSelector tokens={tokens} selected={fromToken} onChange={setFromToken} />
        </div>

        {/* Switch Button*/}
        <button
          onClick={handleSwitchTokens}
          title="Swap tokens"
          className="p-2 mt-5 text-gray-600 hover:text-blue-500 transition duration-150"
        >
          <HiOutlineSwitchHorizontal size={24} />
        </button>

        {/* Token To */}
        <div className="flex-1">
          <label className="text-sm font-medium">To</label>
          <TokenSelector tokens={tokens} selected={toToken} onChange={setToToken} />
        </div>
      </div>

      {/* Result */}
      <div className="bg-gray-50 border rounded-lg p-2">
        <p className="text-sm text-gray-600">You will receive:</p>
        <p className="text-lg font-semibold">
          {receiveAmount.toFixed(6)} {toToken || "—"}
        </p>
      </div>

      {/* Swap Button */}
      <button
        disabled={isInvalid || isSwapping}
        onClick={handleSwap}
        className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg mt-2 disabled:opacity-50 hover:bg-blue-600 transition duration-150"
      >
        {isSwapping ? "Swapping..." : "Swap"}
      </button>
      
      {/* General validation message */}
      {isInvalid && !maxAmountExceeded && (
          <p className="text-red-500 text-xs mt-1 text-center">
            Please select two different tokens and enter a valid amount.
          </p>
      )}
    </div>
  );
};

export default SwapForm;