/**
 * convex.config.ts
 * Convex app configuration with rate limiting component.
 */
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();
app.use(rateLimiter);

export default app;
