<template>
  <div class="setting-page">
    <!-- 应用选择：独立一块 -->
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" label-width="90px">
        <t-form-item label="所属应用" required-mark>
          <t-select
            v-model="selectedClientId"
            placeholder="请选择应用"
            filterable
            :options="clientOptions"
            :loading="clientLoading"
            style="width: 280px"
          />
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 工具 + 列表：同一块 -->
    <t-card :bordered="false" class="setting-content-card">
      <div class="setting-toolbar">
        <t-button
          v-permission="PERM.menu.create"
          theme="primary"
          :disabled="!selectedClientId"
          @click="openCreate(0, 0)"
        >
          <template #icon><t-icon name="add" /></template>
          新增顶级菜单
        </t-button>
        <t-button theme="default" :disabled="!selectedClientId" @click="expandAll">展开全部</t-button>
        <t-button theme="default" :disabled="!selectedClientId" @click="collapseAll">收起全部</t-button>
      </div>

      <t-table
        v-if="selectedClientId"
        :data="visibleRows"
        :columns="columns"
        :loading="loading"
        row-key="menuId"
        bordered
        hover
      >
        <template #menuTitle="{ row }">
          <div class="setting-menu-title-cell" :style="{ paddingLeft: `${row.level * 24}px` }">
            <span v-if="row.children && row.children.length > 0" class="setting-menu-toggle" @click="toggleExpand(row)">
              <t-icon :name="isRowExpanded(row.menuId) ? 'chevron-down' : 'chevron-right'" />
            </span>
            <span v-else class="setting-menu-toggle-placeholder" />
            <span class="setting-menu-title-text">{{ row.menuTitle }}</span>
          </div>
        </template>
        <template #category="{ row }">
          <t-tag :theme="row.category === 1 ? 'default' : 'primary'" variant="light">
            {{ row.category === 1 ? '按钮' : '菜单' }}
          </t-tag>
        </template>
        <template #hide="{ row }">
          <t-tag v-if="row.hide === 1" theme="warning" variant="light">隐藏</t-tag>
          <span v-else>-</span>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <template v-if="row.category === 0">
              <t-link v-permission="PERM.menu.create" theme="primary" @click="openCreate(row.menuId, 0)">新增</t-link>
            </template>
            <t-link v-permission="PERM.menu.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.menu.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
      <t-empty v-else description="请先选择应用" />
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="600px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="100px" @submit.prevent>
        <t-form-item label="所属应用">
          <t-input :value="currentAppName" readonly />
        </t-form-item>
        <t-form-item
          label="类型"
          name="category"
          :help="isEdit ? '类型不可修改' : isTopLevel ? '顶级菜单只能是菜单，按钮需挂在菜单下' : ''"
        >
          <t-radio-group v-model="form.category" :disabled="isEdit">
            <t-radio :value="0">菜单</t-radio>
            <t-radio :value="1" :disabled="isTopLevel">按钮</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="菜单标题" name="menuTitle">
          <t-input v-model="form.menuTitle" placeholder="侧边栏显示名称" clearable />
        </t-form-item>
        <t-form-item label="上级菜单" name="parentId">
          <t-select v-model="form.parentId" :options="parentOptions" filterable placeholder="请选择上级菜单" />
        </t-form-item>
        <t-form-item label="菜单名称" name="menuName">
          <t-input v-model="form.menuName" placeholder="路由 name（可选）" clearable />
        </t-form-item>
        <template v-if="form.category === 0">
          <t-form-item label="路由路径" name="path">
            <t-input v-model="form.path" placeholder="如 /setting/user 或 user" clearable />
          </t-form-item>
          <t-form-item label="组件路径" name="component">
            <t-input v-model="form.component" placeholder="如 system/user/index" clearable />
          </t-form-item>
          <t-form-item label="图标" name="icon">
            <t-popup v-model:visible="iconPickerVisible" trigger="click" placement="bottom-start" expand-animation>
              <div class="icon-picker-trigger" :class="{ 'is-empty': !form.icon }">
                <t-icon v-if="form.icon" :name="form.icon" class="icon-picker-preview" />
                <span v-else class="icon-picker-placeholder">点击选择图标</span>
                <t-icon name="chevron-down" class="icon-picker-arrow" />
              </div>
              <template #content>
                <div class="icon-picker-panel">
                  <t-input
                    v-model="iconKeyword"
                    placeholder="搜索图标，如 user / setting / menu"
                    clearable
                    size="small"
                  >
                    <template #prefix-icon><t-icon name="search" /></template>
                  </t-input>
                  <div class="icon-picker-grid">
                    <div
                      v-for="item in filteredIconList"
                      :key="item"
                      class="icon-picker-item"
                      :class="{ 'is-active': form.icon === item }"
                      :title="item"
                      @click="selectIcon(item)"
                    >
                      <t-icon :name="item" size="18px" />
                    </div>
                  </div>
                  <div v-if="filteredIconList.length === 0" class="icon-picker-empty">未找到匹配的图标</div>
                  <div class="icon-picker-footer">
                    <span>共 {{ filteredIconList.length }} 个图标</span>
                    <t-link v-if="form.icon" theme="danger" @click="form.icon = ''">清除</t-link>
                  </div>
                </div>
              </template>
            </t-popup>
          </t-form-item>
        </template>
        <t-form-item label="权限标识" name="perms">
          <t-input v-model="form.perms" placeholder="按钮类型必填，如 setting:user:create" clearable />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="form.sort" :min="0" :max="9999" />
        </t-form-item>
        <t-form-item label="隐藏" name="hide">
          <t-radio-group v-model="form.hide">
            <t-radio :value="0">不隐藏</t-radio>
            <t-radio :value="1">隐藏</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { manifest } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, FormRule, PrimaryTableCol, SelectOption } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import type { MenuForm, SettingClient, SettingMenu } from '@/api/model/settingModel';
