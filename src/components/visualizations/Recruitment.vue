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
    props: ["config"]
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

</style>

