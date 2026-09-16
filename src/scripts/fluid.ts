// Pointer-driven liquid-glass distortion for the hero photo.
//
// A small stable-fluids solver runs on the GPU. Pointer movement injects velocity and a
// scalar "dye" into two low-resolution fields; the velocity field is made divergence-free
// with a Jacobi pressure solve, then both fields are carried along by the flow and slowly
// decay. The display pass samples the photo with its UVs pushed along the local flow by the
// amount of dye present, so the image bends like glass where the pointer has been, keeps
// drifting with the fluid for a moment, and settles within a couple of seconds.
//
// Falls back silently (the <img> underneath stays visible) when WebGL2 or float render
// targets are unavailable, on coarse pointers, or under prefers-reduced-motion.

type FBO = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };
type Double = { read: FBO; write: FBO; swap(): void; w: number; h: number };
type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };

const VERT = `#version 300 es
in vec2 a;
out vec2 uv, l, r, t, b;
uniform vec2 texel;
void main(){ uv = a * .5 + .5; l = uv - vec2(texel.x, 0.); r = uv + vec2(texel.x, 0.); t = uv + vec2(0., texel.y); b = uv - vec2(0., texel.y); gl_Position = vec4(a, 0., 1.); }`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;`;

const SPLAT = `${HEAD}
in vec2 uv; out vec4 o;
uniform sampler2D src; uniform float aspect; uniform vec2 point; uniform vec3 value; uniform float radius;
void main(){ vec2 d = uv - point; d.x *= aspect; vec3 s = .6 * exp2(-dot(d, d) / radius) * value; o = vec4(texture(src, uv).xyz + s, 1.); }`;

const DIVERGENCE = `${HEAD}
in vec2 uv, l, r, t, b; out vec4 o; uniform sampler2D vel;
void main(){ float L = texture(vel, l).x, R = texture(vel, r).x, T = texture(vel, t).y, B = texture(vel, b).y; o = vec4(.25 * (R - L + T - B), 0., 0., 1.); }`;

const PRESSURE = `${HEAD}
in vec2 uv, l, r, t, b; out vec4 o; uniform sampler2D pre; uniform sampler2D div;
void main(){ float L = texture(pre, l).x, R = texture(pre, r).x, T = texture(pre, t).x, B = texture(pre, b).x; o = vec4((L + R + B + T - texture(div, uv).x) * .25, 0., 0., 1.); }`;

const GRADIENT = `${HEAD}
in vec2 uv, l, r, t, b; out vec4 o; uniform sampler2D pre; uniform sampler2D vel;
void main(){ float L = texture(pre, l).x, R = texture(pre, r).x, T = texture(pre, t).x, B = texture(pre, b).x; vec2 v = texture(vel, uv).xy - vec2(R - L, T - B); o = vec4(v, 0., 1.); }`;

const ADVECT = `${HEAD}
in vec2 uv; out vec4 o; uniform sampler2D vel; uniform sampler2D src; uniform vec2 texel; uniform float dt, dissipation;
void main(){ vec2 back = uv - dt * texture(vel, uv).xy * texel; o = vec4(dissipation * texture(src, back).xyz, 1.); }`;

const DISPLAY = `${HEAD}
in vec2 uv; out vec4 o;
uniform sampler2D photo; uniform sampler2D vel; uniform sampler2D dye;
uniform float aspect, imgAspect, power, inner, dbg, disp, shine; uniform vec3 tint;
vec2 cover(vec2 p){ vec2 s = vec2(1.); if (aspect > imgAspect) s.y = imgAspect / aspect; else s.x = aspect / imgAspect; return p * s + .5; }
vec2 tex(vec2 p){ return vec2(clamp(p.x, 0., 1.), 1. - clamp(p.y, 0., 1.)); }
void main(){
  vec2 v = texture(vel, uv).xy + .001;
  float amount = texture(dye, uv).x;
  vec2 dir = normalize(v);
  vec2 shift = power * dir * amount * 2.;
  vec2 c = (uv - .5) / inner;
  vec2 base = cover(c);
  vec2 f = c + .5 - shift;
  // glass disperses light: each channel bends a little differently
  vec3 col = vec3(
    texture(photo, tex(base - shift * (1. + disp))).r,
    texture(photo, tex(base - shift)).g,
    texture(photo, tex(base - shift * (1. - disp))).b);
  float ink = smoothstep(0., .03, amount);
  col += tint * ink;
  // and catches the light where the flow faces the top-left
  col += shine * ink * pow(clamp(dot(dir, normalize(vec2(-.5, .85))), 0., 1.), 4.);
  if (dbg > .5) { o = vec4(amount * 25., length(v) * .01, 0., 1.); return; }
  float e = .004;
  float a = smoothstep(0., e, f.x) * smoothstep(1., 1. - e, f.x) * smoothstep(0., e, f.y) * smoothstep(1., 1. - e, f.y);
  o = vec4(col * a, a);
}`;

export type FluidOptions = {
  /** splat radius, 0.1–2 */ cursorSize?: number;
  /** dye injected per frame of movement */ cursorPower?: number;
  /** displacement strength */ distortion?: number;
  /** simulation resolution, 1–10 */ resolution?: number;
  /** colour added where the glass bends (r, g, b, 0–1) */ tint?: [number, number, number];
  /** chromatic dispersion: how far the red and blue channels bend apart, 0–0.5 */ dispersion?: number;
  /** highlight strength where the flow faces the light, 0–1 */ shine?: number;
};

export function mountFluid(host: HTMLElement, imageUrl: string, opts: FluidOptions = {}): (() => void) | null {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'fluid';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  if (!gl) return null;
  const floatOk = gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float');
  if (!floatOk) return null;

  const cursorSize = (opts.cursorSize ?? 0.5) * 0.001;
  const cursorPower = (opts.cursorPower ?? 0.6) * 0.012;
  const distortion = opts.distortion ?? 0.5;
  const tint = opts.tint ?? [0, 0, 0];
  const dispersion = opts.dispersion ?? 0.15;
  const shine = opts.shine ?? 0.2;
  const gridH = 128 + ((opts.resolution ?? 4) - 1) * 43;
  const OVERSCAN = 1.2;
  const debug = /[?&]fluiddebug/.test(location.search);
  let splats = 0;

  host.appendChild(canvas);

  /* ---------- GL helpers ---------- */
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const program = (frag: string): Prog => {
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'program');
    const u: Prog['u'] = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i)!;
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { p, u };
  };
  const makeFbo = (w: number, h: number): FBO => {
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { fbo, tex, w, h };
  };
  const makeDouble = (w: number, h: number): Double => {
    let a = makeFbo(w, h);
    let b = makeFbo(w, h);
    return { get read() { return a; }, get write() { return b; }, swap() { const t = a; a = b; b = t; }, w, h };
  };
  const release = (f: FBO) => { gl.deleteTexture(f.tex); gl.deleteFramebuffer(f.fbo); };
  const releaseD = (d: Double | null) => { if (d) { release(d.read); release(d.write); } };
  const bind = (unit: number, tex: WebGLTexture) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; };
  const draw = (target: FBO | null) => {
    if (target) { gl.viewport(0, 0, target.w, target.h); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
    else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const quad = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let splat: Prog, divergence: Prog, pressure: Prog, gradient: Prog, advect: Prog, display: Prog;
  try {
    splat = program(SPLAT); divergence = program(DIVERGENCE); pressure = program(PRESSURE);
    gradient = program(GRADIENT); advect = program(ADVECT); display = program(DISPLAY);
  } catch {
    canvas.remove();
    return null;
  }

  /* ---------- state ---------- */
  let vel: Double | null = null, dye: Double | null = null, pre: Double | null = null, div: FBO | null = null;
  let photo: WebGLTexture | null = null;
  let imgAspect = 1;
  // pointer samples queue up between frames; fast moves are subdivided so a stroke is a
  // continuous ribbon rather than a row of blobs (and 120 Hz mice inject as much as 60 Hz ones)
  const pointer = { x: 0, y: 0, inside: false };
  const samples: { x: number; y: number; dx: number; dy: number; n: number }[] = [];
  let raf = 0;
  let running = false;
  let visible = true;
  let lastFrame = 0;

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    // the refraction is low-frequency: cap the canvas so big/high-DPI screens stay fluid
    const dpr = Math.min(devicePixelRatio || 1, 1.5, 1600 / Math.max(1, w * OVERSCAN));
    canvas.width = Math.max(2, Math.round(w * OVERSCAN * dpr));
    canvas.height = Math.max(2, Math.round(h * OVERSCAN * dpr));
    canvas.style.width = `${w * OVERSCAN}px`;
    canvas.style.height = `${h * OVERSCAN}px`;
    const gw = Math.round(gridH * (w / Math.max(1, h)));
    releaseD(vel); releaseD(dye); releaseD(pre); if (div) release(div);
    vel = makeDouble(gw, gridH); dye = makeDouble(gw, gridH); pre = makeDouble(gw, gridH); div = makeFbo(gw, gridH);
  };

  const loadPhoto = () => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      imgAspect = im.naturalWidth / Math.max(1, im.naturalHeight);
      photo = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, photo);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      canvas.classList.add('is-ready');
      start();
    };
    im.src = imageUrl;
  };

  const pointUv = (x: number, y: number) => {
    const w = host.clientWidth * OVERSCAN, h = host.clientHeight * OVERSCAN;
    const ox = 0.5 * (w - host.clientWidth), oy = 0.5 * (h - host.clientHeight);
    return { u: (x + ox) / w, v: 1 - (y + oy) / h };
  };

  const frame = (now: number) => {
    raf = 0;
    if (!running || !vel || !dye || !pre || !div) return;
    const dt = Math.min(0.033, (now - lastFrame) / 1000 || 1 / 60);
    lastFrame = now;
    const frames = dt * 60; // decay is defined per 60 Hz frame; keep it stable on 120 Hz displays
    const aspect = host.clientWidth / Math.max(1, host.clientHeight);
    const tx = 1 / vel.w, ty = 1 / vel.h;

    if (samples.length) {
      gl.useProgram(splat.p);
      gl.uniform1f(splat.u.aspect, aspect);
      gl.uniform1f(splat.u.radius, cursorSize);
      for (const s of samples) {
        canvas.dataset.splats = String(++splats);
        const { u, v } = pointUv(s.x, s.y);
        gl.uniform2f(splat.u.point, u, v);
        gl.uniform1i(splat.u.src, bind(1, vel.read.tex));
        gl.uniform3f(splat.u.value, s.dx, -s.dy, 0);
        draw(vel.write); vel.swap();
        gl.uniform1i(splat.u.src, bind(1, dye.read.tex));
        // a long stroke lays down a little more ink than a short one, not n times more
        gl.uniform3f(splat.u.value, cursorPower / Math.sqrt(s.n), 0, 0);
        draw(dye.write); dye.swap();
      }
      samples.length = 0;
    }

    gl.useProgram(divergence.p);
    gl.uniform2f(divergence.u.texel, tx, ty);
    gl.uniform1i(divergence.u.vel, bind(1, vel.read.tex));
    draw(div);

    gl.useProgram(pressure.p);
    gl.uniform2f(pressure.u.texel, tx, ty);
    gl.uniform1i(pressure.u.div, bind(1, div.tex));
    for (let i = 0; i < 12; i++) {
      gl.uniform1i(pressure.u.pre, bind(2, pre.read.tex));
      draw(pre.write); pre.swap();
    }

    gl.useProgram(gradient.p);
    gl.uniform2f(gradient.u.texel, tx, ty);
    gl.uniform1i(gradient.u.pre, bind(1, pre.read.tex));
    gl.uniform1i(gradient.u.vel, bind(2, vel.read.tex));
    draw(vel.write); vel.swap();

    gl.useProgram(advect.p);
    gl.uniform2f(advect.u.texel, tx, ty);
    gl.uniform1i(advect.u.vel, bind(1, vel.read.tex));
    gl.uniform1i(advect.u.src, bind(1, vel.read.tex));
    gl.uniform1f(advect.u.dt, dt);
    gl.uniform1f(advect.u.dissipation, Math.pow(0.97, frames));
    draw(vel.write); vel.swap();
    gl.uniform1i(advect.u.vel, bind(1, vel.read.tex));
    gl.uniform1i(advect.u.src, bind(2, dye.read.tex));
    gl.uniform1f(advect.u.dt, dt * 8);
    gl.uniform1f(advect.u.dissipation, Math.pow(0.98, frames));
    draw(dye.write); dye.swap();

    gl.useProgram(display.p);
    gl.uniform1f(display.u.aspect, aspect);
    gl.uniform1f(display.u.imgAspect, imgAspect);
    gl.uniform1f(display.u.power, distortion);
    gl.uniform1f(display.u.inner, 1 / OVERSCAN);
    gl.uniform1f(display.u.dbg, debug ? 1 : 0);
    gl.uniform3f(display.u.tint, tint[0], tint[1], tint[2]);
    gl.uniform1f(display.u.disp, dispersion);
    gl.uniform1f(display.u.shine, shine);
    gl.uniform1i(display.u.vel, bind(2, vel.read.tex));
    gl.uniform1i(display.u.dye, bind(1, dye.read.tex));
    if (photo) gl.uniform1i(display.u.photo, bind(0, photo));
    draw(null);

    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || !visible || !photo) return;
    running = true;
    lastFrame = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  /* ---------- events ---------- */
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (pointer.inside) {
      const dx = x - pointer.x, dy = y - pointer.y;
      const n = Math.min(8, Math.max(1, Math.ceil(Math.hypot(dx, dy) / 12)));
      for (let i = 1; i <= n; i++) {
        samples.push({ x: pointer.x + (dx * i) / n, y: pointer.y + (dy * i) / n, dx: (6 * dx) / n, dy: (6 * dy) / n, n });
      }
      if (samples.length > 64) samples.splice(0, samples.length - 64);
    }
    pointer.x = x; pointer.y = y; pointer.inside = true;
  };
  const leave = () => { pointer.inside = false; samples.length = 0; };
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerleave', leave);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); }, { threshold: 0.02 });
  io.observe(host);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(host);
  const onLost = (e: Event) => { e.preventDefault(); stop(); canvas.classList.remove('is-ready'); };
  canvas.addEventListener('webglcontextlost', onLost);

  resize();
  loadPhoto();

  // dev probe: peak dye and |v| (used by the build's own tests)
  (canvas as HTMLCanvasElement & { __stats?: () => Record<string, number> }).__stats = () => {
    if (!vel || !dye) return { vmax: 0, dmax: 0 };
    const readMax = (f: FBO, comps: number) => {
      const buf = new Float32Array(f.w * f.h * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo);
      gl.readPixels(0, 0, f.w, f.h, gl.RGBA, gl.FLOAT, buf);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      let max = 0;
      for (let i = 0; i < buf.length; i += 4) { const m = comps === 2 ? Math.hypot(buf[i], buf[i + 1]) : buf[i]; if (m > max) max = m; }
      return max;
    };
    return { vmax: readMax(vel.read, 2), dmax: readMax(dye.read, 1) };
  };

  return () => {
    stop();
    io.disconnect(); ro.disconnect();
    host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave);
    document.removeEventListener('visibilitychange', onVis);
    canvas.removeEventListener('webglcontextlost', onLost);
    releaseD(vel); releaseD(dye); releaseD(pre); if (div) release(div);
    if (photo) gl.deleteTexture(photo);
    for (const pr of [splat, divergence, pressure, gradient, advect, display]) gl.deleteProgram(pr.p);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
}