import { pageClients } from '@/api/setting/client';
import { createMenu, deleteMenu, treeMenus, updateMenu } from '@/api/setting/menu';
import { CLIENT_ID } from '@/constants';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'SettingMenu' });

const clientLoading = ref(false);
const clientOptions = ref<Array<{ label: string; value: string }>>([]);
// 默认选中当前应用（设置平台自身），进入页面即展示其菜单
const selectedClientId = ref(CLIENT_ID);

/** 当前选中应用的展示名称 */
const currentAppName = computed(() => {
  const option = clientOptions.value.find((item) => item.value === selectedClientId.value);
  return option ? String(option.label) : selectedClientId.value;
});

const loadClients = async () => {
  clientLoading.value = true;
  try {
    const data = await pageClients({ pageNum: 1, pageSize: 200 });
    clientOptions.value = (data.records || []).map((client: SettingClient) => ({
      label: `${client.appName}（${client.clientId}）`,
      value: client.clientId,
    }));
  } finally {
    clientLoading.value = false;
  }
};

const loading = ref(false);
const treeRows = ref<SettingMenu[]>([]);
const expandedTreeNodes = ref<Array<string | number>>([]);

/** 上级菜单选项：顶级 + 当前应用菜单树（仅菜单可作父级，排除自身及子级防止成环） */
const parentOptions = computed<SelectOption[]>(() => {
  // 按钮必须有上级菜单，不能作为顶级节点
  const options: SelectOption[] = form.category === 1 ? [] : [{ label: '顶级菜单', value: 0 }];
  const walk = (list: SettingMenu[], level: number) => {
    list.forEach((item) => {
      // 按钮不能作为父级；排除当前编辑的节点及其子树
      if (item.category !== 0 || item.menuId === form.menuId) return;
      options.push({
        label: `${'　'.repeat(level)}${item.menuTitle}`,
        value: item.menuId,
      });
      walk(item.children || [], level + 1);
    });
  };
  walk(treeRows.value, 0);
  return options;
});

/** 按展开状态把树拍平成表格行（level 用于缩进） */
const visibleRows = computed<Array<SettingMenu & { level: number }>>(() => {
  const result: Array<SettingMenu & { level: number }> = [];
  const walk = (list: SettingMenu[], level: number) => {
    list.forEach((item) => {
      result.push({ ...item, level });
      if (item.children && item.children.length > 0 && expandedTreeNodes.value.includes(item.menuId)) {
        walk(item.children, level + 1);
      }
    });
  };
  walk(treeRows.value, 0);
  return result;
});

