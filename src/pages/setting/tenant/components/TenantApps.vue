<template>
  <div>
    <!-- 列表 -->
    <managed-table :data="rows" :columns="columns" :loading="loading" row-key="id" @refresh="fetchList">
      <template #toolbar-left>
        <div class="tenant-apps-toolbar">
          <t-button v-permission="PERM.tenantClient.set" theme="primary" @click="openBind">
            <template #icon><t-icon name="add" /></template>
            绑定应用
          </t-button>
        </div>
      </template>
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
        <t-link v-permission="PERM.tenantClient.set" theme="danger" @click="handleUnbind(row)">移除</t-link>
      </template>
    </managed-table>
    <t-empty v-if="!loading && rows.length === 0" description="该租户暂未绑定应用" />

    <!-- 绑定应用弹窗 -->
    <t-dialog
      v-model:visible="bindVisible"
      header="绑定应用"
      :confirm-btn="{ content: '绑定', loading: binding }"
      cancel-btn="取消"
      width="520px"
      @confirm="handleBind"
    >
      <t-form label-width="90px">
        <t-form-item label="租户">
          <t-input :value="tenantName" readonly />
        </t-form-item>
        <t-form-item label="选择应用" required-mark>
          <t-select
            v-model="selectedClientId"
            placeholder="请选择要绑定的应用"
            filterable
            :options="bindOptions"
            :loading="clientLoading"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { PrimaryTableCol, SelectOption } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref, watch } from 'vue';

import { pageClients } from '@/api/setting/client';
import type { SettingClient, TenantClient } from '@/api/setting/settingModel';
import { bindTenantClient, listTenantClients, unbindTenantClient } from '@/api/setting/tenantClient';
import ManagedTable from '@/components/managed-table/index.vue';
import { DEFAULT_TENANT_ID, SETTING_CLIENT_ID } from '@/constants';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'TenantApps' });

const props = defineProps<{
  tenantId: string;
  tenantName: string;
}>();

const CATEGORY_MAP: Record<number, string> = { 0: '内部系统', 1: '业务系统', 2: '外部系统' };

const loading = ref(false);
const rows = ref<TenantClient[]>([]);

const columns: PrimaryTableCol[] = [
  { colKey: 'appName', title: '应用名称', minWidth: 160 },
  { colKey: 'clientId', title: '应用ID', width: 110 },
  { colKey: 'category', title: '类型', width: 110 },
  { colKey: 'website', title: '网站地址', width: 200 },
  { colKey: 'description', title: '简介', minWidth: 180 },
  { colKey: 'status', title: '绑定状态', width: 110 },
  { colKey: 'op', title: '操作', width: 90, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    rows.value = await listTenantClients(props.tenantId);
  } finally {
    loading.value = false;
  }
};

watch(() => props.tenantId, fetchList);

// ==================== 绑定 ====================
const bindVisible = ref(false);
const binding = ref(false);
const clientLoading = ref(false);
const selectedClientId = ref('');
const allClients = ref<SettingClient[]>([]);
const bindOptions = ref<SelectOption[]>([]);

const loadClients = async () => {
  clientLoading.value = true;
  try {
    const data = await pageClients({ pageNum: 1, pageSize: 200, status: 1 });
    allClients.value = data.records || [];
    const boundIds = new Set(rows.value.map((item) => item.clientId));
    bindOptions.value = allClients.value
      .filter((client) => !boundIds.has(client.clientId))
      // 设置平台仅系统租户（默认租户）可绑定，其他租户不可选择
      .filter((client) => props.tenantId === DEFAULT_TENANT_ID || client.clientId !== SETTING_CLIENT_ID)
      .map((client) => ({
        label: `${client.appName}（${client.clientId}）`,
        value: client.clientId,
      }));
  } finally {
    clientLoading.value = false;
  }
};

const openBind = () => {
  selectedClientId.value = '';
  bindVisible.value = true;
  loadClients();
};

const handleBind = async () => {
  if (!selectedClientId.value) {
    MessagePlugin.warning('请选择要绑定的应用');
    return;
  }
  binding.value = true;
  try {
    await bindTenantClient({ tenantId: props.tenantId, clientId: selectedClientId.value, status: 1 });
    MessagePlugin.success('绑定成功');
    bindVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '绑定失败');
  } finally {
    binding.value = false;
  }
};

const handleUnbind = (row: TenantClient) => {
  const dialog = DialogPlugin.confirm({
    header: '移除应用',
    body: `确定移除应用「${row.appName}」与当前租户的绑定吗？`,
    theme: 'warning',
    onConfirm: async () => {
      try {
        await unbindTenantClient(row.id);
        MessagePlugin.success('移除成功');
        dialog.hide();
        fetchList();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '移除失败');
      }
    },
  });
};

onMounted(fetchList);
</script>
<style lang="less" scoped>
.tenant-apps-toolbar {
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
