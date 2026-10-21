import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://santiloc-hub.github.io",
  base: "/santiloc-hub",
  integrations: [react()],
  output: "static",
});
