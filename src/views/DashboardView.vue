<script lang="ts">

/*
Imports
*/

  import { configStore } from '@/stores/configs'
  import Dashboard from "@/components/Dashboard.vue";

/*
Component
*/

  export default {
    name: "DashboardView",
    components: {
      "Dashboard": Dashboard
    },
    setup () {
      return { dashboard: configStore().configs.dashboard }
    }
  }

</script>

<!-- Template -->

<template>
  <main>
    <header>
      <h1>{{ dashboard.title }}</h1>
    </header>
    <component :is="dashboard.name" />
  </main>
</template>

<!-- Style -->

<style scoped>
  h1 {
    font-weight: 700;
    font-size: 3.2em;
  }
  @media (min-width: 1024px) {
    .about {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
  }
</style>
