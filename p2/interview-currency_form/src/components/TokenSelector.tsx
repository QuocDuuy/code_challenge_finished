import React, { useState } from "react";
import type { Token } from "../types/token";

interface Props {
  tokens: Token[];
  selected: string;
  onChange: (value: string) => void;
}

// Separate Image Component to reuse onError logic
const TokenIcon: React.FC<{ currency: string; size?: string }> = ({ currency, size = "w-5 h-5" }) => (
  <img
    src={`/tokens/${currency}.svg`}
    alt={currency}
    className={size}
    // Image fallback logic written once
    onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/tokens/default.svg")}
  />
);

const TokenSelector: React.FC<Props> = ({ tokens, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectedToken = tokens.find((t) => t.currency === selected);

  return (
    <div className="relative">
      {/* Display current selection */}
      <button
        type="button"
        className="w-full border rounded-lg p-2 flex items-center justify-between hover:bg-gray-50 transition duration-150"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox" // A11y improvement
        aria-expanded={open} // A11y improvement
      >
        <div className="flex items-center space-x-2">
          {selectedToken ? (
            <TokenIcon currency={selectedToken.currency} />
          ) : (
            <span className="text-gray-400">Select token</span>
          )}
          <span className="font-medium">{selectedToken?.currency || ""}</span>
        </div>
        <span>{open ? "▲" : "▼"}</span> {/* Change arrow when open/closed */}
      </button>

      {/* Token list */}
      {open && (
        <div 
          className="absolute z-10 bg-white border rounded-lg shadow-xl mt-1 w-full max-h-60 overflow-y-auto"
          role="listbox" // A11y improvement
        >
          {/* Add search input here if needed */}
          {tokens.map((token) => (
            <div
              key={token.currency}
              className={`flex items-center space-x-2 p-2 cursor-pointer ${
                token.currency === selected ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                onChange(token.currency);
                setOpen(false); // Close dropdown after selection
              }}
              role="option" // A11y improvement
              aria-selected={token.currency === selected} // A11y improvement
            >
              <TokenIcon currency={token.currency} />
              <span>{token.currency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;