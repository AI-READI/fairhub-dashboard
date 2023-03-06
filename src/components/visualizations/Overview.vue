<script lang="ts">

/*
Imports
*/

  // import * from vue;
  import D3 from "d3";
  import OverviewVisualization from "../../modules/overview.js";

/*
Setup
*/

  export default {
    name: "Overview",
    props: {
      moduleconfig: {
        type: Object,
        require: true
      },
      interactive: {
        type: Function,
        require: true
      }
    },
    created: () => {
      this.props.config = config;
      this.props.interactive = new OverviewVisualization(moduleconfig);
      console.log(this.props);
    }
  }

  // console.log(moduleconfig);
  // // // Initialize module visualization
  // let OverviewModule = new OverviewVisualization(
  //   overview.config.visualization
  // );

  // console.log(config);
</script>

<template>
  <div v-if="config">
    <h2>{{config.name}}</h2>
    <div v-if="interactive">
      <div @click="interactive.debug" class="visualization-container">
        <svg
          :id="this.props.config.module.name"
          :viewBox="`0 0 ${this.props.config.module.width} ${this.props.config.module.height}`"
          preserveAspectRatio="xMinYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        ></svg>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>

