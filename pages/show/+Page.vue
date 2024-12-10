<template>
  <section>
    <audio ref="audioRef" id="audio" controls @ended="onEnd" style="margin-top:400px;display: none">
      <source :src="`${BASE_ASSETS}/sound/${vibeCard.sound}`" type="audio/mpeg">
    </audio>

    <div ref="cardContainerRef" class="card-container">
      <div ref="cardRef" class="card active">
        <div class="card__filter"></div>
      </div>
      <img ref="backgroundImage" class="background-image" :src="`${BASE_ASSETS}/img/st2.png`">
    </div>

    <button ref="btnPlay" id="btnPlay" @click="onPlay()">
      <img ref="playRef" id="play" :src="`${BASE_ASSETS}/img/play.svg`" />
      <img ref="stopRef" id="stop" :src="`${BASE_ASSETS}/img/stop.svg`" style="display: none" />
    </button>
  </section>
</template>

<script lang="ts" setup>
import { useData } from 'vike-vue/useData';
import { Data } from './+data';
import { onMounted, onUnmounted, ref } from 'vue';
import { IntervalRef } from '../../common';

const data = useData<Data>();
console.log(data);
const { vibeCard } = data;

const cardRef = ref();
const backgroundImage = ref();
const cardContainerRef = ref();
const audioRef = ref();
const playRef = ref();
const stopRef = ref();
const isPaused = ref();

// const url = new URL(location.href);
// const params = new URLSearchParams(url.search);
const BASE_ASSETS = '../../assets';

onMounted(() => {
  cardRef.value.style.backgroundImage = `url(${BASE_ASSETS}/img/${vibeCard.id}.png)`;
});

onUnmounted(() => {
  runEnd();
});

function onPlay() {
  if (audioRef.value.paused) {
    playRef.value.style.display = 'none';
    stopRef.value.style.display = 'block';
    audioRef.value.play();
    isPaused.value = false;
    execute();
  } else {
    playRef.value.style.display = 'block';
    stopRef.value.style.display = 'none';
    audioRef.value.pause();
    audioRef.value.load();
    isPaused.value = true;
  }
}

function onEnd() {
  onPlay();
  runEnd();
  console.log('ended');
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let hueTick: IntervalRef, backTick: IntervalRef, rithmTick: IntervalRef;
let hue = 0;
let rc = 0;

function runHueRotateEffect() {
  backgroundImage.value.style.visibility = 'visible';
  console.log('runHueRotateEffect');
  hueTick = setInterval(() => {
    cardContainerRef.value.style.filter = `hue-rotate(${hue}deg)`;
    hue += 1;
  }, 100);
}
function stopHueRotateEffect() {
  if (backgroundImage.value) {
    backgroundImage.value.style.visibility = 'hidden';
  }
  clearInterval(hueTick);
  hue = 0;
}

function runBackEffect(ms: number) {
  let dp = 15, dir = -1;
  backTick = setInterval(() => {
    backgroundImage.value.style.filter = dp > 15 ? `drop-shadow(40px 400px ${dp}px #646cffaa)` : `drop-shadow(40px 400px ${dp}px #646cff11)`;
    dp += (5 * dir);
    if (dp > 100 || dp < 15) {
      dir *= -1;
    }
  }, ms);
}
function stopBackEffect() {
  clearInterval(backTick);
}

function runRithm() {
  const img = cardRef.value;
  rithmTick = setInterval(async () => {
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.1)`;
    await delay(100);
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.0)`;
    await delay(100);
  }, 400);
}
function stopRithm() {
  clearInterval(rithmTick);
  rc = 0;
}

function tickBass(cfg) {
  const img = cardRef.value;
  (async () => {
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.0)`;
    await delay(cfg);
    rc += 5;
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.2)`;
    await delay(cfg);
    rc += 5;
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.4)`;
    await delay(cfg);
    rc += 5;
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.2)`;
    await delay(cfg);
    rc += 5;
    img.style.transform = `rotate3d(1, 1, 1, ${rc%30}deg) scale(1.0)`;
  })();
}

let normalizedVector = [];

normalizeMP3FromURL(`${BASE_ASSETS}/sound/${vibeCard.sound}`).then(t => normalizedVector = t);

async function execute() {
  console.log('Normalized audio data:', normalizedVector);
  runHueRotateEffect();
  runBackEffect(50);
  runRithm();

  for (let x of normalizedVector) {
    if (isPaused.value) break;

    if (x > 76)
      tickBass(x);

    await delay(96);
  }

  runEnd();
}

function runEnd() {
  stopHueRotateEffect();
  stopBackEffect();
  stopRithm();
}



function convertToRange(value) {
  // Convert a value from [-1, 1] to [0, 100]
  return ((value + 1) / 2) * 100;
}

async function normalizeMP3FromURL(mp3Url: string) {

  const response = await fetch(mp3Url);
  if (!response.ok) {
    console.error('Failed to fetch the MP3 file.');
    return;
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const sampleRate = audioBuffer.sampleRate;

    // Get the raw audio data from the first channel (mono or stereo)
    const rawData = audioBuffer.getChannelData(0); 

    // Now normalize the shifted data to a range of 0 to 100
    const step = (sampleRate/10); // 1 sample by 100ms
    const normalizedData = new Float32Array(rawData.length/step);
    for (let i = 0; i < rawData.length/step; i++) {
      let max = Math.max(...rawData.slice(i*step, (i+1)*step));
      let min = Math.min(...rawData.slice(i*step, (i+1)*step));
      let selected = max > Math.abs(min) ? max : min;
      normalizedData[i] = convertToRange(selected); // Scale to 0-100
    }

    return normalizedData;
  } catch (error) {
    console.error('Error decoding MP3:', error);
  }
}

</script>

<style scoped>
#btnPlay {
  top: 550px;
  border-radius: 100%;
  background: none;
  color: antiquewhite;
  font-size: 28px;
  padding: 7px 12px;
  cursor: pointer;
  border: 0;
  position: fixed;
  left: calc(50vw - 40px)
}

.card-container {
  filter: hue-rotate(0deg);
  margin-top: -50px;
}

.card {
  width: 300px;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;

  border-radius: 10px;
  background-size: cover;
  
  transition-duration: 20ms;
  transition-property: transform, box-shadow;
  transition-timing-function: ease-out;

  top: 120px;
  width: 300px;
  transform: rotate3d(1, 1, 1, 0deg) scale(1.1);
  left: calc(50% - 140px);
  position: absolute;
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

.background-image {
  border-radius: 100%;
  top: -310px;
  left: calc(50vw - 290px);
  filter: drop-shadow(40px 400px 16px #646cffaa);
  z-index: 1;
  position: relative;
  width: 340px;
  transform: rotate(-10deg);
  visibility: hidden;
}

@keyframes shimmer {
  100% {
    background-position-x: 0;
  }
}
</style>
