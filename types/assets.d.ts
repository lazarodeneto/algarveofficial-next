// Declaration file for asset imports
// Next.js handles these imports at build time, but TypeScript needs declarations for typecheck

declare module "@/assets/*.webp" {
  const content: string;
  export default content;
}

declare module "leaflet/dist/images/*.png" {
  const content: string;
  export default content;
}
