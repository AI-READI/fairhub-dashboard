<script setup lang="ts">

  import Overview from "./visualizations/Overview.vue";
  import Demographics from "./visualizations/Demographics.vue";
  import Recruitment from "./visualizations/Recruitment.vue";
  import Participants from "./visualizations/Participants.vue";
  import Sites from "./visualizations/Sites.vue";

  defineProps<{
    config: object;
  }>();

</script>

<template>
  <Overview :config="config.modules.overview" />
  <Demographics :config="config.modules.demographics" />
  <Recruitment :config="config.modules.recruitment" />
  <Participants :config="config.modules.participants" />
  <Sites :config="config.modules.sites" />
</template>

<style scoped>
  h1 {
    font-weight: 500;
    font-size: 2.6rem;
    top: -10px;
  }
</style>
