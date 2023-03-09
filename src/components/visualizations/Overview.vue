<script lang="ts">

/*
Imports
*/

  import { configStore } from '@/stores/configs'
  import { ref, reactive, computed } from 'vue'
  import OverviewVisualization from "../../modules/overview.js";

/*
Component
*/

  export default {
    name: "Overview",
    setup () {
      let dashboard = configStore().configs.dashboard;
      let config = null;
      let overview = null;

      // Set Config
      for (let i = 0; i < dashboard.components.length; i++) {
        if (dashboard.components[i].name === this.name) {
          config = components[i];
        }
      }

      config = reactive(config);
      overview = reactive(OverviewVisualization);

      console.log("Overview Setup!");

      return {
        config: config,
        overview: overview
      }
    },
    mounted () {
      this.overview = new OverviewVisualization(config);
      console.log("Overview Mounted!");
    }
  }

</script>

<!-- Template -->

<template>
  <div class="container">
    <svg
      :id="config.id"
      :viewBox="`0 0 ${config.visualization.width} ${config.visualization.height}`"
      preserveAspectRatio="xMinYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    />
  </div>
</template>

<!-- Style -->

<style scoped>
  h2, h3 {
    font-weight: 500;
  }
  h2 {
    font-size: 2.0rem;
  }
  h3 {
    font-size: 1.2rem;
  }
</style>

