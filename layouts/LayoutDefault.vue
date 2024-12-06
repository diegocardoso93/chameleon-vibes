<template>
  <PageHeader />
  <section class="content">
    <slot />
  </section>
  <PageFooter />
</template>

<script lang="ts" setup>
import PageHeader from '../components/PageHeader.vue';
import PageFooter from '../components/PageFooter.vue';
</script>

<style>
body {
  margin: 0;
  background: black;
  -webkit-font-smoothing: antialised;
  overflow: hidden auto;
  color: antiquewhite;
}
* {
  box-sizing: border-box;
}
a {
  text-decoration: none;
}
.content {
  padding: 100px 20px;
}
</style>
