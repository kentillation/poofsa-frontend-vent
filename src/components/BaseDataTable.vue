<template>
  <v-data-table-server :headers="headers" :items="safeItems" :items-length="totalItems" :loading="loading"
    :items-per-page="options.itemsPerPage" :page="options.page" @update:options="updateOptions" density="comfortable"
    item-value="id" class="elevation-1">
    <template v-for="(fn, slotName) in filteredSlots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </v-data-table-server>
</template>

<script setup>
/* eslint-disable */
import { computed, useSlots } from 'vue'

const props = defineProps({
  headers: Array,
  items: Array,
  totalItems: Number,
  loading: Boolean,
  options: Object,
})

// compute slots that are actually functions (Vue may include null/undefined
// entries, which can later lead to the vnode->type error when iterating)
const slots = useSlots()

const filteredSlots = computed(() => {
  const out = {}

  for (const [name, fn] of Object.entries(slots || {})) {
    if (
      typeof fn === 'function' &&
      (
        name.startsWith('item.') ||
        name === 'top' ||
        name === 'no-data'
      )
    ) {
      out[name] = fn
    }
  }

  return out
})

const emit = defineEmits(['update:options'])

// Ensure items is always an array
const safeItems = computed(() => {
  if (!Array.isArray(props.items)) return []
  // remove any null/undefined entries that might slip through
  return props.items.filter(i => i && typeof i === 'object')
})

const updateOptions = (val) => {
  emit('update:options', val)
}
</script>