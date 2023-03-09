<script lang="ts">

  import * as D3 from "d3";
  import RecruitmentVisualization from "../../modules/recruitment.js";

  // // Define props
  // const recruitment = defineProps <{
  //   config: object
  // }>();

  // // Initialize module visualization
  // let RecruitmentModule = new RecruitmentVisualization(
  //   recruitment.config.visualization
  // );

  export default {
    name: "Recruitment",
    data() {
      let dashboard = configStore().configs.dashboard;
      let config = null;

      // Set Config
      for (let i = 0; i < dashboard.components.length; i++) {
        if (dashboard.components[i].name === this.name) {
          config = components[i];
        }
      }

      return {
         config
      }
    },
    beforeCreate () {
      console.log("beforeCreate:", this);
    },
    created () {
      console.log("created:", this);
    },
    beforeMount ()  {
      console.log("beforeMounted:", this);
    },
    mounted () {
      console.log("mounted:", this);
    },
    updated () {
      console.log("updated:", this);
    }
  }

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

