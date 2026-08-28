<template>
  <div class="setting-page">
    <!-- 查询区：独立一块 -->
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="应用ID" name="clientId">
          <t-input v-model="query.clientId" placeholder="请输入应用ID" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="应用名称" name="appName">
          <t-input v-model="query.appName" placeholder="请输入应用名称" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="类型" name="category">
          <t-select v-model="query.category" placeholder="全部" clearable style="width: 140px">
            <t-option v-for="item in CATEGORY_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </t-select>
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
        <t-button v-permission="PERM.client.create" theme="primary" @click="openCreate">
          <template #icon><t-icon name="add" /></template>
          新增应用
        </t-button>
      </div>

      <t-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @change="onTableChange"
      >
        <template #category="{ row }">
          {{ CATEGORY_MAP[row.category ?? 1] || '-' }}
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #website="{ row }">
          <t-link v-if="row.website" theme="primary" :href="row.website" target="_blank">{{ row.website }}</t-link>
          <span v-else>-</span>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="PERM.client.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link theme="primary" @click="openDetail(row)">详情</t-link>
            <t-link v-permission="PERM.client.resetSecret" theme="primary" @click="handleResetSecret(row)"
              >重置秘钥</t-link
            >
            <t-link v-permission="PERM.client.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑应用' : '新增应用'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="560px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="应用名称" name="appName">
          <t-input v-model="form.appName" placeholder="请输入业务系统名称" clearable />
        </t-form-item>
        <t-form-item label="类型" name="category">
          <t-radio-group v-model="form.category">
            <t-radio v-for="item in CATEGORY_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="图标" name="icon">
          <t-input v-model="form.icon" placeholder="TDesign 图标名（可选）" clearable />
        </t-form-item>
        <t-form-item label="简介" name="description">
          <t-textarea v-model="form.description" placeholder="请输入业务系统简介" :maxlength="200" />
        </t-form-item>
        <t-form-item label="网站地址" name="website">
          <t-input v-model="form.website" placeholder="https://..." clearable />
        </t-form-item>
        <t-form-item label="合法IP" name="legalIp">
          <t-input v-model="form.legalIp" placeholder="多个IP用英文逗号分隔（可选）" clearable />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 详情抽屉 -->
    <t-drawer v-model:visible="detailVisible" header="应用详情" size="420px" :footer="null">
      <t-descriptions v-if="detail" bordered :column="1">
        <t-descriptions-item label="应用ID">{{ detail.clientId }}</t-descriptions-item>
        <t-descriptions-item label="应用名称">{{ detail.appName }}</t-descriptions-item>
        <t-descriptions-item label="类型">{{ CATEGORY_MAP[detail.category ?? 1] }}</t-descriptions-item>
        <t-descriptions-item label="AppKey">
          <span class="client-secret-value">{{ detail.appKey || '-' }}</span>
          <t-icon v-if="detail.appKey" name="copy" class="client-copy-icon" @click="copyText(detail.appKey)" />
        </t-descriptions-item>
        <t-descriptions-item label="AppSecret">
          <span class="client-secret-value">{{ detail.appSecret || '-' }}</span>
          <t-icon v-if="detail.appSecret" name="copy" class="client-copy-icon" @click="copyText(detail.appSecret)" />
        </t-descriptions-item>
        <t-descriptions-item label="网站地址">{{ detail.website || '-' }}</t-descriptions-item>
        <t-descriptions-item label="合法IP">{{ detail.legalIp || '-' }}</t-descriptions-item>
        <t-descriptions-item label="状态">
          <t-tag :theme="detail.status === 1 ? 'success' : 'danger'" variant="light">{{
            detail.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </t-descriptions-item>
        <t-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</t-descriptions-item>
      </t-descriptions>
    </t-drawer>

    <!-- 新秘钥展示 -->
    <t-dialog
      v-model:visible="secretVisible"
      header="应用秘钥"
      :confirm-btn="{ content: '知道了' }"
      :cancel-btn="null"
      width="520px"
      @confirm="secretVisible = false"
    >
      <t-alert theme="warning" message="请立即保存 AppKey 与 AppSecret，关闭后不再展示。" style="margin-bottom: 16px" />
      <t-form label-width="90px">
        <t-form-item label="AppKey">
          <t-input :value="secretData?.appKey" readonly>
            <template #suffix-icon>
              <t-icon name="copy" style="cursor: pointer" @click="copyText(secretData?.appKey)" />
            </template>
          </t-input>
        </t-form-item>
        <t-form-item label="AppSecret">
          <t-input :value="secretData?.appSecret" readonly>
            <template #suffix-icon>
              <t-icon name="copy" style="cursor: pointer" @click="copyText(secretData?.appSecret)" />
            </template>
          </t-input>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import type { ClientForm, ClientQuery, SettingClient } from '@/api/model/settingModel';
import {
  createClient,
  deleteClient,
  getClient,
  pageClients,
  resetClientSecret,
  updateClient,
} from '@/api/setting/client';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'SettingClient' });

