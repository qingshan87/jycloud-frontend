<template>
  <div class="setting-page">
    <!-- 查询区：独立一块 -->
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="字典码" name="code">
          <t-input v-model="query.code" placeholder="请输入字典码" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="字典名称" name="dictValue">
          <t-input v-model="query.dictValue" placeholder="请输入字典名称" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">查询</t-button>
            <t-button theme="default" type="reset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 工具 + 列表：同一块 -->
    <t-card :bordered="false" class="setting-content-card">
      <managed-table
        :data="visibleRows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="dictId"
        disable-data-page
        @change="onTableChange"
        @refresh="fetchList"
      >
        <template #toolbar-left>
          <div class="setting-toolbar">
            <t-button v-permission="PERM.dict.create" theme="primary" @click="openCreateType">
              <template #icon><t-icon name="add" /></template>
              新增字典类型
            </t-button>
            <t-button theme="default" @click="expandAll">展开全部</t-button>
            <t-button theme="default" @click="collapseAll">收起全部</t-button>
          </div>
        </template>
        <template #dictValue="{ row }">
          <div class="setting-dict-name-cell" :style="{ paddingLeft: `${row.level * 24}px` }">
            <span v-if="isExpandable(row)" class="setting-dict-toggle" @click.stop="toggleExpand(row)">
              <t-icon v-if="loadingChildrenKey === row.dictId" name="loading" class="setting-dict-toggle-loading" />
              <t-icon v-else :name="isRowExpanded(row.dictId) ? 'chevron-down' : 'chevron-right'" />
            </span>
            <span v-else class="setting-dict-toggle-placeholder" />
            <t-space :size="4">
              <t-tag v-if="row.parentId === 0" size="small" variant="light" theme="primary">类型</t-tag>
              <t-tag v-else size="small" variant="light" theme="default">项</t-tag>
              <span>{{ row.dictValue }}</span>
            </t-space>
          </div>
        </template>
        <template #code="{ row }">
          {{ row.parentId === 0 ? row.code : '-' }}
        </template>
        <template #dictKey="{ row }">
          {{ row.parentId === 0 ? '-' : row.dictKey }}
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link
              v-if="row.parentId === 0"
              v-permission="PERM.dict.create"
              theme="primary"
              @click="openCreateItem(row)"
              >新增字典项</t-link
            >
            <t-link v-permission="PERM.dict.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.dict.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </managed-table>
    </t-card>

    <!-- 新增/编辑字典类型弹窗 -->
    <t-dialog
      v-model:visible="typeVisible"
      :header="typeIsEdit ? '编辑字典类型' : '新增字典类型'"
      :confirm-btn="{ content: '保存', loading: typeSubmitting }"
      cancel-btn="取消"
      width="520px"
      @confirm="handleTypeSubmit"
    >
      <t-form ref="typeFormRef" :data="typeForm" :rules="typeRules" label-width="90px" @submit.prevent>
        <t-form-item label="字典码" name="code">
          <t-input v-model="typeForm.code" :disabled="typeIsEdit" placeholder="字母/数字/下划线，唯一" clearable />
        </t-form-item>
        <t-form-item label="字典名称" name="dictValue">
          <t-input v-model="typeForm.dictValue" placeholder="类型名称，如：性别" clearable />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="typeForm.sort" :min="0" :max="9999" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="typeForm.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="typeForm.remark" placeholder="请输入备注（可选）" :maxlength="255" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 新增/编辑字典项弹窗 -->
    <t-dialog
      v-model:visible="itemVisible"
      :header="itemIsEdit ? '编辑字典项' : '新增字典项'"
      :confirm-btn="{ content: '保存', loading: itemSubmitting }"
      cancel-btn="取消"
      width="520px"
      @confirm="handleItemSubmit"
    >
      <t-form ref="itemFormRef" :data="itemForm" :rules="itemRules" label-width="90px" @submit.prevent>
        <t-form-item label="所属类型">
          <t-input :value="parentLabel" readonly />
        </t-form-item>
        <t-form-item label="字典值" name="dictKey">
          <t-input v-model="itemForm.dictKey" placeholder="存储值，如：1" clearable />
        </t-form-item>
        <t-form-item label="字典名称" name="dictValue">
          <t-input v-model="itemForm.dictValue" placeholder="显示名，如：男" clearable />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="itemForm.sort" :min="0" :max="9999" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="itemForm.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="itemForm.remark" placeholder="请输入备注（可选）" :maxlength="255" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import { createDict, deleteDict, getDictTreeByCode, pageDicts, updateDict } from '@/api/setting/dict';
import type { DictForm, DictQuery, DictVO } from '@/api/setting/settingModel';
import ManagedTable from '@/components/managed-table/index.vue';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'SettingDict' });

