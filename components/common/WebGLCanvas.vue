<script setup lang="ts">
export interface ShaderProgram {
  name:           string
  vertexShader:   string
  fragmentShader: string
  uniforms?:      Record<string, number | number[]>
}

const props = withDefaults(defineProps<{
  shader:    ShaderProgram
  height?:   string
  animated?: boolean
  paused?:   boolean
}>(), {
  height:   '400px',
  animated: true,
  paused:   false,
})

const emit = defineEmits<{
  (e: 'ready', gl: WebGL2RenderingContext): void
  (e: 'error', message: string): void
}>()

const canvasRef  = ref<HTMLCanvasElement>()
const fps        = ref(0)
const showFps    = ref(false)

let gl:             WebGL2RenderingContext | null = null
let program:        WebGLProgram | null = null
let vao:            WebGLVertexArrayObject | null = null
let positionBuf:    WebGLBuffer | null = null
let rafId:          number | null = null
let startTime       = 0
let lastFpsTime     = 0
let frameCount      = 0
let mouseX          = 0
let mouseY          = 0
let resizeObserver: ResizeObserver | null = null

function compileShader(type: number, src: string): WebGLShader | null {
  if (!gl) return null
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'Unknown shader error'
    emit('error', log)
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function buildProgram(vs: string, fs: string): WebGLProgram | null {
  if (!gl) return null
  const vert = compileShader(gl.VERTEX_SHADER, vs)
  const frag = compileShader(gl.FRAGMENT_SHADER, fs)
  if (!vert || !frag) return null
  const prog = gl.createProgram()
  if (!prog) return null
  gl.attachShader(prog, vert)
  gl.attachShader(prog, frag)
  gl.linkProgram(prog)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog) ?? 'Unknown link error'
    emit('error', log)
    gl.deleteProgram(prog)
    return null
  }
  return prog
}

function setUniforms(prog: WebGLProgram, time: number, w: number, h: number) {
  if (!gl) return
  const uTime       = gl.getUniformLocation(prog, 'u_time')
  const uResolution = gl.getUniformLocation(prog, 'u_resolution')
  const uMouse      = gl.getUniformLocation(prog, 'u_mouse')
  if (uTime)       gl.uniform1f(uTime, time)
  if (uResolution) gl.uniform2f(uResolution, w, h)
  if (uMouse)      gl.uniform2f(uMouse, mouseX, mouseY)

  const custom = props.shader.uniforms
  if (!custom) return
  for (const [name, val] of Object.entries(custom)) {
    const loc = gl.getUniformLocation(prog, name)
    if (!loc) continue
    if (typeof val === 'number') {
      gl.uniform1f(loc, val)
    } else if (val.length === 2) {
      gl.uniform2fv(loc, val)
    } else if (val.length === 3) {
      gl.uniform3fv(loc, val)
    } else if (val.length === 4) {
      gl.uniform4fv(loc, val)
    }
  }
}

function render(now: number) {
  if (!gl || !program || !canvasRef.value) return
  rafId = requestAnimationFrame(render)
  if (props.paused) return

  frameCount++
  if (now - lastFpsTime >= 1000) {
    fps.value  = Math.round(frameCount * 1000 / (now - lastFpsTime))
    frameCount = 0
    lastFpsTime = now
  }

  const canvas = canvasRef.value
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.useProgram(program)
  setUniforms(program, (now - startTime) / 1000, canvas.width, canvas.height)
  gl.bindVertexArray(vao)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

function initGL() {
  const canvas = canvasRef.value
  if (!canvas) return

  gl = canvas.getContext('webgl2')
  if (!gl) {
    emit('error', 'WebGL2 not supported in this browser.')
    return
  }

  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ])

  vao         = gl.createVertexArray()
  positionBuf = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuf)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  loadShader()
}

function loadShader() {
  if (!gl) return
  if (program) {
    gl.deleteProgram(program)
    program = null
  }
  program = buildProgram(props.shader.vertexShader, props.shader.fragmentShader)
  if (!program) return
  emit('ready', gl)

  if (rafId !== null) cancelAnimationFrame(rafId)
  startTime   = performance.now()
  lastFpsTime = startTime
  frameCount  = 0
  if (props.animated) {
    rafId = requestAnimationFrame(render)
  } else {
    const canvas = canvasRef.value
    if (!canvas) return
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(program)
    setUniforms(program, 0, canvas.width, canvas.height)
    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

function handleMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouseX = (e.clientX - rect.left) / rect.width
  mouseY = 1.0 - (e.clientY - rect.top) / rect.height
}

function takeScreenshot() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `${props.shader.name.toLowerCase().replace(/\s+/g, '-')}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  initGL()

  const canvas = canvasRef.value
  if (!canvas) return

  resizeObserver = new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1
    canvas.width  = Math.round(canvas.clientWidth  * dpr)
    canvas.height = Math.round(canvas.clientHeight * dpr)
    if (!props.animated && program && gl) {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(program)
      setUniforms(program, 0, canvas.width, canvas.height)
      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  })
  resizeObserver.observe(canvas)
  canvas.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (gl) {
    if (program)     gl.deleteProgram(program)
    if (positionBuf) gl.deleteBuffer(positionBuf)
    if (vao)         gl.deleteVertexArray(vao)
  }
  resizeObserver?.disconnect()
  canvasRef.value?.removeEventListener('mousemove', handleMouseMove)
})

watch(() => props.shader, loadShader, { deep: true })

watch(() => props.paused, (paused) => {
  if (!paused && props.animated && rafId === null) {
    lastFpsTime = performance.now()
    frameCount  = 0
    rafId = requestAnimationFrame(render)
  }
})

defineExpose({ takeScreenshot })
</script>

<template>
  <div class="webgl-canvas-wrapper" :style="{ height: props.height }">
    <canvas ref="canvasRef" class="webgl-canvas" />

    <div class="webgl-overlay">
      <v-btn
        size="x-small"
        variant="tonal"
        :icon="showFps ? 'mdi-monitor-off' : 'mdi-monitor'"
        class="mr-1"
        @click="showFps = !showFps"
      />
      <v-btn
        size="x-small"
        variant="tonal"
        icon="mdi-camera"
        @click="takeScreenshot"
      />
    </div>

    <div v-if="showFps" class="webgl-fps text-caption font-weight-bold">
      {{ fps }} fps
    </div>
  </div>
</template>

<style scoped>
.webgl-canvas-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}

.webgl-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.webgl-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.webgl-fps {
  position: absolute;
  bottom: 8px;
  left: 8px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.45);
  padding: 2px 8px;
  border-radius: 4px;
  pointer-events: none;
}
</style>
