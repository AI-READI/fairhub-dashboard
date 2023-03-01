import { createRouter, createWebHistory } from "vue-router";
import StudyDashboardView from "../views/StudyDashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
      path: "/",
      name: "Study Dashboard",
      component: StudyDashboardView,
    }
  ],
});

export default router;
