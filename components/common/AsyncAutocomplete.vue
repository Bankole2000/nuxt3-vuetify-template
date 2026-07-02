<script setup lang="ts" >
const props = withDefaults(defineProps<{
  modelValue: any
  label?: string
  placeholder?: string
  itemTitle?: string
  itemValue?: string
  debounceMs?: number
  minChars?: number
  fetcher: (query: string) => Promise<unknown[]>
  multiple?: boolean
  clearable?: boolean
}>(), {
  modelValue: null,
  label: 'Search',
  placeholder: 'Type to search…',
  itemTitle: 'title',
  itemValue: 'id',
  debounceMs: 300,
  minChars: 1,
  multiple: false,
  clearable: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

const query = ref('')
const items = ref<unknown[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const search = async (val: string) => {
  if (val.length < props.minChars) { items.value = []; return }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    loading.value = true
    try {
      items.value = await props.fetcher(val)
    }
    finally {
      loading.value = false
    }
  }, props.debounceMs)
}

watch(query, search)
onUnmounted(() => { if (debounceTimer) clearTimeout(debounceTimer) })
</script>

<template>
  <v-autocomplete
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :loading="loading"
    :multiple="multiple"
    :clearable="clearable"
    :no-filter="true"
    variant="outlined"
    density="comfortable"
    hide-no-data
    @update:search="query = $event ?? ''"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="query.length < minChars" #no-data>
      <v-list-item>
        <v-list-item-title class="text-caption text-medium-emphasis">
          Type at least {{ minChars }} character{{ minChars > 1 ? 's' : '' }} to search
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>
