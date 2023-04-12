/*
Environment
*/

const redcap_api_token_screening  = import.meta.env.VITE_REDCAP_API_TOKEN_SCREENING;
const redcap_api_token_enrolled   = import.meta.env.VITE_REDCAP_API_TOKEN_ENROLLED;
const redcap_api_endpoint         = import.meta.env.VITE_REDCAP_API_ENDPOINT;
const local_proxy_protocol        = import.meta.env.VITE_LOCAL_PROXY_PROTOCOL;
const local_proxy_host            = import.meta.env.VITE_LOCAL_PROXY_HOST;
const local_proxy_port            = import.meta.env.VITE_LOCAL_PROXY_PORT;
const local_proxy_username        = import.meta.env.VITE_LOCAL_PROXY_USERNAME;
const local_proxy_password        = import.meta.env.VITE_LOCAL_PROXY_PASSWORD;

// Define Proxy to Route REDCap API Requests
const proxy = {
  protocol: local_proxy_protocol,
  host: local_proxy_host,
  port: local_proxy_port,
  auth: {
    username: local_proxy_username,
    password: local_proxy_password
  }
}

const headers = {
  "Content-Type": "application/json;charset=UTF-8",
  "Accept": "application/json;charset=UTF-8",
  'Access-Control-Allow-Origin': '*'
};

/*
Imports
*/

import { defineStore } from "pinia";
import axios from "axios";

/*
Pinia Store - Configs
*/

export const redcapStore = defineStore('redcap', {

  state: () => ({
    caches: {
      screening: undefined,
      enrolled: undefined
    }
  }),

  getters: {

    getScreening (state) {
      return state.caches.screening;
    },

    getEnrolled (state) {
      return state.caches.enrolled;
    }

  },

  actions: {

    async fetchScreening () {

      const screening_query = {
        'token': redcap_api_token_screening,
        'content': 'record',
        'action': 'export',
        'format': 'json',
        'type': 'flat',
        'csvDelimiter': '',
        'fields[0]': 'record_id',
        'rawOrLabel': 'raw',
        'rawOrLabelHeaders': 'raw',
        'exportCheckboxLabel': 'true',
        'exportSurveyFields': 'true',
        'exportDataAccessGroups': 'true',
        'returnFormat': 'json'
      };

      try {

        const res = await axios({
          method: "post",
          url: redcap_api_endpoint,
          headers: headers,
          withCredentials: false,
          data: screening_query
        });

        this.caches.screening = res.data;

      } catch (error) {

        console.log(error);

      };

    },

    async fetchEnrolled () {

      const enrolled_query = {
        'token': redcap_api_token_enrolled,
        'content': 'record',
        'action': 'export',
        'format': 'json',
        'type': 'flat',
        'csvDelimiter': '',
        'fields[0]': 'record_id',
        'rawOrLabel': 'raw',
        'rawOrLabelHeaders': 'raw',
        'exportCheckboxLabel': 'true',
        'exportSurveyFields': 'true',
        'exportDataAccessGroups': 'true',
        'returnFormat': 'json'
      };

      try {

        const res = await axios({
          method: "post",
          url: redcap_api_endpoint,
          headers: headers,
          withCredentials: false,
          data: enrolled_query
        });

        this.caches.enrolled = res.data;

      } catch (error) {

        console.log(error);

      };

    }

  }

});

