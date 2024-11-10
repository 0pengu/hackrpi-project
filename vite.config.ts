import * as reactPlugin from "vite-plugin-react";
import type { UserConfig } from "vite";
import path from "path";

const config: UserConfig = {
  jsx: "react",
  plugins: [reactPlugin],
};

export default config;
