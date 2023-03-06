<script lang="ts">

  import * as D3 from "d3";
  import ParticipantsVisualization from "../../modules/participants.js";

  // // Define props
  // const participants = defineProps <{
  //   config: object
  // }>();

  // // Initialize module visualization
  // let ParticipantsModule = new ParticipantsVisualization(
  //   participants.config.visualization
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

