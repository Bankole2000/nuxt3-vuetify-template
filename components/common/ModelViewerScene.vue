<script setup lang="ts">
import type { ModelViewerConfig } from './ModelViewer.vue'

const props = defineProps<{
  config:          ModelViewerConfig
  gltfScene:       any
  autoRotateSpeed: number
}>()

const demoGroupRef = ref<any>(null)
const gltfGroupRef = ref<any>(null)

watch(() => props.config.wireframe, (on) => {
  const group = gltfGroupRef.value ?? demoGroupRef.value
  if (!group) return
  group.traverse((child: any) => {
    if (child.isMesh && child.material) child.material.wireframe = on
  })
})

const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  if (!props.config.autoRotate) return
  const speed = props.autoRotateSpeed * 0.007
  if (gltfGroupRef.value) {
    gltfGroupRef.value.rotation.y = elapsed * speed * 10
  }
  if (demoGroupRef.value) {
    demoGroupRef.value.children?.forEach((child: any, i: number) => {
      child.rotation.y = elapsed * speed * 10 * (1 + i * 0.1)
    })
  }
})
</script>

<template>
  <!-- Loaded GLTF model -->
  <primitive v-if="gltfScene" ref="gltfGroupRef" :object="gltfScene" />

  <!-- Built-in demo scene when no src -->
  <TresGroup v-else ref="demoGroupRef">
    <TresMesh :position="([-2.5, 0, 0] as any)">
      <TresBoxGeometry :args="[1.2, 1.2, 1.2]" />
      <TresMeshStandardMaterial
        color="#6c63ff"
        :roughness="0.4"
        :metalness="0.3"
        :wireframe="config.wireframe"
      />
    </TresMesh>
    <TresMesh :position="([0, 0, 0] as any)">
      <TresSphereGeometry :args="[0.75, 32, 32]" />
      <TresMeshStandardMaterial
        color="#48cae4"
        :roughness="0.3"
        :metalness="0.5"
        :wireframe="config.wireframe"
      />
    </TresMesh>
    <TresMesh :position="([2.5, 0, 0] as any)">
      <TresTorusKnotGeometry :args="[0.6, 0.2, 128, 16]" />
      <TresMeshStandardMaterial
        color="#f77f00"
        :roughness="0.35"
        :metalness="0.2"
        :wireframe="config.wireframe"
      />
    </TresMesh>
  </TresGroup>
</template>
