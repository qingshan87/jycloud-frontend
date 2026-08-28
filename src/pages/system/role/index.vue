<template>
  <div class="setting-page">
    <!-- 查询区：独立一块 -->
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="租户" name="tenantId">
          <t-select
            v-model="query.tenantId"
            placeholder="全部租户"
            clearable
            filterable
            :options="tenantOptions"
            style="width: 220px"
          />
        </t-form-item>
        <t-form-item label="角色名称" name="roleName">
          <t-input v-model="query.roleName" placeholder="请输入角色名称" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <t-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </t-select>
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
      <div class="setting-toolbar">
        <t-button v-permission="PERM.role.create" theme="primary" @click="openCreate">
          <template #icon><t-icon name="add" /></template>
          新增管理员角色
        </t-button>
      </div>

      <t-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="roleId"
        @change="onTableChange"
      >
        <template #readonly="{ row }">
          <t-tag v-if="row.readonly === 1" theme="warning" variant="light">内置</t-tag>
          <t-tag v-else theme="default" variant="light">普通</t-tag>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="PERM.role.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.role.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑管理员角色' : '新增管理员角色'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="640px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="所属租户" name="tenantId">
          <t-select
            v-model="form.tenantId"
            :disabled="isEdit"
            placeholder="请选择租户"
            filterable
            :options="tenantOptions"
          />
        </t-form-item>
        <t-form-item label="角色名称" name="roleName">
          <t-select v-model="form.roleName" :disabled="isEdit" placeholder="请选择管理员角色名">
            <t-option label="租户管理员（tenant_admin）" value="tenant_admin" />
            <t-option label="平台管理员（client_admin）" value="client_admin" />
          </t-select>
        </t-form-item>
        <t-form-item label="角色描述" name="remark">
          <t-input v-model="form.remark" placeholder="请输入角色描述" clearable />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="form.sort" :min="0" :max="9999" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="所属应用" name="appId">
          <t-select
            v-model="selectedApp"
            :disabled="!form.tenantId"
            placeholder="请选择应用（租户已绑定应用）"
            clearable
            filterable
            :options="appOptions"
            @change="selectApp"
          />
        </t-form-item>
        <t-form-item label="菜单权限" name="menuIds">
          <div class="setting-role-menu">
            <div class="setting-role-menu-legend">
              <t-tag size="small" variant="light" theme="primary">菜单</t-tag>
              <span>页面/目录</span>
              <t-tag size="small" variant="light" theme="warning">按钮</t-tag>
              <span>操作权限</span>
            </div>
            <t-alert
              v-if="form.tenantId && appOptions.length === 0 && !menuLoading"
              theme="info"
              message="该租户暂未绑定应用，请先在租户管理中添加应用"
              style="margin-bottom: 8px"
            />
            <t-alert
              v-else-if="form.tenantId && selectedApp && menuTreeData.length === 0 && !menuLoading"
              theme="info"
              message="该应用暂未配置菜单"
              style="margin-bottom: 8px"
            />
            <t-tree
              v-if="menuTreeData.length > 0"
              :data="menuTreeData"
              :keys="treeKeys"
              :value="checkedMenuKeys"
              value-mode="all"
              :loading="menuLoading"
              checkable
              check-strictly
              expand-all
              hover
              @change="onMenuCheck"
            >
              <template #label="{ node }">
                <span class="setting-role-menu-label">
                  <span>{{ node.data.menuTitle || node.data.label || node.label }}</span>
                  <t-tag v-if="node.data.category === 1" size="small" variant="light" theme="warning">按钮</t-tag>
                  <t-tag v-else size="small" variant="light" theme="primary">菜单</t-tag>
                </span>
              </template>
            </t-tree>
          </div>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol, SelectOption, TreeOptionData } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { nextTick, onMounted, reactive, ref, watch } from 'vue';

import type { RoleForm, RoleQuery, SettingRole, SettingTenant } from '@/api/model/settingModel';
import { treeMenus } from '@/api/setting/menu';
import { createRole, deleteRole, detailRole, pageRoles, updateRole } from '@/api/setting/role';
import { pageTenants } from '@/api/setting/tenant';
import { listTenantClients } from '@/api/setting/tenantClient';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'SettingRole' });

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const loading = ref(false);
const rows = ref<SettingRole[]>([]);
const tenantOptions = ref<SelectOption[]>([]);
const query = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
  tenantId: undefined,
  roleName: '',
  status: undefined,
});
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'roleName', title: '角色名称', width: 160 },
  { colKey: 'tenantId', title: '租户ID', width: 100 },
  { colKey: 'readonly', title: '类型', width: 90 },
  { colKey: 'remark', title: '描述', minWidth: 180 },
  { colKey: 'sort', title: '排序', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 150, fixed: 'right' },
];

