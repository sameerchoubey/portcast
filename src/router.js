import { createRouter, createWebHistory } from 'vue-router';
import CryptoTable from './components/CryptoTable.vue';
import Details from './components/Details.vue';

const routes = [
  { path: '/', component: CryptoTable },
  { path: '/details/:id', component: Details, name: 'details' }, // Dynamic route for details page
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;