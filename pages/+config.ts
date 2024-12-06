import vikeVue from "vike-vue/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.vue";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "Chameleon Vibes",
  description: "chameleon vibes, music sync, beat",
  lang: 'en',

  extends: vikeVue as typeof vikeVue,
} satisfies Config;