const loadTree = async (clientId: string, resetExpand = false) => {
  loading.value = true;
  try {
    treeRows.value = await treeMenus(clientId);
    if (resetExpand) {
      // 切换应用后默认收起，只展示顶级菜单
      expandedTreeNodes.value = [];
    } else {
      // 数据刷新后只保留仍存在的展开节点，避免残留失效主键
      expandedTreeNodes.value = pruneExpandedKeys(expandedTreeNodes.value, treeRows.value);
    }
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载菜单失败');
  } finally {
    loading.value = false;
  }
};

/** 只保留当前树中仍存在的展开主键 */
const pruneExpandedKeys = (keys: Array<string | number>, list: SettingMenu[]): Array<string | number> => {
  const valid = new Set<string | number>();
  const walk = (nodes: SettingMenu[]) => {
    nodes.forEach((node) => {
      valid.add(node.menuId);
      walk(node.children || []);
    });
  };
  walk(list);
  return keys.filter((key) => valid.has(key));
};

/** 展开全部（仅对有子级的节点） */
const expandAll = () => {
  const keys: Array<string | number> = [];
  const walk = (list: SettingMenu[]) => {
    list.forEach((item) => {
      if (item.children && item.children.length > 0) {
        keys.push(item.menuId);
        walk(item.children);
      }
    });
  };
  walk(treeRows.value);
  expandedTreeNodes.value = keys;
};

/** 收起全部 */
const collapseAll = () => {
  expandedTreeNodes.value = [];
};

/** 判断某个父级菜单当前是否展开 */
const isRowExpanded = (menuId: number) => expandedTreeNodes.value.includes(menuId);

/** 展开/收起某个父级菜单 */
const toggleExpand = (row: SettingMenu) => {
  const index = expandedTreeNodes.value.indexOf(row.menuId);
  if (index >= 0) {
    expandedTreeNodes.value = expandedTreeNodes.value.filter((id) => id !== row.menuId);
  } else {
    expandedTreeNodes.value = [...expandedTreeNodes.value, row.menuId];
  }
};

const columns: PrimaryTableCol[] = [
  { colKey: 'menuTitle', title: '菜单标题', minWidth: 200 },
  { colKey: 'menuName', title: '菜单名称', width: 140 },
  { colKey: 'category', title: '类型', width: 90 },
  { colKey: 'path', title: '路由路径', width: 200 },
  { colKey: 'component', title: '组件路径', width: 200 },
  { colKey: 'perms', title: '权限标识', width: 180 },
  { colKey: 'sort', title: '排序', width: 70 },
  { colKey: 'hide', title: '隐藏', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'op', title: '操作', width: 170, fixed: 'right' },
];

// ==================== 新增/编辑 ====================
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstanceFunctions>();
const form = reactive<MenuForm>({});
const dialogTitle = ref('新增菜单');
const isTopLevel = computed(() => form.parentId === 0);

// ==================== 图标选择 ====================
const iconPickerVisible = ref(false);
const iconKeyword = ref('');
const allIconNames = manifest.map((item) => item.stem);
const filteredIconList = computed(() => {
  const keyword = iconKeyword.value.trim().toLowerCase();
  if (!keyword) return allIconNames;
  return allIconNames.filter((name) => name.includes(keyword));
});

const selectIcon = (name: string) => {
  form.icon = name;
  iconPickerVisible.value = false;
};

const rules: Record<string, FormRule[]> = {
  menuTitle: [{ required: true, message: '请输入菜单标题', type: 'error' }],
  category: [{ required: true, message: '请选择类型', type: 'error' }],
  parentId: [
    {
      validator: (val: number) => form.category !== 1 || !!val,
      message: '按钮必须选择上级菜单',
      type: 'error',
    },
  ],
  perms: [
    {
      validator: (val: string) => form.category !== 1 || !!val,
      message: '按钮必须填写权限标识',
      type: 'error',
    },
  ],
};

const resetForm = (category: number) => {
  Object.assign(form, {
    menuId: undefined,
    clientId: selectedClientId.value,
    parentId: 0,
    menuTitle: '',
    menuName: '',
    path: '',
    component: '',
    perms: '',
    icon: '',
    category,
    hide: 0,
    sort: 0,
    status: 1,
  });
};

