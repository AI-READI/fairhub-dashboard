import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: DashboardView,
    },
    {
      path: "/dashboard",
      name: "Study Dashboard",
      component: DashboardView,
    }
  ],
});

export default router;
