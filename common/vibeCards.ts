import { getConnectedAccountIds } from "../services/hashconnect";

export type VibeCard = {
  id: number,
  image: string,
  sound: string,
}

export const vibeCards: VibeCard[] = [{
  id: 1,
  image: '1.png',
  sound: 'b1.mp3',
}, {
  id: 2,
  image: '2.png',
  sound: 'b2.mp3',
}, {
  id: 3,
  image: '3.png',
  sound: 'b3.mp3',
}, {
  id: 4,
  image: '4.png',
  sound: 'b4.mp3',
}, {
  id: 5,
  image: '5.png',
  sound: 'b5.mp3',
}, {
  id: 6,
  image: '6.png',
  sound: 'b6.mp3',
}, {
  id: 7,
  image: '7.png',
  sound: 'b7.mp3',
}, {
  id: 8,
  image: '8.png',
  sound: 'b8.mp3',
}, {
  id: 9,
  image: '9.png',
  sound: 'b9.mp3',
}, {
  id: 10,
  image: '10.png',
  sound: 'b10.mp3',
}, {
  id: 11,
  image: '11.png',
  sound: 'b11.mp3',
}, {
  id: 12,
  image: '12.png',
  sound: 'b12.mp3',
}, {
  id: 13,
  image: '13.png',
  sound: 'b13.mp3',
}, {
  id: 14,
  image: '14.png',
  sound: 'b14.mp3',
}, {
  id: 15,
  image: '15.png',
  sound: 'b15.mp3',
}, {
  id: 16,
  image: '16.png',
  sound: 'b16.mp3',
}, {
  id: 17,
  image: '17.png',
  sound: 'b17.mp3',
}, {
  id: 18,
  image: '18.png',
  sound: 'b18.mp3',
}, {
  id: 19,
  image: '19.png',
  sound: 'b19.mp3',
}, {
  id: 20,
  image: '20.png',
  sound: 'b20.mp3',
}, {
  id: 21,
  image: '21.png',
  sound: 'b21.mp3',
}, {
  id: 22,
  image: '22.png',
  sound: 'b22.mp3',
}, {
  id: 23,
  image: '23.png',
  sound: 'b23.mp3',
}, {
  id: 24,
  image: '24.png',
  sound: 'b24.mp3',
}];

export async function loadVibeCards() {
  const fromAccountId = getConnectedAccountIds()[0]?.toString();
  if (!fromAccountId) {
    localStorage.setItem('cards', '[]');
    return;
  }
  console.log(fromAccountId);
  const resp = await fetch(`/api/list?accId=${fromAccountId}`, {
    method: 'GET',
    headers: {},
  });
  const json = await resp.json();
  localStorage.setItem('cards', JSON.stringify(json.cards));
}
