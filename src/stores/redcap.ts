/*
Imports
*/

const redcap_api_token_screening = import.meta.env.REDCAP_API_TOKEN_SCREENING;
const redcap_api_token_enrolled = import.meta.env.REDCAP_API_TOKEN_ENROLLED;

console.log(redcap_api_token_screening);
console.log(redcap_api_token_enrolled);

import { defineStore } from "pinia";

/*
Pinia Store - Configs
*/

export const configStore = defineStore('redcap', {
  state: () => {
    return { }
  },
  actions: {
    reload () {
      return {}
    }
  }
});
