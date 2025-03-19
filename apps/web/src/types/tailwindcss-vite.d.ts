declare module "@tailwindcss/vite" {
  import { Plugin } from "vite";

  interface TailwindCSSOptions {
    config?: string;
    [key: string]: any;
  }

  function tailwindcssPlugin(options?: TailwindCSSOptions): Plugin;
  export default tailwindcssPlugin;
}
