import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      exports: "default",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
    },
  ],
  external: ["react", "react-dom", "lucide-react"],
  plugins: [
    resolve(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-react", "@babel/preset-env"],
      plugins: [],
    }),
  ],
};
