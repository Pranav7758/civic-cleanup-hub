import app from "../server/index.js";

/** Vercel Node.js function limits — see https://vercel.com/docs/functions/configuring-functions/duration */
export const config = {
  maxDuration: 30,
};

export default app;
