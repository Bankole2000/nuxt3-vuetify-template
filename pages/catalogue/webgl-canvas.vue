<script setup lang="ts">
import type { ShaderProgram } from '~/components/common/WebGLCanvas.vue'

definePageMeta({ layout: 'catalogue' })
useSeo({
  title: 'WebGL Canvas',
  description: 'Raw WebGL2 shader canvas — plasma, raymarched sphere, Mandelbrot and noise field with u_time, u_resolution and u_mouse uniforms wired automatically.',
})

const VERTEX_SHADER = /* glsl */`#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG_PLASMA = /* glsl */`#version 300 es
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
out vec4 fragColor;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.5;
  float v = sin(uv.x * 10.0 + t) + sin(uv.y * 10.0 + t) + sin((uv.x + uv.y) * 10.0 + t);
  vec3 col = 0.5 + 0.5 * cos(v + vec3(0.0, 2.094, 4.189));
  fragColor = vec4(col, 1.0);
}`

const FRAG_RAYMARCHED_SPHERE = /* glsl */`#version 300 es
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
out vec4 fragColor;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sdSphere(p + e.xyy, 1.0) - sdSphere(p - e.xyy, 1.0),
    sdSphere(p + e.yxy, 1.0) - sdSphere(p - e.yxy, 1.0),
    sdSphere(p + e.yyx, 1.0) - sdSphere(p - e.yyx, 1.0)
  ));
}

