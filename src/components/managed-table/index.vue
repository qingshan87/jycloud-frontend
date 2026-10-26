<template>
  <t-enhanced-table
    :key="tableKey"
    v-bind="$attrs"
    v-model:display-columns="displayColumns"
    v-model:column-controller-visible="columnControllerVisible"
    :columns="columns"
    :column-controller="columnController"
  >
    <template #top-content>
      <div class="managed-table-toolbar">
        <div class="managed-table-toolbar-left">
          <slot name="toolbar-left" />
        </div>
        <div class="managed-table-toolbar-right">
          <slot name="toolbar-right" />
          <t-tooltip content="表格列配置" placement="top">
            <t-button shape="circle" variant="outline" title="表格列配置" @click="columnControllerVisible = true">
              <template #icon>
                <setting-icon class="managed-table-toolbar-icon" />
              </template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="刷新" placement="top">
            <t-button shape="circle" variant="outline" title="刷新" @click="refresh">
              <template #icon>
                <refresh-icon class="managed-table-toolbar-icon" />
              </template>
            </t-button>
          </t-tooltip>
        </div>
      </div>
    </template>
    <template v-for="(_, slotName) in forwardSlots" :key="slotName" #[slotName]="slotData">
      <slot :name="slotName" v-bind="slotData" />
    </template>
  </t-enhanced-table>
</template>
<script setup lang="ts">
import { RefreshIcon, SettingIcon } from 'tdesign-icons-vue-next';
import type { PrimaryTableCol, TableColumnController, TableRowData } from 'tdesign-vue-next';
import { computed, ref, useSlots, watch } from 'vue';

defineOptions({
  name: 'ManagedTable',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    columns?: PrimaryTableCol<TableRowData>[];
  }>(),
  {
    columns: () => [],
  },
);

const emit = defineEmits<{
  refresh: [];
}>();

const slots = useSlots();
const tableKey = ref(0);
const displayColumns = ref<string[]>([]);
const columnControllerVisible = ref(false);

const controllableColumnKeys = computed(() =>
  props.columns.filter((column) => !column.type && column.colKey !== undefined).map((column) => String(column.colKey)),
);

const columnController = computed<TableColumnController>(() => ({
  hideTriggerButton: true,
  placement: 'bottom-right',
  displayType: 'auto-width',
  fields: controllableColumnKeys.value,
}));

const forwardSlots = computed(() => {
  return Object.fromEntries(
    Object.entries(slots).filter(([slotName]) => !['top-content', 'toolbar-left', 'toolbar-right'].includes(slotName)),
  );
});

watch(
  controllableColumnKeys,
  (keys) => {
    displayColumns.value = [...keys];
  },
  { immediate: true },
);

/** 重置表格实例并通知页面重新请求数据 */
const refresh = () => {
  tableKey.value += 1;
  emit('refresh');
};

defineExpose({ refresh });
</script>
<style lang="less" scoped>
.managed-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;

  &-left {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  :deep(.setting-toolbar),
  :deep(.tenant-users-toolbar),
  :deep(.tenant-apps-toolbar) {
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.managed-table-toolbar-icon {
  font-size: 18px;
}
</style>
