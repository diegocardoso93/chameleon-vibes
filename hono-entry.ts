import { createHandler } from "@universal-middleware/hono";
import { Hono } from "hono";
import { vikeHandler } from "./server/vike-handler";
import { listVibeCardsHandler, generateKeyHandler, afterBuyHandler, beforeBuyHandler } from "./server/api-handler";
import { showHandler } from "./server/show-page-handler";

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