const loadTenantOptions = async () => {
  try {
    const data = await pageTenants({ pageNum: 1, pageSize: 200 });
    tenantOptions.value = (data.records || []).map((tenant: SettingTenant) => ({
      label: `${tenant.tenantName}（${tenant.tenantId}）`,
      value: tenant.tenantId,
    }));
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载租户列表失败');
  }
};

const fetchList = async () => {
  loading.value = true;
  try {
    const params: RoleQuery = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      tenantId: query.tenantId,
      roleName: query.roleName || undefined,
      status: query.status,
    };
    const data = await pageRoles(params);
    rows.value = data.records || [];
    pagination.total = data.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};

const handleReset = () => {
  query.tenantId = undefined;
  query.roleName = '';
  query.status = undefined;
  pagination.current = 1;
  fetchList();
};

const onTableChange = (changeParams: { pagination?: { current?: number; pageSize?: number } }) => {
  const { current, pageSize } = changeParams.pagination || {};
  if (current) pagination.current = current;
  if (pageSize) pagination.pageSize = pageSize;
  fetchList();
};

// ==================== 新增/编辑 ====================
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstanceFunctions>();
const form = reactive<RoleForm>({});

const rules: Record<string, FormRule[]> = {
  tenantId: [{ required: true, message: '请选择租户', type: 'error' }],
  roleName: [{ required: true, message: '请选择角色名称', type: 'error' }],
};

// ==================== 菜单授权树 ====================
const menuLoading = ref(false);
const menuTreeData = ref<TreeOptionData[]>([]);
const checkedMenuKeys = ref<Array<string | number>>([]);
const treeKeys = { value: 'menuId', label: 'label', children: 'children' };

/** 租户已绑定应用选项 + 当前选中的应用 */
const appOptions = ref<SelectOption[]>([]);
const selectedApp = ref('');
/** 每个应用已加载的菜单树缓存 */
const menuTreeCache = ref<Record<string, TreeOptionData[]>>({});
/** 每个应用已勾选的菜单 ID（原始勾选，用于回显） */
const displayCheckedByApp = ref<Record<string, number[]>>({});
/** 每个应用提交的菜单 ID（含自动补上的祖先菜单，用于提交） */
const checkedByApp = ref<Record<string, number[]>>({});

/** 统一转成 number 数组，兼容后端返回 number[] / string[] / "1,2,3" 等格式 */
const toNumberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) return value.map(Number).filter((n) => Number.isFinite(n));
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map(Number)
      .filter((n) => Number.isFinite(n));
  }
  return [];
};

const collectMenuIds = (nodes: TreeOptionData[]): number[] =>
  nodes.flatMap((node) => [Number(node.menuId), ...collectMenuIds((node.children as TreeOptionData[]) || [])]);

/** 在勾选结果上补充所有祖先菜单，保证按钮/子页面授权时父级菜单一并回传 */
const expandWithAncestors = (keys: number[], tree: TreeOptionData[]): number[] => {
  const keySet = new Set(keys);
  const result = new Set<number>();
  const walk = (nodes: TreeOptionData[], ancestors: number[]) => {
    nodes.forEach((node) => {
      const id = Number(node.menuId);
      if (keySet.has(id)) {
        ancestors.forEach((ancestor) => result.add(ancestor));
        result.add(id);
      }
      walk((node.children as TreeOptionData[]) || [], [...ancestors, id]);
    });
  };
  walk(tree, []);
  return [...result];
};

/** 切换应用：加载/刷新该应用的菜单树，并回填该应用已勾选的节点 */
const selectApp = async (clientId: string) => {
  if (!clientId) {
    selectedApp.value = '';
    menuTreeData.value = [];
    checkedMenuKeys.value = [];
    return;
  }
  // 先清空旧树，避免切换应用瞬间展示上一个应用的数据
  menuTreeData.value = [];
  checkedMenuKeys.value = [];
  if (!menuTreeCache.value[clientId]) {
    menuLoading.value = true;
    try {
      menuTreeCache.value[clientId] = await treeMenus(clientId);
    } catch (e: any) {
      MessagePlugin.error(e?.message || '加载菜单失败');
      menuTreeCache.value[clientId] = [];
    } finally {
      menuLoading.value = false;
    }
  }
  selectedApp.value = clientId;
  menuTreeData.value = menuTreeCache.value[clientId] || [];
  // 树渲染完成后再回填选中态，确保 checked 能正确生效
  await nextTick();
  checkedMenuKeys.value = displayCheckedByApp.value[clientId] || [];
};

