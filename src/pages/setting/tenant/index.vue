<template>
  <div class="setting-page">
    <!-- 查询区：独立一块 -->
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="租户ID" name="tenantId">
          <t-input v-model="query.tenantId" placeholder="请输入租户ID" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="租户名称" name="tenantName">
          <t-input v-model="query.tenantName" placeholder="请输入租户名称" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="联系人" name="linkman">
          <t-input v-model="query.linkman" placeholder="请输入联系人" clearable style="width: 140px" />
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
        <t-button v-permission="PERM.tenant.create" theme="primary" @click="openCreate">
          <template #icon><t-icon name="add" /></template>
          新增租户
        </t-button>
        <span class="setting-toolbar-tip">创建租户时系统会自动生成租户ID并创建「租户管理员」角色</span>
      </div>

      <t-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="onTableChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link theme="primary" @click="openDetail(row)">用户/应用</t-link>
            <t-link v-permission="PERM.tenant.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.tenant.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑租户' : '新增租户'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="560px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="租户名称" name="tenantName">
          <t-input v-model="form.tenantName" placeholder="请输入租户名称" clearable />
        </t-form-item>
        <t-form-item label="域名地址" name="domain">
          <t-input v-model="form.domain" placeholder="请输入域名地址（可选）" clearable />
        </t-form-item>
        <t-form-item label="联系人" name="linkman">
          <t-input v-model="form.linkman" placeholder="请输入联系人（可选）" clearable />
        </t-form-item>
        <t-form-item label="联系电话" name="contactTel">
          <t-input v-model="form.contactTel" placeholder="请输入联系电话（可选）" clearable />
        </t-form-item>
        <t-form-item label="联系地址" name="address">
          <t-input v-model="form.address" placeholder="请输入联系地址（可选）" clearable />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 详情抽屉：用户管理 + 应用管理 -->
    <t-drawer v-model:visible="detailVisible" :header="detailTitle" size="1200px" :footer="null" destroy-on-close>
      <t-tabs v-if="currentTenant" default-value="users">
        <t-tab-panel value="users" label="用户管理">
          <tenant-users :tenant-id="currentTenant.tenantId" :tenant-name="currentTenant.tenantName" />
        </t-tab-panel>
        <t-tab-panel value="apps" label="应用管理">
          <tenant-apps :tenant-id="currentTenant.tenantId" :tenant-name="currentTenant.tenantName" />
        </t-tab-panel>
      </t-tabs>
    </t-drawer>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import type { SettingTenant, TenantForm, TenantQuery } from '@/api/model/settingModel';
import { createTenant, deleteTenant, pageTenants, updateTenant } from '@/api/setting/tenant';
import { PERM } from '@/constants/permission';

import TenantApps from './components/TenantApps.vue';
import TenantUsers from './components/TenantUsers.vue';

defineOptions({ name: 'SettingTenant' });

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const loading = ref(false);
const rows = ref<SettingTenant[]>([]);
const query = reactive<TenantQuery>({
  pageNum: 1,
  pageSize: 10,
  tenantId: '',
  tenantName: '',
  linkman: '',
  status: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'tenantId', title: '租户ID', width: 100 },
  { colKey: 'tenantName', title: '租户名称', minWidth: 160 },
  { colKey: 'domain', title: '域名地址', width: 200 },
  { colKey: 'linkman', title: '联系人', width: 110 },
  { colKey: 'contactTel', title: '联系电话', width: 140 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 200, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const params: TenantQuery = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      tenantId: query.tenantId || undefined,
      tenantName: query.tenantName || undefined,
      linkman: query.linkman || undefined,
      status: query.status,
    };
    const data = await pageTenants(params);
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
  query.tenantId = '';
  query.tenantName = '';
  query.linkman = '';
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
const form = reactive<TenantForm>({});

const rules: Record<string, FormRule[]> = {
  tenantName: [{ required: true, message: '请输入租户名称', type: 'error' }],
};

const openCreate = () => {
  isEdit.value = false;
  Object.assign(form, {
    tenantName: '',
    domain: '',
    linkman: '',
    contactTel: '',
    address: '',
    status: 1,
  });
  dialogVisible.value = true;
};

const openEdit = (row: SettingTenant) => {
  isEdit.value = true;
  Object.assign(form, {
    id: row.id,
    tenantName: row.tenantName,
    domain: row.domain,
    linkman: row.linkman,
    contactTel: row.contactTel,
    address: row.address,
    status: row.status ?? 1,
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateTenant(form);
      MessagePlugin.success('修改成功');
    } else {
      await createTenant(form);
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

// ==================== 详情 ====================
const detailVisible = ref(false);
const currentTenant = ref<SettingTenant | null>(null);
const detailTitle = computed(() =>
  currentTenant.value ? `${currentTenant.value.tenantName}（${currentTenant.value.tenantId}）` : '租户详情',
);

const openDetail = (row: SettingTenant) => {
  currentTenant.value = row;
  detailVisible.value = true;
};

const handleDelete = (row: SettingTenant) => {
  const dialog = DialogPlugin.confirm({
    header: '删除租户',
    body: `确定删除租户「${row.tenantName}」吗？删除后不可恢复，默认租户不允许删除。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteTenant(row.id);
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

  &-tip {
    margin-left: 8px;
    color: var(--td-text-color-placeholder);
    font-size: 12px;
  }
}
</style>
