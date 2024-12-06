<template>
  <div class="container">
      <div v-if="showChameleon" class="item">
        <div ref="chameleon" class="card active" style="background-image: url(../assets/img/icon.png);">
          <div class="card__filter"></div>
        </div>
        <button v-if="!btnHidden" class="btn-purple" @click="drawnCard()">open</button>
      </div>

      <div v-if="showDrawn" class="item">
        <div class="card active" :style="`background-image: url(../assets/img/${drawn.image});`">
          <div class="card__filter"></div>
        </div>
        <button class="btn-purple" @click="buyVibeCard(drawn.id)">buy</button>
        <!-- <button v-if="finished" @click="playVibeCard()">
          done! 🎉 click here to play...
        </button> -->
      </div>

  </div>
  <div class="cardlist-area">
    <h1>Vibe Cards ⇩</h1>
    <div class="list">
      <div class="item" v-for="(item) of items" @click="playVibeCard(item.id)">
        <div class="card active" :style="`background-image: url(../assets/img/${item.image});`">
          <div class="card__filter"></div>
        </div>
        <button class="btn-purple" @click="openPlayer(drawn.id)">play</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useData } from 'vike-vue/useData';
import { Data } from './+data';
import { ref } from 'vue';
import vibeCards from '../../common/vibeCards';

let { items } = useData<Data>();
items = [{
  id: 1,
  image: '1.png',
}, {
  id: 2,
  image: '2.png',
}, {
  id: 3,
  image: '3.png',
}, {
  id: 4,
  image: '4.png',
}, {
  id: 5,
  image: '5.png',
}, {
  id: 6,
  image: '6.png',
}];

console.log(items);

const btnHidden = ref();
const showChameleon = ref(true);
const chameleon = ref();
const showDrawn = ref(false);
const drawn = ref();

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function drawnCard() {
  drawn.value = vibeCards[Math.floor((Math.random() * vibeCards.length))];

  btnHidden.value = true;
  const chameleonEl = chameleon.value;
  chameleonEl.classList.add('openning');
  await delay(2000);
  chameleonEl.classList.remove('openning');
  chameleonEl.classList.add('openning2');
  await delay(2000);
  chameleonEl.classList.add('zoomin');
  await delay(500);
  chameleonEl.classList.remove('zoomin');
  chameleonEl.classList.add('zoomout');
  await delay(600);
  showChameleon.value = false;
  showDrawn.value = true;
}

function buyVibeCard(id: number) {
// @TODO
}

function openPlayer(id: number) {
  // @todo transaction call
  location.href = `/show?id=${id}`;
}

function playVibeCard(id: number) {
  location.href = `/show?id=${id}`;
}
</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
  justify-content: center;
  padding-top: 10px;
}
.cardlist-area {
  margin: 120px auto;
  max-width: 1024px;
  font: 16px 'Poppins', sans-serif;
}
.list {
  width: 100%;
  max-width: 1024px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 0;
  padding: 0;
  margin: 0;
  list-style: none;
}
@media (max-width: 1024px) {
  .list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 800px) {
  .list {
    grid-template-columns: 1fr;
  }
}

.item {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.card {
  width: 300px;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;

  border-radius: 10px;
  background-size: cover;
  position: relative;
  
  transition-duration: 300ms;
  transition-property: transform, box-shadow;
  transition-timing-function: ease-out;
  transform: rotate(0);

  z-index: -1;
}

.card:hover {
  scale: 1.1;
  transition: all 0.2s;
}

.card.active .card__filter:before, .card.active .card__filter:after {
  content: "";
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background: linear-gradient(130deg, #3d3d3d00 45%, #9e9bf84d 50%, #3d3d3d00 60%);
  background-size: 500%;
  background-position-x: 100%;
  filter: blur(8px);
  border-radius: 100px;
  mix-blend-mode: color-dodge;
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  100% {
    background-position-x: 0;
  }
}

.openning {
  transform: rotate(7200deg);
  transition-duration: 2.5s;
}
.openning2 {
  transform: rotate(3600deg);
  transition-duration: 2.5s;
}
.zoomin {
  transition: transform 0.5s ease;
  transform: scale(1.2);
}
.zoomout {
  transition: transform 0.5s ease;
  transform: scale(1);
}
.btn-purple {
  min-width: 100px;
  padding: 10px;
  font-size: 20px;
  color: rgb(156, 255, 250);
  cursor: pointer;
  border: 0;
  border-radius: 6px;
  z-index: 3;
  position: relative;

  background: radial-gradient(141.42% 141.42% at 100% 0%, #fff6, #fff0), radial-gradient(140.35% 140.35% at 100% 94.74%, #bd34fe, #bd34fe00), radial-gradient(89.94% 89.94% at 18.42% 15.79%, #41d1ff, #41d1ff00);
  box-shadow: 0 1px #ffffffbf inset;
  transition: all 0.3s;
}
.btn-purple:hover {
  margin-top: -4px;
  box-shadow: 0 6px 20px 10px #9e9bf84d;
}
</style>
