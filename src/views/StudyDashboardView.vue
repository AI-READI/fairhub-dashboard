<script setup lang="ts">
  import StudyDashboard from "../components/StudyDashboard.vue";
  import config from "../config/dashboard-config.json";

</script>

<template>
  <main>
    <header>
      <h1>{{config.title}}</h1>
    </header>
    <div id="wrapper">
      <StudyDashboard :config="config" />
    </div>
  </main>
</template>

<style>
  h1 {
    font-size: 3.6em;
  }
  @media (min-width: 1024px) {
    .about {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
  }
</style>