const openCreate = (parentId: number, category: number) => {
  isEdit.value = false;
  // 顶级节点只能是菜单，按钮选项置灰并强制为菜单
  const finalCategory = parentId === 0 ? 0 : category;
  resetForm(finalCategory);
  form.parentId = parentId;
  dialogTitle.value = finalCategory === 1 ? '新增按钮' : parentId === 0 ? '新增顶级菜单' : '新增子菜单';
  dialogVisible.value = true;
};

const openEdit = (row: SettingMenu) => {
  isEdit.value = true;
  Object.assign(form, {
    menuId: row.menuId,
    clientId: row.clientId || selectedClientId.value,
    parentId: row.parentId ?? 0,
    menuTitle: row.menuTitle,
    menuName: row.menuName,
    path: row.path,
    component: row.component,
    perms: row.perms,
    icon: row.icon,
    category: row.parentId === 0 ? 0 : (row.category ?? 0),
    hide: row.hide ?? 0,
    sort: row.sort ?? 0,
    status: row.status ?? 1,
  });
  dialogTitle.value = row.category === 1 ? '编辑按钮' : '编辑菜单';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  // 提交前兜底：顶级节点强制为菜单
  if (form.parentId === 0) form.category = 0;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateMenu(form);
      MessagePlugin.success('修改成功');
    } else {
      await createMenu(form);
      MessagePlugin.success('创建成功');
    }
    dialogVisible.value = false;
    // 新增子节点后自动展开父级，便于直接看到新节点；编辑则保持原有展开状态
    if (!isEdit.value && form.parentId && !expandedTreeNodes.value.includes(form.parentId)) {
      expandedTreeNodes.value = [...expandedTreeNodes.value, form.parentId];
    }
    loadTree(selectedClientId.value);
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (row: SettingMenu) => {
  const dialog = DialogPlugin.confirm({
    header: '删除菜单',
    body: `确定删除「${row.menuTitle}」吗？存在子节点时需先删除子节点。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteMenu(row.menuId);
        MessagePlugin.success('删除成功');
        dialog.hide();
        loadTree(selectedClientId.value);
      } catch (e: any) {
        MessagePlugin.error(e?.message || '删除失败');
      }
    },
  });
};

watch(
  selectedClientId,
  (val) => {
    if (val) loadTree(val, true);
  },
  {
    immediate: true,
  },
);

onMounted(loadClients);
</script>
<style lang="less" scoped>
.setting-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-menu-title-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.setting-menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: var(--td-text-color-secondary);
  border-radius: var(--td-radius-default);

  &:hover {
    color: var(--td-brand-color);
    background: var(--td-bg-color-container-hover);
  }
}

.setting-menu-toggle-placeholder {
  display: inline-block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.setting-menu-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 280px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  background: var(--td-bg-color-container);
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--td-brand-color);
  }

  .icon-picker-preview {
    color: var(--td-text-color-primary);
    font-size: 18px;
  }

  .icon-picker-placeholder {
    color: var(--td-text-color-placeholder);
  }

  .icon-picker-arrow {
    margin-left: auto;
    color: var(--td-text-color-placeholder);
  }
}

.icon-picker-panel {
  width: 352px;
  padding: 8px;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 264px;
  margin-top: 8px;
  overflow-y: auto;
}

.icon-picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: var(--td-radius-default);
  cursor: pointer;
  color: var(--td-text-color-primary);

  &:hover {
    background: var(--td-bg-color-container-hover);
  }

  &.is-active {
    color: var(--td-brand-color);
    background: var(--td-brand-color-light);
  }
}

.icon-picker-empty {
  padding: 24px 0;
  color: var(--td-text-color-placeholder);
  text-align: center;
}

.icon-picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}

.setting-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
}

.setting-menu-tip {
  margin: 0;
  color: var(--td-text-color-placeholder);
  font-size: 12px;

  code {
    padding: 1px 4px;
    background: var(--td-bg-color-component);
    border-radius: var(--td-radius-default);
  }
}
</style>
