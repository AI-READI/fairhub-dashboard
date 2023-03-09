<script lang="ts">

/*
Imports
*/

  import { ref, reactive, computed } from 'vue'
  import { configStore } from '@/stores/configs'
  const visualizations = import.meta.glob('./visualizations/*.vue', {eager: true})

/*
Component
*/

  export default {
    name: "Dashboard",
    components: {},
    setup () {
      let dashboard = configStore().configs.dashboard;
      let components = [];
      console.log(dashboard.components);
      for (let i = 0; i < dashboard.components.length; i++) {
        let component = dashboard.components[i].name;
        Object.entries(visualizations).forEach(([path, definition]) => {
          if (component === path.split('/').pop().replace(/\.\w+$/, '')) {
            components.push({
              name: component,
              path: definition.default
            })
          }
        });
      }
      return { dashboard, components }
    },
    // Dynamically import the required components, which
    // are identified in ../config/dashboard-config.json.
    // We import the child components once this parent
    // component has been created.
    beforeCreate () {
      console.log("beforeCreate:", this.$options.components);
    },
    created () {
      console.log("created:", this.$options.components);
    },
    beforeMount ()  {
      console.log("beforeMounted:", this.$options.components);
    },
    updated () {

    }
  };

</script>

<!-- Template -->

<template>
  <div v-for="(component, index) in dashboard.components" :key="index">
      <h2>{{ component.name }}</h2>
      <h3>{{ component.subtitle }}</h3>
      <component :id="component.id" :is="component.name" ></component>
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
