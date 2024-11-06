<template>
  <div class="crypto-table">
    <h1>Cryptocurrency Prices</h1>
    <table>
      <thead>
        <tr>
          <th @click="sortBy('symbol')">Symbol</th>
          <th @click="sortBy('name')">Name</th>
          <th>Price (USD)</th>
          <th>Market Cap (USD)</th>
          <th>Favorite</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(crypto, index) in paginatedAssets" :key="index">
          <td>{{ crypto.symbol }}</td>
          <td @click="goToDetails(crypto.id)" class="clickable">{{ crypto.name }}</td>
          <td>{{ formatPrice(realTimePrices[crypto.id] || crypto.priceUsd) }}</td>
          <td>{{ formatPrice(crypto.marketCapUsd) }}</td>
          <td>
            <button @click="toggleFavorite(crypto.id)">
              {{ isFavorite(crypto.id) ? '★' : '☆' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchTopCryptocurrencies, connectCryptoWebSocket } from '../api';
import type { CryptoAsset } from './api';

export default {
  setup() {
    const router = useRouter();
    const cryptoAssets = ref<CryptoAsset[]>([]);
    const realTimePrices = ref<Record<string, string>>({});
    const favorites = ref<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const sortColumn = ref('name');
    const sortOrder = ref(1);

    // Fetch the top 100 cryptocurrencies
    onMounted(async () => {
      cryptoAssets.value = await fetchTopCryptocurrencies();

      // WebSocket setup for real-time price updates
      const ws = connectCryptoWebSocket(['bitcoin', 'ethereum', 'monero', 'litecoin'], (data) => {
        realTimePrices.value = { ...realTimePrices.value, ...data };
      });

      onUnmounted(() => ws.close());
    });

    // Sorting function
    const sortBy = (column: keyof CryptoAsset) => {
      sortOrder.value = sortColumn.value === column ? -sortOrder.value : 1;
      sortColumn.value = column;
      cryptoAssets.value.sort((a, b) =>
        a[column].localeCompare(b[column]) * sortOrder.value
      );
    };

    // Pagination and data slicing
    const paginatedAssets = computed(() =>
      cryptoAssets.value.slice(
        (currentPage.value - 1) * itemsPerPage,
        currentPage.value * itemsPerPage
      )
    );
    const totalPages = computed(() =>
      Math.ceil(cryptoAssets.value.length / itemsPerPage)
    );

    const previousPage = () => { if (currentPage.value > 1) currentPage.value--; };
    const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

    // Favorite toggle and persistence in localStorage
    const toggleFavorite = (id: string) => {
      if (favorites.value.includes(id)) {
        favorites.value = favorites.value.filter(favId => favId !== id);
      } else {
        favorites.value.push(id);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites.value));
    };
    const isFavorite = (id: string) => favorites.value.includes(id);

    // Formatting function
    const formatPrice = (price: string | undefined) =>
      price ? parseFloat(price).toFixed(2) : 'N/A';

    // Navigate to details page
    const goToDetails = (id: string) => {
      console.log(`Navigating to details page for: ${id}`);
      router.push({ name: 'details', params: { id } });
      // router.push({ name: 'details', params: { id } });
    };

    return {
      cryptoAssets,
      paginatedAssets,
      realTimePrices,
      sortBy,
      favorites,
      isFavorite,
      formatPrice,
      toggleFavorite,
      currentPage,
      totalPages,
      previousPage,
      nextPage,
      goToDetails,
    };
  },
};
</script>

<style scoped>
.crypto-table {
  font-family: Arial, sans-serif;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  cursor: pointer;
  background-color: #f4f4f4;
}

th, td {
  padding: 12px;
  border: 1px solid #ddd;
}

.clickable {
  color: blue;
  text-decoration: underline;
  cursor: pointer;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
</style>