const CATEGORY_OPTIONS = [
  { label: '内部系统', value: 0 },
  { label: '业务系统', value: 1 },
  { label: '外部系统', value: 2 },
];
const CATEGORY_MAP: Record<number, string> = { 0: '内部系统', 1: '业务系统', 2: '外部系统' };
const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const loading = ref(false);
const rows = ref<SettingClient[]>([]);
const query = reactive<ClientQuery>({
  pageNum: 1,
  pageSize: 10,
  clientId: '',
  appName: '',
  category: undefined,
  status: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'clientId', title: '应用ID', width: 100 },
  { colKey: 'appName', title: '应用名称', minWidth: 160 },
  { colKey: 'category', title: '类型', width: 110 },
  { colKey: 'appKey', title: 'AppKey', width: 180 },
  { colKey: 'website', title: '网站地址', width: 200 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 220, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const params: ClientQuery = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      clientId: query.clientId || undefined,
      appName: query.appName || undefined,
      category: query.category,
      status: query.status,
    };
    const data = await pageClients(params);
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
  query.clientId = '';
  query.appName = '';
  query.category = undefined;
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
const form = reactive<ClientForm>({});

const rules: Record<string, FormRule[]> = {
  appName: [{ required: true, message: '请输入应用名称', type: 'error' }],
};

const openCreate = () => {
  isEdit.value = false;
  Object.assign(form, {
    appName: '',
    category: 1,
    icon: '',
    description: '',
    website: '',
    legalIp: '',
    status: 1,
  });
  dialogVisible.value = true;
};

const openEdit = (row: SettingClient) => {
  isEdit.value = true;
  Object.assign(form, {
    id: row.id,
    appName: row.appName,
    category: row.category ?? 1,
    icon: row.icon,
    description: row.description,
    website: row.website,
    legalIp: row.legalIp,
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
      await updateClient(form);
      MessagePlugin.success('修改成功');
    } else {
      await createClient(form);
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

// ==================== 详情 / 秘钥 / 删除 ====================
const detailVisible = ref(false);
const detail = ref<SettingClient | null>(null);
const openDetail = async (row: SettingClient) => {
  detail.value = row;
  detailVisible.value = true;
  try {
    // 详情接口返回完整实体（含 AppSecret），用于查看和复制
    detail.value = await getClient(row.id);
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载详情失败');
  }
};

const secretVisible = ref(false);
const secretData = ref<SettingClient | null>(null);
const handleResetSecret = (row: SettingClient) => {
  const dialog = DialogPlugin.confirm({
    header: '重置应用秘钥',
    body: `确定重置应用「${row.appName}」的 AppKey/AppSecret 吗？旧秘钥将立即失效。`,
    theme: 'warning',
    onConfirm: async () => {
      try {
        secretData.value = await resetClientSecret(row.id);
        fetchList();
        secretVisible.value = true;
        dialog.hide();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '重置失败');
      }
    },
  });
};

const copyText = async (text?: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    MessagePlugin.success('已复制');
  } catch {
    MessagePlugin.error('复制失败');
  }
};

const handleDelete = (row: SettingClient) => {
  const dialog = DialogPlugin.confirm({
    header: '删除应用',
    body: `确定删除应用「${row.appName}」吗？删除后不可恢复。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteClient(row.id);
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

.client-secret-value {
  font-family: var(--td-font-family-mono, monospace);
  word-break: break-all;
}

.client-copy-icon {
  margin-left: 8px;
  cursor: pointer;
  color: var(--td-text-color-secondary);
  vertical-align: middle;

  &:hover {
    color: var(--td-brand-color);
  }
}
</style>
