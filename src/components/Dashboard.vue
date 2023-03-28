<script lang="ts">

/*
Imports
*/

  import { configStore } from '@/stores/configs'
  import { shallowRef, reactive } from 'vue'
  import dimport from "../modules/utilities.js"
  // Import Child Components
  const visualizations = import.meta.glob('./visualizations/*.vue', {eager: true})

/*
Component
*/

  export default {
    name: "Dashboard",
    components: {},
    // Load required components from dynamic import.
    // Required components are identified in
    // ../config/dashboard-config.json.
    data () {
      let dashboard = configStore().configs.dashboard;
      let components = [];
      let names = [];
      for (let i = 0; i < dashboard.components.length; i++) {
        let component = dashboard.components[i].name;
        for (const path in visualizations) {
          let module = visualizations[path].default;
          if (component === module.name) {
            names.push(component)
            components.push({
              config: reactive(dashboard.components[i]),
              view: shallowRef(module)
            })
          }
        }
      }
      this.$options.components = components;
      return { names, dashboard, components }
    }
  };

</script>

<!-- Template -->

<template>
  <div v-for="(component, index) in components" :key="index">
      <component :is="component.view" :key="component.config.name"/>
  </div>
</template>

<!-- Style -->

<style scoped>
  .visualization-container {
     max-height: 760px;
  }
  svg:path, svg:rect, svg:circle {
    cursor: pointer !important;
  }
</style>
