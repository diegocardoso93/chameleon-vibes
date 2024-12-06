<template>
  <div class="fcontainer">
    <footer>
      <h1>
        &nbsp;
        Hello Future. Powered by
        <a href="https://hedera.com/" target="_blank">Hedera</a>
      </h1>
    </footer>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.fcontainer {
  width: 100%;
  border-top: 3px solid orangered;
  position: fixed;
  bottom: 0;
  background: black;
  text-align: center;
  z-index: 4;
}
footer {
  width: 100%;
}
a {
  cursor: pointer;
  color: antiquewhite;
  margin: auto 0;
  text-decoration: underline;
  display: inline;
}
h1 {
  font: 13px 'Poppins', sans-serif;
  color: antiquewhite;
}
span {
  font-size: 24px;
  padding-top: 2px;
  margin-right: -2px;
}
</style>
