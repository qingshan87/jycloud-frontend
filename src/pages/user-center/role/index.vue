<template>
  <div class="setting-page">
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="角色名称" name="roleName">
          <t-input v-model="query.roleName" placeholder="请输入角色名称" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <t-option label="启用" :value="1" />
            <t-option label="禁用" :value="0" />
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

    <t-card :bordered="false" class="setting-content-card">
      <managed-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="roleId"
        @change="onTableChange"
        @refresh="fetchList"
      >
        <template #toolbar-left>
          <div class="setting-toolbar">
            <t-button v-permission="PERM.ucenter.role.create" theme="primary" @click="openCreate">
              <template #icon><t-icon name="add" /></template>
              新增角色
            </t-button>
          </div>
        </template>
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
            <t-link v-permission="PERM.ucenter.role.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.ucenter.role.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </managed-table>
    </t-card>

    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑角色' : '新增角色'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="760px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="角色名称" name="roleName">
          <t-input v-model="form.roleName" placeholder="请输入角色名称" clearable />
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-input v-model="form.remark" placeholder="请输入备注" clearable />
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
        <t-form-item label="菜单权限" name="menuIds">
          <div class="uc-role-menu">
            <t-empty v-if="menuGroups.length === 0" description="当前租户暂无绑定应用" />
            <t-collapse v-else v-model="activeApps">
              <t-collapse-panel
                v-for="group in menuGroups"
                :key="group.clientId"
                :value="group.clientId"
                :disabled="!group.menuList || group.menuList.length === 0"
              >
                <template #header>
                  <div class="uc-role-app-title">
                    <t-icon :name="group.icon || 'app'" />
                    <span>{{ group.appName || group.clientId }}</span>
                    <t-tag size="small" variant="light" theme="primary" style="margin-left: 8px">
                      {{ checkedCount(group) }}
                    </t-tag>
                  </div>
                </template>
                <t-tree
                  v-if="group.menuList && group.menuList.length"
                  :data="group.menuList"
                  :keys="treeKeys"
                  :value="checkedMap[group.clientId] || []"
                  value-mode="all"
                  :loading="menuLoading"
                  checkable
                  check-strictly
                  expand-all
                  hover
                  @change="(val: Array<string | number>) => onGroupMenuChange(group, val)"
                >
                  <template #label="{ node }">
                    <span>{{ node.data.menuTitle || node.data.label || node.label }}</span>
                    <t-tag
                      v-if="node.data.category === 1"
                      size="small"
                      variant="light"
                      theme="warning"
                      style="margin-left: 4px"
                    >
                      按钮
                    </t-tag>
                  </template>
                </t-tree>
                <t-empty v-else description="该应用暂无菜单" />
              </t-collapse-panel>
            </t-collapse>
          </div>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { treeUcenterMenus } from '@/api/ucenter/authority';
import type {
  TenantClientMenuVO,
  UcenterMenuVO,
  UcenterRoleForm,
  UcenterRoleQuery,
  UcenterRoleVO,
} from '@/api/ucenter/model';
import {
  createUcenterRole,
  deleteUcenterRole,
  getUcenterRole,
  pageUcenterRoles,
  updateUcenterRole,
} from '@/api/ucenter/role';
import ManagedTable from '@/components/managed-table/index.vue';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'UcenterRole' });

const loading = ref(false);
const rows = ref<UcenterRoleVO[]>([]);
const query = reactive<UcenterRoleQuery>({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  status: undefined,
});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showJumper: true });

const columns: PrimaryTableCol[] = [
  { colKey: 'roleName', title: '角色名称', width: 180 },
  { colKey: 'remark', title: '备注', minWidth: 160 },
  { colKey: 'readonly', title: '角色类型', width: 90 },
  { colKey: 'sort', title: '排序', width: 80 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 140, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const data = await pageUcenterRoles({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      roleName: query.roleName || undefined,
      status: query.status,
    });
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

// 新增/编辑
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstanceFunctions>();
const form = reactive<UcenterRoleForm>({});
const rules: Record<string, FormRule[]> = {
  roleName: [{ required: true, message: '请输入角色名称', type: 'error' }],
};

// 按应用分组的菜单树（默认折叠，点击应用展开）
const menuLoading = ref(false);
const menuGroups = ref<TenantClientMenuVO[]>([]);
/** 展开的应用 clientId 列表 */
const activeApps = ref<Array<string | number>>([]);
/** 每个应用下已勾选的菜单 ID，key 为 clientId */
const checkedMap = ref<Record<string, number[]>>({});
const treeKeys = { value: 'menuId', label: 'menuTitle', children: 'children' };

const checkedCount = (group: TenantClientMenuVO) => {
  const list = checkedMap.value[group.clientId] || [];
  return list.length > 0 ? `已选 ${list.length}` : '未选择';
};

const loadMenuTree = async () => {
  menuLoading.value = true;
  try {
    menuGroups.value = (await treeUcenterMenus()) || [];
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载菜单失败');
    menuGroups.value = [];
  } finally {
    menuLoading.value = false;
  }
};

const collectMenuIds = (menus: UcenterMenuVO[] | undefined): number[] => {
  const ids: number[] = [];
  (menus || []).forEach((item) => {
    ids.push(item.menuId);
    ids.push(...collectMenuIds(item.children));
  });
  return ids;
};

const onGroupMenuChange = (group: TenantClientMenuVO, value: Array<string | number>) => {
  checkedMap.value[group.clientId] = value.map(Number);
};

const openCreate = async () => {
  isEdit.value = false;
  Object.assign(form, {
    roleId: undefined,
    roleName: '',
    remark: '',
    sort: 0,
    status: 1,
    menuIds: [],
  });
  checkedMap.value = {};
  activeApps.value = [];
  dialogVisible.value = true;
  await loadMenuTree();
};

const openEdit = async (row: UcenterRoleVO) => {
  isEdit.value = true;
  Object.assign(form, {
    roleId: row.roleId,
    roleName: row.roleName,
    remark: row.remark,
    sort: row.sort ?? 0,
    status: row.status ?? 1,
    menuIds: [],
  });
  checkedMap.value = {};
  activeApps.value = [];
  dialogVisible.value = true;
  await loadMenuTree();
  try {
    const detail = await getUcenterRole(row.roleId);
    const ids = Array.isArray(detail.menuIds) ? detail.menuIds : [];
    const expand: Array<string | number> = [];
    menuGroups.value.forEach((group) => {
      const groupIds = collectMenuIds(group.menuList);
      const matched = ids.filter((id) => groupIds.includes(id));
      checkedMap.value[group.clientId] = matched;
      // 编辑时自动展开有已授权菜单的应用
      if (matched.length > 0) expand.push(group.clientId);
    });
    activeApps.value = expand;
  } catch {
    // 详情接口异常时保留已勾选为空
  }
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  submitting.value = true;
  try {
    form.menuIds = Object.values(checkedMap.value).flat();
    if (isEdit.value) {
      await updateUcenterRole(form);
      MessagePlugin.success('修改成功');
    } else {
      await createUcenterRole(form);
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

const handleDelete = (row: UcenterRoleVO) => {
  const dialog = DialogPlugin.confirm({
    header: '删除角色',
    body: `确定删除角色「${row.roleName}」吗？`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteUcenterRole(row.roleId);
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

.uc-role-menu {
  width: 100%;
  max-height: 420px;
  overflow: auto;
  border: 1px solid var(--td-component-stroke);
  border-radius: var(--td-radius-default);
  padding: 8px;
}

.uc-role-app-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--td-text-color-primary);
}
</style>
