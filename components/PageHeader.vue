<template>
  <div class="hcontainer">
    <header class="header">
      <!-- Chameleon Beats -->
      <a href="/">
        <h1>
          Chameleon Vibes&nbsp;
        </h1>
      </a>
      <template v-if="HashConnectClient">
        <component :is="HashConnectClient"></component>
      </template>
    </header>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';
let HashConnectClient = ref();

onMounted(() => {
  setTimeout(() => {
    HashConnectClient.value = defineAsyncComponent(() => import(`./HashConnectClient.vue`));
  }, 1000);
});
</script>

<!-- @TODO -->
<style scoped>
.hcontainer {
  width: 100%;
  border-bottom: 3px solid orangered;
  position: fixed;
  background: black;
  padding: 0 20px;
  display: flex;
  z-index: 4;
}
.header {
  display: flex;
  max-width: 1024px;
  justify-content: space-between;
  margin: auto;
  font: 14px 'Poppins', sans-serif;
  align-items: center;
  width: 100%;
}
.header h1 {
  background-image: linear-gradient(45deg, rgb(254 58 241), rgb(249 214 162));
  background-size: 100%;
  background-repeat: repeat;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-background-clip: text;
  -moz-text-fill-color: transparent;
}
a {
  cursor: pointer;
  text-decoration: none;
  color: antiquewhite;
  margin: auto 0;
  display: flex;
}
span {
  font-size: 24px;
  padding-top: 2px;
  margin-right: -2px;
}
</style>
