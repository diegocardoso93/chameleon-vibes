import { createHandler } from "@universal-middleware/hono";
import { Hono } from "hono";
import { vikeHandler, listVibeCardsHandler, generateKeyHandler, afterBuyHandler, beforeBuyHandler } from "./server/vike-handler";
import { showHandler } from "./server/render-handler";

const app = new Hono();

app.get("/api/generate-key", createHandler(() => generateKeyHandler)());
app.get("/api/list", createHandler(() => listVibeCardsHandler)());
app.post("/api/before-buy", createHandler(() => beforeBuyHandler)());
app.post("/api/after-buy", createHandler(() => afterBuyHandler)());
app.get("/show", createHandler(() => showHandler)());

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(() => vikeHandler)());

export default app;