float march(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 64; i++) {
    float d = sdSphere(ro + rd * t, 1.0);
    if (d < 0.001) return t;
    if (t > 20.0)  break;
    t += d;
  }
  return -1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

  float angle = u_time * 0.5;
  vec3 ro = vec3(sin(angle) * 3.0, 1.0, cos(angle) * 3.0);
  vec3 target = vec3(0.0);
  vec3 fwd = normalize(target - ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up = cross(fwd, right);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.8 * fwd);

  vec3 light = normalize(vec3(1.0, 2.0, 1.5));
  vec3 bgColor = vec3(0.05, 0.05, 0.12);

  float t = march(ro, rd);
  if (t < 0.0) {
    fragColor = vec4(bgColor, 1.0);
    return;
  }

  vec3 pos = ro + rd * t;
  vec3 nor = calcNormal(pos);
  vec3 halfDir = normalize(light - rd);

  float diff = max(dot(nor, light), 0.0);
  float spec = pow(max(dot(nor, halfDir), 0.0), 64.0);
  float amb  = 0.08;

  vec3 baseColor = vec3(0.2, 0.55, 1.0);
  vec3 col = baseColor * (diff + amb) + vec3(1.0) * spec;
  fragColor = vec4(col, 1.0);
}`

const FRAG_MANDELBROT = /* glsl */`#version 300 es
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
out vec4 fragColor;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  vec2 offset = (u_mouse - 0.5) * 2.5;
  float zoom  = 2.5;
  vec2 c = uv * zoom - offset;

  vec2 z = vec2(0.0);
  float iter = 0.0;
  const float MAX = 128.0;
  for (float i = 0.0; i < MAX; i++) {
    if (dot(z, z) > 4.0) { iter = i; break; }
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
  }

  float smooth_iter = iter - log2(log2(dot(z, z))) + 4.0;
  float t = smooth_iter / MAX;

  vec3 col = 0.5 + 0.5 * cos(3.0 + t * 15.0 + vec3(0.0, 0.6, 1.0));
  col *= step(0.001, t);
  fragColor = vec4(col, 1.0);
}`

const FRAG_NOISE_FIELD = /* glsl */`#version 300 es
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 6; i++) {
    v   += amp * valueNoise(p);
    p   *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p  = uv * 4.0 + vec2(u_time * 0.12, u_time * 0.08);
  float n = fbm(p + fbm(p + fbm(p)));

  vec3 colA = vec3(0.05, 0.12, 0.35);
  vec3 colB = vec3(0.15, 0.65, 0.90);
  vec3 colC = vec3(0.95, 0.75, 0.25);

  vec3 col = mix(colA, colB, smoothstep(0.2, 0.6, n));
  col      = mix(col,  colC, smoothstep(0.55, 0.85, n));

  fragColor = vec4(col, 1.0);
}`

const shaders: ShaderProgram[] = [
  { name: 'Plasma',             vertexShader: VERTEX_SHADER, fragmentShader: FRAG_PLASMA },
  { name: 'Raymarched Sphere',  vertexShader: VERTEX_SHADER, fragmentShader: FRAG_RAYMARCHED_SPHERE },
  { name: 'Mandelbrot Set',     vertexShader: VERTEX_SHADER, fragmentShader: FRAG_MANDELBROT },
  { name: 'Noise Field',        vertexShader: VERTEX_SHADER, fragmentShader: FRAG_NOISE_FIELD },
]

const shaderDescriptions = [
  'Classic plasma effect — sums of sinusoidal waves over UV coordinates and time, then remaps through a cosine palette to produce smooth, fluid colour gradients.',
  'Sphere ray-marching — a camera orbits the origin. For every pixel a ray is cast and advanced along a signed-distance field until it hits the sphere. Normals are derived analytically; Phong shading gives diffuse + specular highlights.',
  'Interactive Mandelbrot set — iterates z → z² + c for each pixel. Smooth iteration colouring removes hard banding. Move the mouse to pan across the complex plane.',
  'Fractal Brownian Motion noise — six octaves of value noise layered with domain warping (fbm inside fbm). Hue is mapped from a three-stop colour gradient, giving flowing liquid-light patterns.',
]

const shaderSources = [FRAG_PLASMA, FRAG_RAYMARCHED_SPHERE, FRAG_MANDELBROT, FRAG_NOISE_FIELD]

const activeTab   = ref(0)
const pausedState = ref([false, false, false, false])
const infoDialog  = ref(false)

</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-1">
      <h1 class="text-h5 font-weight-bold">WebGL Canvas</h1>
      <v-btn variant="text" prepend-icon="mdi-information-outline" size="small" @click="infoDialog = true">
        Use cases
      </v-btn>
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Raw WebGL2 shader canvas — pass any <code>ShaderProgram</code> and get
      <code>u_time</code>, <code>u_resolution</code> and <code>u_mouse</code> uniforms wired automatically.
    </p>

    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab v-for="(s, i) in shaders" :key="i" :value="i">{{ s.name }}</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item v-for="(s, i) in shaders" :key="i" :value="i">
        <CommonWebGLCanvas
          :shader="s"
          height="420px"
          :paused="pausedState[i] ?? false"
          @error="(msg) => console.error('[WebGLCanvas]', msg)"
        />

        <div class="d-flex align-center justify-space-between mt-4 mb-3 flex-wrap gap-3">
          <p class="text-body-2 text-medium-emphasis" style="max-width: 680px;">
            {{ shaderDescriptions[i] }}
          </p>
          <v-btn
            :prepend-icon="(pausedState[i] ?? false) ? 'mdi-play' : 'mdi-pause'"
            :color="(pausedState[i] ?? false) ? 'success' : 'warning'"
            variant="tonal"
            size="small"
            @click="pausedState[i] = !(pausedState[i] ?? false)"
          >
            {{ (pausedState[i] ?? false) ? 'Resume' : 'Pause' }}
          </v-btn>
        </div>

        <v-expansion-panels variant="accordion" class="mt-4">
          <v-expansion-panel title="Fragment shader source">
            <v-expansion-panel-text>
              <pre class="text-caption overflow-auto pa-4 rounded" style="background: rgba(var(--v-theme-surface-variant), 0.5); max-height: 480px;">{{ shaderSources[i] }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-window-item>
    </v-window>

    <v-dialog v-model="infoDialog" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">WebGL Canvas — use cases</v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-list density="compact" lines="two">
            <v-list-item
              prepend-icon="mdi-palette"
              title="Portfolio Manager (#1) — visual backgrounds"
              subtitle="Animated shader backgrounds replace static hero images while staying GPU-accelerated and infinitely scalable."
            />
            <v-list-item
              prepend-icon="mdi-video-outline"
              title="Loom Online (#6) — visual effects"
              subtitle="Real-time fragment shaders power colour correction, blur overlays and transition effects without CPU overhead."
            />
            <v-list-item
              prepend-icon="mdi-chart-scatter-plot"
              title="Data visualisation"
              subtitle="GPU-rendered scatter plots and heat-maps scale to millions of points — impossible with SVG or Canvas 2D."
            />
            <v-list-item
              prepend-icon="mdi-brush"
              title="Generative art"
              subtitle="Procedural textures, noise fields and fractals for creative tools, branding previews or NFT generators."
            />
            <v-list-item
              prepend-icon="mdi-school-outline"
              title="Shader education"
              subtitle="Live-editable GLSL with instant feedback — ideal for courses and documentation sites."
            />
          </v-list>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="tonal" @click="infoDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
