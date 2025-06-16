import "./style.css";
import { setupCounter } from "./counter.ts";
import { setupWebGL } from "./webgl";

const appDiv = document.querySelector<HTMLDivElement>("#app")!;
appDiv.innerHTML = `
  <div>
    <canvas id="webgl-canvas" width="400" height="300" style="border:1px solid #ccc;"></canvas>
  </div>
`;

setupWebGL(document.getElementById("webgl-canvas") as HTMLCanvasElement);

// Optionally keep the counter if you want to use it elsewhere
// setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
