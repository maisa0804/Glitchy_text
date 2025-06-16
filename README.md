# Colorful Glitchy Shaggy WebGL Text

This project displays animated, colorful, glitchy, and shaggy text using WebGL and GLSL shaders. The text is rendered to a texture and post-processed in real time for vibrant, creative effects.

## Features

- WebGL rendering with TypeScript
- Custom fragment shader for colorful, fuzzy, and glitchy text
- Easy to customize text, font, and effects

## Demo

![screenshot](screenshot.png) <!-- Add a screenshot if you like -->

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn]

### Setup

1. Clone this repository:
   ```sh
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Customization

- To change the displayed text, edit `src/webgl.ts`:
  ```ts
  ctx.font = "bold 64px sans-serif";
  ctx.fillText("Just Do it", textCanvas.width / 2, textCanvas.height / 2);
  ```
- To adjust the glitch or shaggy effect, modify the fragment shader in `src/webgl.ts`.
- To change the canvas size, edit the `<canvas>` element in `src/main.ts`.

## Built With

- [Vite](https://vitejs.dev/) - Fast frontend tooling
- [TypeScript](https://www.typescriptlang.org/)
- WebGL & GLSL

## License

MIT (or specify your license)
