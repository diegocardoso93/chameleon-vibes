import type { UniversalHandler } from "@universal-middleware/core";
import { KVNamespace } from "@cloudflare/workers-types/experimental";
import fetch from 'node-fetch';
import { FormData } from 'formdata-node';
import { ErrorResponse, GeminiResponseUsed, ImgbbUploadApiResponse, SuccessResponse, UploadImageInputRequest } from "../common";

export const uploadImageHandler = (async (request, context, runtime: any): Promise<Response> => {
  console.log('keyHandler');
  const env = runtime.env;
  const DB: KVNamespace = env.DB;

  const { title, base64Image, user } = await request.json() as UploadImageInputRequest;
  if (!base64Image || !user || !title) {
    return ErrorResponse.new('invalid request');
  }

  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = base64Image.split(",")[0].replace('data:', '').replace(';base64', '');
  if (!await verifyImage(env, base64Data, mimeType)) {
    return ErrorResponse.new('invalid image be sure is your hand drawn');
  }

  const form = new FormData();
  form.append('image', base64Data);

  const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?expiration=0&key=${env.IMGBB_API_KEY}`, {
    method: 'POST',
    body: form as any
  })
  const responseJson = await uploadResponse.json() as ImgbbUploadApiResponse;
  console.log(responseJson);
  if (!responseJson?.data?.url) {
    return ErrorResponse.new('error uploading image');
  }

  const last = +(await DB.get('_LAST') || 0) + 1;
  const imageRecord = {
    id: last,
    title,
    url: responseJson.data.url,
    user,
    timestamp: Date.now(),
    visible: true,
  };
  await DB.put(`${last}`, JSON.stringify(imageRecord));
  await DB.put('_LAST', `${last}`);

  return SuccessResponse.new({ message: 'Success!', reg: imageRecord });
}) satisfies UniversalHandler;

// Verify if image representing a hand-drawn
export async function verifyImage(env: Env, base64Data: string, mimeType: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

  const requestData = {
    contents: [{
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
        { text: "Is this image a photo of a HUMAN hand drawn art? Reply with just Yes or No." },
      ]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  const json = await response.json() as GeminiResponseUsed;

  console.log(json.candidates[0].content.parts[0].text);
  const text = json.candidates[0].content.parts[0].text;

  return text?.toLocaleLowerCase()?.includes('yes');
}

// user: {
//   proof: "0x2d58bb23c7092382cebb3094d81815154cfc993f142ab32527f14de099210f7d1a048f7b48ffedf14698f033b92854c7ff04cdc041cad8888bc56665846dda4b1b00e4f7e006e29ecef2d045ceace19ceb0450d6cec18bfb65e166ee9478330f137a4d7d11b16301590ab4d0ab8efe14ae1f57442c89632247082c1811bd55f2073112cf3aa93b36df6ca31cb3001ebbc96e451a22186bf25c24d02a60e38a8005139b3d718da9c9474e1afd3274e5726fcd747a98347bdd6679663da018a90f0e2287b26a922defe0e929d3982649357ed2d9bbeaa646d3eb0f8f93a5ef87932e32cd94a50dd358a604baba4cb5fcfc96e20609a6f06362a8bd9e28d1a51387",
//   merkle_root: "0x2cd3d6964058685690533772da1bf14cd8116a37c4ff27eb6fc99c037ea485dd",
//   nullifier_hash: "0x2bc07d8d578be47279ab3c218383b1cc999a4d9df823ae6794434359ad129e1e",
//   verification_level: "orb"
// }
