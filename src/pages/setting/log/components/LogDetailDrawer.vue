<template>
  <t-drawer
    :visible="visible"
    :header="title"
    size="720px"
    :footer="null"
    destroy-on-close
    @update:visible="emit('update:visible', $event)"
  >
    <t-descriptions bordered :column="1">
      <t-descriptions-item v-for="item in items" :key="item.label" :label="item.label">
        <pre v-if="item.code" class="log-detail-code">{{ item.value || '-' }}</pre>
        <span v-else class="log-detail-text">{{ item.value ?? '-' }}</span>
      </t-descriptions-item>
    </t-descriptions>
  </t-drawer>
</template>
<script setup lang="ts">
import type { LogDetailItem } from '../utils';

defineProps<{
  visible: boolean;
  title: string;
  items: LogDetailItem[];
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();
</script>
<style lang="less" scoped>
.log-detail-text {
  white-space: pre-wrap;
  word-break: break-all;
}

.log-detail-code {
  max-height: 360px;
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-family: var(--td-font-family-mono, monospace);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: var(--td-radius-default);
}
</style>
