import { createHandler } from "@universal-middleware/hono";
import { Hono } from "hono";
import { vikeHandler } from "./server/vike-handler";
import { showHandler } from "./server/render-handler";

const app = new Hono();


app.get("/show", createHandler(() => showHandler)());

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(() => vikeHandler)());

export default app;
