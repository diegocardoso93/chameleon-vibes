<template>
  <div class="hcontainer">
    <header class="header">
      <!-- Chameleon Beats -->
      <a href="/">
        <h1>
          Chameleon Vibes&nbsp;
        </h1>
      </a>
    </header>
  </div>
</template>

<script lang="ts" setup>
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
