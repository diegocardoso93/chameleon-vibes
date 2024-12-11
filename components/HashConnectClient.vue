<template>
  <button
    class="btn-connect"
    @click="changeConnection()"
  >
    <template v-if="connected === null">loading...</template>
    <template v-else-if="connected">disconnect</template>
    <template v-else>connect</template>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getConnectedAccountIds, hcInitPromise, hc, startConnection } from '../services/hashconnect';
import { loadVibeCards } from '../common';

const connected = ref<boolean | null>(null);

startConnection();

setInterval(() => {
  const last = connected.value;
  const current = getConnectedAccountIds().length > 0;
  if (last !== current) {
    connected.value = current;
    loadVibeCards();
  }
}, 1000);

async function changeConnection() {
  if (connected.value) {
    await hcInitPromise;
    if (connected.value) {
      if (getConnectedAccountIds().length > 0) {
        hc.disconnect();
        localStorage.setItem('cards', '[]');
      }
    }
  } else {
    // open walletconnect modal
    hc.openPairingModal();
  }
}
</script>

<style scoped>
.btn-connect {
  min-width: 100px;
  padding: 10px;
  font-size: 20px;
  color: black;
  cursor: pointer;
  border: 0;
  border-radius: 6px;
  z-index: 3;
  position: relative;
  background-image: linear-gradient(45deg, rgb(254 58 241), rgb(249 214 162));
  background-size: 100%;
  box-shadow: 0 1px #ffffffbf inset;
  transition: all 0.3s;
}
.btn-connect:hover {
  box-shadow: unset;
}
</style>
