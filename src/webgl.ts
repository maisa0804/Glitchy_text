export function setupWebGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("WebGL not supported");
    return;
  }

  // 1. Render 'Hello World' to an offscreen 2D canvas
  const textCanvas = document.createElement("canvas");
  textCanvas.width = 400;
  textCanvas.height = 100;
  const ctx = textCanvas.getContext("2d")!;
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
  ctx.font = "bold 64px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("Just Do it", textCanvas.width / 2, textCanvas.height / 2);

  // 2. Create a texture from the 2D canvas
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    textCanvas
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // 3. Vertex shader (full-rect)
  const vertexShaderSource = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
      vTexCoord = aTexCoord;
    }
  `;

  // 4. Fragment shader (glitchy + shaggy + colorful effect)
  const fragmentShaderSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    uniform float uTime;
    // Simple hash function for pseudo-randomness
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    // HSV to RGB
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    void main() {
      // Glitch: blocky horizontal offset based on y and time
      float block = floor(vTexCoord.y * 20.0);
      float glitch = (hash(vec2(block, floor(uTime * 7.0))) - 0.3) * 0.02;
      vec2 uv = vTexCoord + vec2(glitch, 0.0);
      // Colorful shaggy effect
      vec4 color = vec4(0.0);
      float total = 0.0;
      for (int i = 0; i < 8; i++) {
        float angle = 6.2831 * float(i) / 8.0;
        float radius = 0.012 + 0.008 * sin(uTime * 2.0 + float(i) * 1.7);
        vec2 offset = vec2(cos(angle), sin(angle)) * radius;
        float h = hash(uv * 50.0 + float(i) * 10.0 + uTime);
        offset *= 1.0 + 0.5 * (h - 0.5);
        float hue = mod(angle / 6.2831 + uTime * 0.1, 1.0);
        vec3 rgb = hsv2rgb(vec3(hue, 1.0, 1.0));
        color.rgb += texture2D(uTexture, uv + offset).rgb * rgb;
        color.a += texture2D(uTexture, uv + offset).a;
        total += 1.0;
      }
      color /= total;
      gl_FragColor = color;
    }
  `;

  function compileShader(type: number, source: string): WebGLShader {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      throw new Error(gl!.getShaderInfoLog(shader) || "Shader compile failed");
    }
    return shader;
  }

  // Compile shaders and link program
  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }
  gl.useProgram(program);

  // 5. Rectangle covering the canvas (two triangles)
  const vertices = new Float32Array([
    // x, y,   u, v
    -1, 1, 0, 0, -1, -1, 0, 1, 1, 1, 1, 0, 1, -1, 1, 1,
  ]);
  const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);

  // Create buffer for vertices
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Create buffer for indices
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // Set up attributes
  const aPosition = gl.getAttribLocation(program, "aPosition");
  const aTexCoord = gl.getAttribLocation(program, "aTexCoord");
  gl.enableVertexAttribArray(aPosition);
  gl.enableVertexAttribArray(aTexCoord);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

  // Set up uniforms
  const uTexture = gl.getUniformLocation(program, "uTexture");
  const uTime = gl.getUniformLocation(program, "uTime");
  gl.uniform1i(uTexture, 0);

  // Animation loop
  function render(time: number) {
    gl!.clearColor(0.2, 0.2, 0.8, 1.0);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uTime, time * 0.001);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    requestAnimationFrame(render);
  }
  render(0);
}
