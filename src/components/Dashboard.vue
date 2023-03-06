<script lang="ts">

  export default{
    name: "Dashboard",
    components: {},
    props: {
      config: {
        type: Object,
        required: true
      }
    },
    // Dynamically import the required components, which
    // are identified in ../config/dashboard-config.json.
    // The config data is passed to this component from
    // the DashboardView.vue component
    created ()  {
      for (let i = 0; i < this.config.components.length; i++) {
        let component = this.config.components[i].name;
        this.$options.components[component] = function () {
          import('./visualizations/' + component + '.vue');
        }();
      }
    }
  };

</script>

<template>
  <div v-if="config">
    <div v-for="(component, index) in config.components" :key="index">
      <h2>{{ component.subtitle }}</h2>
      <component :is="component.name" :moduleconfig="component.module"></component>
    </div>
  </div>
</template>

<style scoped>
  h1 {
    font-weight: 500;
    font-size: 2.6rem;
    top: -10px;
  }
</style>


<!-- <script lang="ts">

  import Overview from "./visualizations/Overview.vue";
  import Demographics from "./visualizations/Demographics.vue";
  import Recruitment from "./visualizations/Recruitment.vue";
  import Participants from "./visualizations/Participants.vue";
  import Sites from "./visualizations/Sites.vue";

  export default {
    components: {
        "overview": Overview,
        "demographics": Demographics,
        "recruitment": Recruitment,
        "participants": Participants,
        "sites": Sites
    },
    props: ["config"]
  }

</script>

<template>
  <div id="modules" v-for="module in config.modules">

  <Overview :module-config="config.modules.overview" />
  <Demographics :module-config="config.modules.demographics" />
  <Recruitment :module-config="config.modules.recruitment" />
  <Participants :module-config="config.modules.participants" />
  <Sites :module-config="config.modules.sites" />
</template>

<style scoped>
  h1 {
    font-weight: 500;
    font-size: 2.6rem;
    top: -10px;
  }
</style>
 -->
