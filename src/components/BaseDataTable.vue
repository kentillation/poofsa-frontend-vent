<template>
  <v-data-table-server
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="loading"
    :items-per-page="options.itemsPerPage"
    :page="options.page"
    @update:options="updateOptions"
    density="comfortable"
    class="elevation-1"
  >
  <!-- eslint-disable -->
    <template #body.prepend v-if="$attrs.isDev">
      <tr>
        <td :colspan="headers.length" style="background-color: #cce5ff; padding: 10px;">
          <strong>BaseDataTable received:</strong> {{ items.length }} items
          <pre style="background: #fff; padding: 5px; margin-top: 5px;">{{ JSON.stringify(items[0], null, 2) }}</pre>
        </td>
      </tr>
    </template>

    <slot />
  </v-data-table-server>
</template>

<script setup>
// Props from parent
// eslint-disable-next-line
const props = defineProps({
  headers: Array,
  items: Array,
  totalItems: Number,   // ✅ matches v-data-table-server
  loading: Boolean,
  options: Object,
})

// Emit options update for pagination
// eslint-disable-next-line
const emit = defineEmits(['update:options'])

const updateOptions = (val) => {
  emit('update:options', val)
}
</script>