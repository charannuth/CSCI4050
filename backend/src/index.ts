import "dotenv/config";

import { createApp } from "./app";
import { getEnv } from "./env";

const env = getEnv();
const app = createApp({ corsOrigin: env.CORS_ORIGIN });

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});

