import { useEffect, useState } from "react";
import type { Token } from "../types/token";

// Define the raw data type received from the API
interface RawToken {
  currency: string;
  price: number | null | undefined;
}

export const useFetchPrices = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("https://interview.switcheo.com/prices.json");

        // Check for HTTP errors (404, 500, etc.)
        if (!res.ok) {
          throw new Error(`Failed to fetch prices: ${res.status} ${res.statusText}`);
        }

        const data: RawToken[] = await res.json();

        // Data is an array => filter for tokens with valid prices
        const filtered: Token[] = data
          // Explicitly cast and only take items with valid price and currency
          .filter((item): item is RawToken & { price: number } => 
              !!item.price && !!item.currency
          )
          .map((item) => ({
            currency: item.currency,
            price: item.price,
            // Keep icon URL generation here
            icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency}.svg`,
          }));

        setTokens(filtered);
        setError(null); // Reset error on success

      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while fetching data.";
        console.error("Error fetching prices:", e);
        setError(errorMessage); // Update error state
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Return all states including error
  return { tokens, loading, error };
};