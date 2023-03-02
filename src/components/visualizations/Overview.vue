
<script setup lang="ts">

/*
Imports
*/

  import * as D3 from "d3";
  import OverviewVisualization from "../../modules/overview.js";

/*
Setup
*/

  // Define props
  const overview = defineProps <{
    config: object
  }>();

  // Initialize module visualization
  let OverviewModule = new OverviewVisualization(
    overview.config.visualization
  );

</script>

<template>
  <h2>{{config.subtitle}}</h2>
  <div @click="OverviewModule.debug" class="visualization-container">
    <svg
      :id="config.visualization.name"
      :viewBox="`0 0 ${config.visualization.width} ${config.visualization.height}`"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </div>
</template>

<style scoped>

</style>

