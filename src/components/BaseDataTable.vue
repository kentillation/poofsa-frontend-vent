<template>
  <v-data-table-server
    :headers="headers"
    :items="safeItems"
    :items-length="totalItems"
    :loading="loading"
    :items-per-page="options.itemsPerPage"
    :page="options.page"
    @update:options="updateOptions"
    density="comfortable"
    class="elevation-1"
  >
    <!-- Forward all slots to v-data-table-server -->
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>
  </v-data-table-server>
</template>

<script setup>
/* eslint-disable */
import { computed } from 'vue'

const props = defineProps({
  headers: Array,
  items: Array,
  totalItems: Number,
  loading: Boolean,
  options: Object,
})

const emit = defineEmits(['update:options'])

// Ensure items is always an array
const safeItems = computed(() => {
  return Array.isArray(props.items) ? props.items : []
})

const updateOptions = (val) => {
  emit('update:options', val)
}
</script>