```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Use the custom SSR server entry defined in src/server.ts.
    server: {
      entry: "server",
    },
  },
});
```