/**
 * 加载租户已绑定的应用列表。
 * 编辑时传入已授权的 menuIds，会按应用预加载所有菜单树，把已勾选节点归位到各自应用。
 */
const loadAppOptions = async (tenantId: string, initialMenuIds: number[] = []) => {
  menuLoading.value = true;
  try {
    const boundClients = await listTenantClients(tenantId);
    appOptions.value = boundClients.map((client) => ({
      label: `${client.appName || client.clientId}（${client.clientId}）`,
      value: client.clientId,
    }));
    menuTreeCache.value = {};
    displayCheckedByApp.value = {};
    checkedByApp.value = {};
    if (initialMenuIds.length > 0) {
      // 编辑时预加载所有应用菜单树，把已有授权按应用归位
      for (const client of boundClients) {
        const menus = await treeMenus(client.clientId);
        menuTreeCache.value[client.clientId] = menus;
        const ids = collectMenuIds(menus);
        const raw = initialMenuIds.filter((id) => ids.includes(id));
        displayCheckedByApp.value[client.clientId] = raw;
        // 老数据可能只存了子节点，这里也统一补上祖先，保证提交时父级菜单完整
        checkedByApp.value[client.clientId] = expandWithAncestors(raw, menus);
      }
    }
    if (boundClients.length > 0) {
      // 编辑时优先选中第一个有已授权菜单的应用，避免打开弹窗看不到回显
      const defaultApp =
        initialMenuIds.length > 0
          ? boundClients.find((client) => (checkedByApp.value[client.clientId] || []).length > 0)
          : undefined;
      await selectApp((defaultApp || boundClients[0]).clientId);
    } else {
      selectedApp.value = '';
      menuTreeData.value = [];
      checkedMenuKeys.value = [];
    }
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载应用列表失败');
  } finally {
    menuLoading.value = false;
  }
};

watch(
  () => form.tenantId,
  (tenantId) => {
    if (tenantId && !isEdit.value) {
      loadAppOptions(tenantId as string);
    }
  },
);

const onMenuCheck = (value: Array<string | number>) => {
  checkedMenuKeys.value = value;
  const numericKeys = value.filter((item): item is number => typeof item === 'number');
  if (selectedApp.value) {
    displayCheckedByApp.value[selectedApp.value] = numericKeys;
    checkedByApp.value[selectedApp.value] = expandWithAncestors(numericKeys, menuTreeData.value);
  }
  // 提交时合并所有应用已勾选的菜单
  form.menuIds = Object.values(checkedByApp.value).flat();
};

const openCreate = async () => {
  isEdit.value = false;
  Object.assign(form, {
    tenantId: undefined,
    roleName: 'tenant_admin',
    remark: '',
    sort: 0,
    status: 1,
    menuIds: [],
  });
  selectedApp.value = '';
  appOptions.value = [];
  menuTreeCache.value = {};
  displayCheckedByApp.value = {};
  checkedByApp.value = {};
  checkedMenuKeys.value = [];
  menuTreeData.value = [];
  dialogVisible.value = true;
};

const openEdit = async (row: SettingRole) => {
  isEdit.value = true;
  Object.assign(form, {
    roleId: row.roleId,
    tenantId: row.tenantId,
    roleName: row.roleName,
    remark: row.remark,
    sort: row.sort ?? 0,
    status: row.status ?? 1,
    menuIds: [],
  });
  dialogVisible.value = true;
  try {
    const detail = await detailRole(row.roleId);
    const menuIds = toNumberArray(detail.menuIds);
    form.menuIds = menuIds;
    await loadAppOptions(row.tenantId as string, menuIds);
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载角色详情失败');
  }
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  // 提交前用补齐祖先后的集合兜底，避免漏掉父级菜单
  form.menuIds = Object.values(checkedByApp.value).flat();
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateRole(form);
      MessagePlugin.success('修改成功');
    } else {
      await createRole(form);
      MessagePlugin.success('创建成功');
    }
    dialogVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (row: SettingRole) => {
  const dialog = DialogPlugin.confirm({
    header: '删除角色',
    body: `确定删除角色「${row.roleName}」吗？内置角色不允许删除。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteRole(row.roleId);
        MessagePlugin.success('删除成功');
        dialog.hide();
        fetchList();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '删除失败');
      }
    },
  });
};

onMounted(() => {
  loadTenantOptions();
  fetchList();
});
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

  &-tip {
    margin-left: 8px;
    color: var(--td-text-color-placeholder);
    font-size: 12px;
  }
}

.setting-role-menu {
  width: 100%;
  max-height: 320px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--td-component-stroke);
  border-radius: var(--td-radius-default);
}

.setting-role-menu-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.setting-role-menu-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
