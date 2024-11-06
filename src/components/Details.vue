<template>
    <div class="details-page">
      <h1>{{ cryptoDetails?.name }} Details</h1>
      <p><strong>Symbol:</strong> {{ cryptoDetails?.symbol }}</p>
      <p><strong>Market Cap:</strong> {{ formatPrice(cryptoDetails?.marketCapUsd) }} USD</p>
      <p><strong>Price:</strong> {{ formatPrice(cryptoDetails?.priceUsd) }} USD</p>
      <p><strong>24h Change:</strong> {{ cryptoDetails?.changePercent24Hr }}%</p>
  
      <h2>Price History (Last 30 Days)</h2>
      <!-- Use `Line` directly instead of `LineChart` -->
      <Line v-if="priceHistory.length" :data="chartData" />
    </div>
  </template>
  
<script lang="ts">
    import { ref, onMounted } from 'vue';
    import { fetchCryptoDetails, fetchCryptoHistory } from '../api';
    import { Line } from 'vue-chartjs';
    import {
    Chart as ChartJS,
    LineElement,
    PointElement,   // Register PointElement
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend,
    } from 'chart.js';

    // Register required Chart.js components
    ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

    export default {
    components: {
        Line, // Register Line directly
    },
    setup() {
        const cryptoDetails = ref(null);
        const priceHistory = ref<{ date: string; priceUsd: string }[]>([]);
        const chartData = ref({});

        const formatPrice = (price: string | undefined) =>
        price ? parseFloat(price).toFixed(2) : 'N/A';

        // Fetch details and 30-day price history on mount
        onMounted(async () => {
        const cryptoId = window.location.pathname.split('/').pop(); // Get ID from URL

        // Fetching cryptocurrency details
        if (cryptoId) {
            cryptoDetails.value = await fetchCryptoDetails(cryptoId);
        }

        // Fetching 30-day price history
        const history = await fetchCryptoHistory(cryptoId || '');
        priceHistory.value = history;

        // Prepare data for Chart.js with corrected parsing
        chartData.value = {
            labels: history.map((entry) =>
            new Date(entry.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            })
            ), // Format dates for readability on X-axis
            datasets: [
            {
                label: 'Price (USD)',
                data: history.map((entry) => parseFloat(entry.priceUsd)), // Parse priceUsd as float
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
            ],
        };
        });

        return {
        cryptoDetails,
        priceHistory,
        chartData,
        formatPrice,
        };
    },
    };
</script>
  
  <style scoped>
  .details-page {
    font-family: Arial, sans-serif;
  }
  
  h1, h2 {
    margin-bottom: 0.5em;
  }
  
  p {
    font-size: 1.1em;
    margin-bottom: 0.3em;
  }
  </style>