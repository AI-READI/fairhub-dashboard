<script lang="ts">

/*
Imports
*/

  import { configStore } from '@/stores/configs'
  import { shallowRef, ref, reactive, computed } from 'vue'
  const modules = import.meta.glob('../../modules/visualizations/charts/*.js', {eager: true})

/*
Component
*/

  export default {
    name: "Overview",
    config: {},
    visualizations: [],
    data () {

      let dashboard = configStore().configs.dashboard;
      let config = null;
      let visualizations = [];

      // Set Config
      for (let i = 0; i < dashboard.components.length; i++) {
        if (dashboard.components[i].name === this.$options.name) {
          config = dashboard.components[i];
        }
      }

      // Init Visualizations
      for (let i = 0; i < config.module.visualizations.length; i++) {
        let viz = config.module.visualizations[i];
        for (const path in modules) {
          let name = path.split('/').pop().replace(/\.\w+$/, '')
          if (viz.type === name) {
            let visualization = modules[path].default;
            visualizations.push(
              new visualization(
                viz.config
              )
            )
          }
        }
      }
      this.$options.visualizations = visualizations;
      return {
        config, visualizations
      }
    },
    beforeCreate () {
      // console.log("Overview beforeCreate:", this.$options.visualizations);
    },
    created () {
      // console.log("Overview created:", this.$options.visualizations);
    },
    beforeMount ()  {
      // console.log("Overview beforeMounted:", this.$options.visualizations);
    },
    mounted () {
      console.log(`${this.$options.name} module mounted:`, this.$options.visualizations);
      for (let i = 0; i < this.$options.visualizations.length; i++) {
        this.$options.visualizations[i].update();
      }
    },
    updated () {
      console.log(`${this.$options.name} module mounted:`, this.$options.visualizations);
      for (let i = 0; i < this.$options.visualizations.length; i++) {
        this.$options.visualizations[i].update();
      }
    }
  }

</script>

<!-- Template -->

<template>
  <h2>{{ config.name }}</h2>
  <h3>{{ config.subtitle }}</h3>
  <div :id="config.id">
    <div v-for="visualization in visualizations" class="visualization-container">
      <svg
        :id="`${visualization.setID}_visualization`"
        class="visualization-element"
        :viewBox="`0 0 ${visualization.width} ${visualization.height}`"
        preserveAspectRatio="xMinYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      />
      <div
        :id="`${visualization.setID}_interface`"
        class="interface"
      >
        <div v-if="visualization.legend" :id="`${visualization.setID}_legend`"></div>
        <div v-if="visualization.filters" :id="`${visualization.setID}_filters`"></div>
        <div v-if="visualization.tooltip" :id="`${visualization.setID}_tooltip`"></div>
      </div>
    </div>
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
  .doughnut-chart {
    float: left;
    display: inline-flex;
    width: 240px;
  }
  .doughnut-chart:first-of-type {
    margin-left: 20px;
  }
  svg {
    shape-rendering: geometricPrecision;
  }
</style>