const loading = ref(false);
const rows = ref<DictVO[]>([]);
const query = reactive<DictQuery>({
  pageNum: 1,
  pageSize: 10,
  code: '',
  dictValue: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

// ==================== 树展开状态 ====================
/** 当前展开的行主键 */
const expandedRowKeys = ref<Array<string | number>>([]);

/** 正在按需加载子级的行主键（用于展开图标 loading） */
const loadingChildrenKey = ref<number | undefined>();

/** 展平后的行（子级行携带 level，用于缩进） */
interface DictRow extends DictVO {
  level: number;
}

const visibleRows = computed<DictRow[]>(() => {
  const list: DictRow[] = [];
  const walk = (nodes: DictVO[], level: number) => {
    nodes.forEach((node) => {
      const row = node as DictRow;
      row.level = level;
      list.push(row);
      if (node.children && node.children.length > 0 && expandedRowKeys.value.includes(node.dictId)) {
        walk(node.children, level + 1);
      }
    });
  };
  walk(rows.value, 0);
  return list;
});

const isRowExpanded = (dictId: number) => expandedRowKeys.value.includes(dictId);

/** 类型节点始终可展开（未带子级时点击按需加载）；子项仅在已有子级时可展开 */
const isExpandable = (row: DictVO) => row.parentId === 0 || (row.children && row.children.length > 0);

const toggleExpand = async (row: DictVO) => {
  // 类型节点尚未带子级时，按字典码拉取整棵字典树并挂载到该行
  if (row.parentId === 0 && !row.children) {
    loadingChildrenKey.value = row.dictId;
    try {
      const tree = await getDictTreeByCode(row.code || '');
      row.children = tree?.children || [];
    } catch (e: any) {
      MessagePlugin.error(e?.message || '子级数据加载失败');
      return;
    } finally {
      loadingChildrenKey.value = undefined;
    }
  }
  if (isRowExpanded(row.dictId)) {
    expandedRowKeys.value = expandedRowKeys.value.filter((key) => key !== row.dictId);
  } else {
    expandedRowKeys.value = [...expandedRowKeys.value, row.dictId];
  }
};

/** 收集所有包含子节点的行主键（用于“展开全部”） */
const collectExpandableKeys = (list: DictVO[]): Array<string | number> => {
  const keys: Array<string | number> = [];
  const walk = (nodes: DictVO[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        keys.push(node.dictId);
        walk(node.children);
      }
    });
  };
  walk(list);
  return keys;
};

const expandAll = () => {
  expandedRowKeys.value = collectExpandableKeys(rows.value);
};

const collapseAll = () => {
  expandedRowKeys.value = [];
};

/** 数据刷新后只保留当前列表中还存在的展开主键，避免残留失效状态 */
const pruneExpandedKeys = (keys: Array<string | number>, list: DictVO[]): Array<string | number> => {
  const valid = new Set<string | number>();
  const walk = (nodes: DictVO[]) => {
    nodes.forEach((node) => {
      valid.add(node.dictId);
      walk(node.children || []);
    });
  };
  walk(list);
  return keys.filter((key) => valid.has(key));
};

const columns: PrimaryTableCol[] = [
  { colKey: 'dictValue', title: '字典名称', minWidth: 200 },
  { colKey: 'code', title: '字典码', width: 150 },
  { colKey: 'dictKey', title: '字典值', width: 120 },
  { colKey: 'sort', title: '排序', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'remark', title: '备注', minWidth: 180 },
  { colKey: 'op', title: '操作', width: 200, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const params: DictQuery = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      code: query.code || undefined,
      dictValue: query.dictValue || undefined,
    };
    const data = await pageDicts(params);
    rows.value = data.records || [];
    pagination.total = data.total || 0;
    expandedRowKeys.value = pruneExpandedKeys(expandedRowKeys.value, rows.value);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};

const handleReset = () => {
  query.code = '';
  query.dictValue = '';
  pagination.current = 1;
  fetchList();
};

const onTableChange = (changeParams: { pagination?: { current?: number; pageSize?: number } }) => {
  const { current, pageSize } = changeParams.pagination || {};
  if (current) pagination.current = current;
  if (pageSize) pagination.pageSize = pageSize;
  fetchList();
};

// ==================== 字典类型 ====================
const typeVisible = ref(false);
const typeIsEdit = ref(false);
const typeSubmitting = ref(false);
const typeFormRef = ref<FormInstanceFunctions>();
const typeForm = reactive<DictForm>({});

const typeRules: Record<string, FormRule[]> = {
  code: [{ required: true, message: '请输入字典码', type: 'error' }],
  dictValue: [{ required: true, message: '请输入字典名称', type: 'error' }],
};

const openCreateType = () => {
  typeIsEdit.value = false;
  Object.assign(typeForm, {
    dictId: undefined,
    parentId: 0,
    code: '',
    dictKey: undefined,
    dictValue: '',
    sort: 0,
    remark: '',
    status: 1,
  });
  typeVisible.value = true;
};

