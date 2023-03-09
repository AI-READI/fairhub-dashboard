/*
Imports
*/

import { defineStore } from "pinia";

/*
Pinia Store - Configs
*/

export const configStore = defineStore('config', {
  state: () => {
    let configs = {}
      const modules = import.meta.glob('../config/*.json', { eager: true });
      for (const path in modules) {
        let key = path.replace(/\...config\/(.+)\.json/, "$1");
        configs[key] = modules[path];
      }
      return { configs: configs }
  },
  actions: {
    reload () {
      let configs = {}
      const modules = import.meta.glob('../config/*.json', { eager: true });
      for (const path in modules) {
        let key = path.replace(/\...config\/(.+)\.json/, "$1");
        configs[key] = modules[path];
      }
      this.configs = configs;
    }
  }
});
