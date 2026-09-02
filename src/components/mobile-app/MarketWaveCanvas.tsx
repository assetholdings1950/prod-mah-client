"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
varying vec2 vUv;

float line(float value, float target, float width) {
  return smoothstep(width, 0.0, abs(value - target));
}

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 pointer = (uPointer - 0.5) * vec2(0.035 / aspect, 0.025);
  uv += pointer;

  float glow = 0.0;
  float dots = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float speed = 0.08 + fi * 0.025;
    float phase = fi * 1.73;
    float y = 0.34 + fi * 0.16
      + sin((uv.x * (6.0 + fi * 1.4)) + uTime * speed + phase) * (0.075 + fi * 0.012)
      + sin((uv.x * 14.0) - uTime * speed * 1.8 + phase) * 0.025;
    float waveLine = line(uv.y, y, 0.0055);
    float dash = 0.38 + 0.62 * smoothstep(0.15, 0.92, sin(uv.x * 145.0 + fi * 1.7));
    glow += waveLine * dash * (0.72 - fi * 0.08);

    float steps = 18.0 + fi * 5.0;
    float xCell = floor(uv.x * steps);
    float dotX = (xCell + 0.5) / steps;
    float dotY = 0.34 + fi * 0.16
      + sin((dotX * (6.0 + fi * 1.4)) + uTime * speed + phase) * (0.075 + fi * 0.012)
      + sin((dotX * 14.0) - uTime * speed * 1.8 + phase) * 0.025;
    float dotSize = length((uv - vec2(dotX, dotY)) * vec2(aspect, 1.0));
    dots += smoothstep(0.010, 0.0025, dotSize) * (0.86 - fi * 0.12);
  }

  float columns = smoothstep(0.92, 0.15, uv.y) * 0.06;
  columns *= step(0.88, fract(uv.x * 28.0 + hash(floor(uv.x * 28.0))));
  float vignette = smoothstep(0.95, 0.18, distance(vUv, vec2(0.5)));
  vec3 blue = vec3(0.16, 0.39, 1.0);
  vec3 color = blue * ((glow * 0.72) + (dots * 1.15) + columns) * vignette;
  float alpha = clamp((glow * 0.68 + dots * 1.15 + columns) * vignette, 0.0, 0.76);
  gl_FragColor = vec4(color, alpha);
}`;

export default function MarketWaveCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio, 1.5),
    });
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    host.appendChild(gl.canvas);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: [1, 1] },
      uPointer: { value: [0.5, 0.5] },
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex, fragment, uniforms, transparent: true });
    const mesh = new Mesh(gl, { geometry, program });
    let frame = 0;
    let visible = false;
    const pointerTarget = { x: 0.5, y: 0.5 };

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      renderer.setSize(clientWidth, clientHeight);
      uniforms.uResolution.value = [clientWidth, clientHeight];
    };
    const move = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointerTarget.x = (event.clientX - bounds.left) / bounds.width;
      pointerTarget.y = 1 - (event.clientY - bounds.top) / bounds.height;
    };
    const render = (time: number) => {
      uniforms.uTime.value = time * 0.001;
      uniforms.uPointer.value[0] += (pointerTarget.x - uniforms.uPointer.value[0]) * 0.035;
      uniforms.uPointer.value[1] += (pointerTarget.y - uniforms.uPointer.value[1]) * 0.035;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: "120px" });
    const handleVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    observer.observe(host);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", move);
    resize();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", move);
      gl.canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />;
}