const openEditType = (row: DictVO) => {
  typeIsEdit.value = true;
  Object.assign(typeForm, {
    dictId: row.dictId,
    parentId: 0,
    code: row.code,
    dictKey: undefined,
    dictValue: row.dictValue,
    sort: row.sort ?? 0,
    remark: row.remark,
    status: row.status ?? 1,
  });
  typeVisible.value = true;
};

const handleTypeSubmit = async () => {
  const result = await typeFormRef.value?.validate();
  if (result !== true) return;
  typeSubmitting.value = true;
  try {
    if (typeIsEdit.value) {
      await updateDict(typeForm);
      MessagePlugin.success('修改成功');
    } else {
      await createDict(typeForm);
      MessagePlugin.success('创建成功');
    }
    typeVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    typeSubmitting.value = false;
  }
};

// ==================== 字典项 ====================
const itemVisible = ref(false);
const itemIsEdit = ref(false);
const itemSubmitting = ref(false);
const itemFormRef = ref<FormInstanceFunctions>();
const itemForm = reactive<DictForm>({});
const parentLabel = ref('');

const itemRules: Record<string, FormRule[]> = {
  dictKey: [{ required: true, message: '请输入字典值', type: 'error' }],
  dictValue: [{ required: true, message: '请输入字典名称', type: 'error' }],
};

const openCreateItem = (row: DictVO) => {
  itemIsEdit.value = false;
  parentLabel.value = `${row.dictValue}（${row.code}）`;
  Object.assign(itemForm, {
    dictId: undefined,
    parentId: row.dictId,
    code: undefined,
    dictKey: '',
    dictValue: '',
    sort: 0,
    remark: '',
    status: 1,
  });
  itemVisible.value = true;
};

const openEditItem = (row: DictVO, parent: DictVO | undefined) => {
  itemIsEdit.value = true;
  parentLabel.value = parent ? `${parent.dictValue}（${parent.code}）` : '';
  Object.assign(itemForm, {
    dictId: row.dictId,
    parentId: row.parentId ?? 0,
    code: undefined,
    dictKey: row.dictKey,
    dictValue: row.dictValue,
    sort: row.sort ?? 0,
    remark: row.remark,
    status: row.status ?? 1,
  });
  itemVisible.value = true;
};

const handleItemSubmit = async () => {
  const result = await itemFormRef.value?.validate();
  if (result !== true) return;
  itemSubmitting.value = true;
  try {
    if (itemIsEdit.value) {
      await updateDict(itemForm);
      MessagePlugin.success('修改成功');
    } else {
      await createDict(itemForm);
      MessagePlugin.success('创建成功');
      // 创建后自动展开父级，便于直接看到新增的字典项
      if (itemForm.parentId) {
        expandedRowKeys.value = Array.from(new Set<string | number>([...expandedRowKeys.value, itemForm.parentId]));
      }
    }
    itemVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    itemSubmitting.value = false;
  }
};

// ==================== 编辑 / 删除 ====================
/** 在树里向上查找指定行的父级（用于编辑字典项时展示所属类型） */
const findParent = (rows: DictVO[], row: DictVO): DictVO | undefined => {
  const walk = (list: DictVO[], parents: DictVO[]): DictVO | undefined => {
    for (const item of list) {
      if (item.dictId === row.dictId) return parents[parents.length - 1];
      const found = walk(item.children || [], [...parents, item]);
      if (found) return found;
    }
    return undefined;
  };
  return walk(rows, []);
};

const openEdit = (row: DictVO) => {
  if (row.parentId === 0) {
    openEditType(row);
  } else {
    openEditItem(row, findParent(rows.value, row));
  }
};

const handleDelete = (row: DictVO) => {
  const isType = row.parentId === 0;
  const dialog = DialogPlugin.confirm({
    header: isType ? '删除字典类型' : '删除字典项',
    body: isType
      ? `确定删除字典类型「${row.dictValue}」吗？其下所有字典项将一并删除。`
      : `确定删除字典项「${row.dictValue}（${row.dictKey}）」吗？`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteDict(row.dictId);
        MessagePlugin.success('删除成功');
        dialog.hide();
        fetchList();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '删除失败');
      }
    },
  });
};

onMounted(fetchList);
</script>
<style lang="less" scoped>
.setting-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
}

.setting-dict-name-cell {
  display: flex;
  align-items: center;
}

.setting-dict-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  color: var(--td-text-color-secondary);
  cursor: pointer;
  border-radius: var(--td-radius-default);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }
}

.setting-dict-toggle-placeholder {
  width: 24px;
  margin-right: 4px;
  flex-shrink: 0;
}

.setting-dict-toggle-loading {
  animation: setting-dict-spin 1s linear infinite;
}

@keyframes setting-dict-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
