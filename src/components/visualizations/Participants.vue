<script lang="ts">

/*
Imports
*/

  import { configStore } from '@/stores/configs'
  import { shallowRef, ref, reactive, computed } from 'vue'
  const modules = import.meta.glob('../../modules/visualizations/*.js', {eager: true})

/*
Component
*/

  export default {
    name: "Participants",
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
      // console.log("Participants beforeCreate:", this.$options.visualizations);
    },
    created () {
      // console.log("Participants created:", this.$options.visualizations);
    },
    beforeMount ()  {
      // console.log("Participants beforeMounted:", this.$options.visualizations);
    },
    mounted () {
      console.log("Participants mounted:", this.$options.visualizations);
      for (let i = 0; i < this.$options.visualizations.length; i++) {
        this.$options.visualizations[i].update();
      }
    },
    updated () {
      console.log("Participants updated:", this.$options.visualizations);
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
  <div v-for="visualization in visualizations" :id="config.id" class="visualization-container">
    <svg
      :id="visualization.id"
      :viewBox="`0 0 ${visualization.width} ${visualization.height}`"
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

