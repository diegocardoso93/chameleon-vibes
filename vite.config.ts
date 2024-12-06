import { pages } from "vike-cloudflare";
import md from "unplugin-vue-markdown/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import adapter from "@hono/vite-dev-server/cloudflare";
import devServer from "@hono/vite-dev-server";

export default defineConfig({
  plugins: [
    devServer({
      entry: "hono-entry.ts",
      adapter,

      exclude: [
        /^\/@.+$/,
        /.*\.(ts|tsx|vue)($|\?)/,
        /.*\.(s?css|less)($|\?)/,
        /^\/favicon\.ico$/,
        /.*\.(svg|png)($|\?)/,
        /^\/(public|assets|static)\/.+/,
        /^\/node_modules\/.*/,
      ],

      injectClientScript: false,
    }),
    vike({}),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    md({}),
    pages({
      server: {
        kind: "hono",
        entry: "hono-entry.ts",
      },
    }),
  ],
});
