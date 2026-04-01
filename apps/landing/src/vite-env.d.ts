/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module "*.png" {
  const content: string;
  export default content;
}
declare module "*.jpg" {
  const content: string;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}
declare module "*.webp" {
  const content: string;
  export default content;
}
