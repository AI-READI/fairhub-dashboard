
<script setup lang="ts">

  import * as D3 from "d3";
  import DemographicsVisualization from "../../modules/demographics.js";

  // Define props
  const demographics = defineProps <{
    config: object
  }>();

  // Initialize module visualization
  let DemographicsModule = new DemographicsVisualization(
    demographics.config.visualization
  );

</script>

<template>
  <h2>{{config.subtitle}}</h2>
  <div class="visualization-container">
    <svg
      :id="config.visualization.id"
      :viewBox="`0 0 ${config.visualization.width} ${config.visualization.height}`"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>
  </div>
</template>

<style scoped>

</style>

