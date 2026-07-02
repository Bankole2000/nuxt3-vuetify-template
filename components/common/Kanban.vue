<script setup lang="ts">
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  assignee?: string;
  priority?: "low" | "medium" | "high";
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  cards: KanbanCard[];
}

const props = withDefaults(
  defineProps<{
    modelValue: KanbanColumn[];
    cardColor?: string;
  }>(),
  {
    cardColor: "surface",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: KanbanColumn[]): void;
  (
    e: "card-moved",
    payload: { card: KanbanCard; fromColumn: string; toColumn: string }
  ): void;
}>();

const columns = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// Drag state
const dragging = ref<{ card: KanbanCard; fromColId: string } | null>(null);
const overColId = ref<string | null>(null);
const overCardId = ref<string | null>(null);

const priorityColor: Record<string, string> = {
  low: "success",
  medium: "warning",
  high: "error",
};

const onDragStart = (card: KanbanCard, fromColId: string) => {
  dragging.value = { card, fromColId };
};

const onDragOverColumn = (colId: string) => {
  overColId.value = colId;
  overCardId.value = null;
};

const onDragOverCard = (cardId: string, colId: string) => {
  overColId.value = colId;
  overCardId.value = cardId;
};

const onDrop = (toColId: string) => {
  if (!dragging.value) return;
  const { card, fromColId } = dragging.value;
  if (fromColId === toColId && !overCardId.value) {
    dragging.value = null;
    return;
  }

  const next = columns.value.map((col) => ({ ...col, cards: [...col.cards] }));
  const fromCol = next.find((c) => c.id === fromColId)!;
  const toCol = next.find((c) => c.id === toColId)!;

  fromCol.cards = fromCol.cards.filter((c) => c.id !== card.id);

  if (overCardId.value && toColId === overColId.value) {
    const idx = toCol.cards.findIndex((c) => c.id === overCardId.value);
    toCol.cards.splice(idx, 0, card);
  } else {
    toCol.cards.push(card);
  }

  emit("update:modelValue", next);
  emit("card-moved", { card, fromColumn: fromColId, toColumn: toColId });
  dragging.value = null;
  overColId.value = null;
  overCardId.value = null;
};

const onDragEnd = () => {
  dragging.value = null;
  overColId.value = null;
  overCardId.value = null;
};
</script>

<template>
  <div class="kanban d-flex gap-6 overflow-x-auto pb-2">
    <div
      v-for="col in columns"
      :key="col.id"
      class="kanban-column flex-shrink-0 d-flex flex-column gap-2 rounded-lg pa-3 mr-2"
      :class="overColId === col.id ? 'kanban-col-over' : ''"
      style="
        width: 280px;
        min-height: 200px;
        background: rgba(var(--v-border-color), 0.04);
        border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
      "
      @dragover.prevent="onDragOverColumn(col.id)"
      @drop.prevent="onDrop(col.id)"
    >
      <!-- Column header -->
      <div class="d-flex align-center gap-2 mb-1 px-1">
        <div
          class="rounded-circle flex-shrink-0"
          :style="{
            width: '10px',
            height: '10px',
            background: col.color ?? 'rgb(var(--v-theme-primary))',
          }"
        />
        <span class="text-body-2 font-weight-bold flex-1">{{ col.title }}</span>
        <v-chip size="x-small" variant="tonal">{{ col.cards.length }}</v-chip>
      </div>

      <!-- Cards -->
      <div
        v-for="card in col.cards"
        :key="card.id"
        class="kanban-card rounded-lg pa-3 my-1"
        :class="[
          dragging?.card.id === card.id ? 'kanban-card-dragging' : '',
          overCardId === card.id ? 'kanban-card-over' : '',
        ]"
        :style="{
          background: `rgb(var(--v-theme-${cardColor}))`,
          cursor: 'grab',
          border:
            '1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.6))',
        }"
        draggable="true"
        @dragstart="onDragStart(card, col.id)"
        @dragend="onDragEnd"
        @dragover.prevent.stop="onDragOverCard(card.id, col.id)"
      >
        <!-- Priority + tags -->
        <div
          v-if="card.priority || card.tags?.length"
          class="d-flex flex-wrap gap-1 mb-2"
        >
          <v-chip
            v-if="card.priority"
            :color="priorityColor[card.priority]"
            size="x-small"
            variant="tonal"
          >
            {{ card.priority }}
          </v-chip>
          <v-chip
            v-for="tag in card.tags"
            :key="tag"
            size="x-small"
            variant="outlined"
          >
            {{ tag }}
          </v-chip>
        </div>

        <p class="text-body-2 font-weight-bold mb-1">{{ card.title }}</p>
        <p
          v-if="card.description"
          class="text-caption text-medium-emphasis mb-0"
        >
          {{ card.description }}
        </p>

        <!-- Assignee -->
        <div v-if="card.assignee" class="d-flex align-center gap-2 mt-2">
          <v-avatar size="20" color="primary" variant="tonal">
            <span style="font-size: 9px">{{
              card.assignee.charAt(0).toUpperCase()
            }}</span>
          </v-avatar>
          <span class="text-caption text-medium-emphasis">{{
            card.assignee
          }}</span>
        </div>
      </div>

      <!-- Empty drop zone hint -->
      <div
        v-if="col.cards.length === 0"
        class="text-caption text-disabled text-center py-4"
      >
        Drop cards here
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-card {
  transition: opacity 0.15s, box-shadow 0.15s;
}
.kanban-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.kanban-card-dragging {
  opacity: 0.4;
}
.kanban-card-over {
  outline: 2px dashed rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.kanban-col-over {
  border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
