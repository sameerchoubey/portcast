// api.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.coincap.io/v2';

// Define the structure of the cryptocurrency data returned by the API
export interface CryptoAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

// Function to fetch the top 100 cryptocurrency assets
export const fetchTopCryptocurrencies = async (): Promise<CryptoAsset[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assets`, {
      params: { limit: 100 },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching top cryptocurrencies:', error);
    throw error;
  }
};

// Function to fetch details of a specific cryptocurrency by ID
export const fetchCryptoDetails = async (id: string): Promise<CryptoAsset> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assets/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching details for cryptocurrency with id ${id}:`, error);
    throw error;
  }
};

// Function to fetch price history for the last 30 days for a specific cryptocurrency by ID
export const fetchCryptoHistory = async (id: string): Promise<any> => {
  try {
    // Get the current date (current time in UNIX milliseconds)
    const endDate = Date.now();

    // Get the date 30 days ago
    const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    // Fetch the history data from the API with the `start` and `end` parameters
    const response = await axios.get(`${API_BASE_URL}/assets/${id}/history`, {
      params: {
        interval: 'd1', // daily intervals
        start: startDate, // Start timestamp (30 days ago)
        end: endDate,     // End timestamp (current time)
      },
    });

    return response.data.data;
  } catch (error) {
    console.error(`Error fetching price history for cryptocurrency with id ${id}:`, error);
    throw error;
  }
};

// WebSocket function to listen for real-time price updates
export const connectCryptoWebSocket = (
  assetIds: string[],
  onMessage: (data: Record<string, string>) => void
) => {
  const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${assetIds.join(',')}`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  return ws;
};