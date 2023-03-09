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
    config: {},
    overview: OverviewVisualization,
    data () {

      let dashboard = configStore().configs.dashboard;
      let config = null;
      let overview = null;

      // Set Config
      for (let i = 0; i < dashboard.components.length; i++) {
        if (dashboard.components[i].name === this.name) {
          config = components[i];
        }
      }

      overview = new OverviewVisualization(config);
      // Init Overview
      this.$options.overview = overview;

      return {
        config, overview
      }
    },
    beforeCreate () {
      console.log("beforeCreate:", this.$options.overview);
    },
    created () {
      console.log("created:", this.$options.overview);
    },
    beforeMount ()  {
      console.log("beforeMounted:", this.$options.overview);
    },
    mounted () {
      console.log("mounted:", this.$options.overview);
    },
    updated () {
      console.log("updated:", this.$options.overview);
    }
  }

</script>

<!-- Template -->

<template>
  <h2>{{config.subtitle}}</h2>
  <div class="visualization-container">
    <svg
      :id="overfiew.id"
      :viewBox="`0 0 ${overview.width} ${config.visualization.height}`"
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

