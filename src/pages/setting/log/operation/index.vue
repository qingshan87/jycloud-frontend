<template>
  <div class="setting-page">
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="租户ID">
          <t-input v-model="query.tenantId" placeholder="请输入租户ID" clearable style="width: 140px" />
        </t-form-item>
        <t-form-item label="来源应用">
          <t-input v-model="query.serviceId" placeholder="如 jy-setting" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="操作结果">
          <t-select v-model="query.type" placeholder="全部" clearable style="width: 120px">
            <t-option v-for="item in RESULT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </t-select>
        </t-form-item>
        <t-form-item label="操作账号">
          <t-input v-model="query.username" placeholder="精确账号" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="操作描述">
          <t-input v-model="query.description" placeholder="精确描述" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="目标方法">
          <t-input v-model="query.actionMethod" placeholder="如 create" clearable style="width: 140px" />
        </t-form-item>
        <t-form-item label="请求地址">
          <t-input v-model="query.requestUri" placeholder="/system/..." clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="请求方式">
          <t-select v-model="query.httpMethod" placeholder="全部" clearable style="width: 120px">
            <t-option v-for="item in HTTP_METHODS" :key="item" :label="item" :value="item" />
          </t-select>
        </t-form-item>
        <t-form-item label="操作时间">
          <t-date-range-picker
            v-model="timeRange"
            enable-time-picker
            mode="date"
            format="YYYY-MM-DD HH:mm:ss"
            value-type="YYYY-MM-DD HH:mm:ss"
            clearable
            style="width: 360px"
          />
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
        row-key="id"
        @change="onTableChange"
        @refresh="fetchList"
      >
        <template #toolbar-left>
          <div class="setting-toolbar">
            <span class="setting-toolbar-title">系统操作日志</span>
            <span class="setting-toolbar-tip">记录业务操作、请求参数、返回值与异常信息</span>
          </div>
        </template>
        <template #type="{ row }">
          <t-tag :theme="getResultMeta(row.type).theme" variant="light">
            {{ getResultMeta(row.type).label }}
          </t-tag>
        </template>
        <template #httpMethod="{ row }">
          <t-tag v-if="row.httpMethod" theme="primary" variant="light">{{ row.httpMethod }}</t-tag>
          <span v-else>-</span>
        </template>
        <template #consumingTime="{ row }">{{ formatDuration(row.consumingTime) }}</template>
        <template #op="{ row }">
          <t-link theme="primary" @click="openDetail(row)">详情</t-link>
        </template>
      </managed-table>
    </t-card>

    <log-detail-drawer v-model:visible="detailVisible" :title="detailTitle" :items="detailItems" />
  </div>
</template>
<script setup lang="ts">
import type { PrimaryTableCol } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import { pageOperationLogs } from '@/api/setting/log';
import type { OperationLog } from '@/api/setting/logModel';
import ManagedTable from '@/components/managed-table/index.vue';

import LogDetailDrawer from '../components/LogDetailDrawer.vue';
import type { LogTimeRange } from '../utils';
import { formatDuration, formatJsonText, getResultMeta, toTimeParams } from '../utils';

defineOptions({ name: 'SettingLogOperation' });

const RESULT_OPTIONS = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 },
];
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface OperationLogFilter {
  tenantId: string;
  serviceId: string;
  type?: number;
  username: string;
  description: string;
  actionMethod: string;
  requestUri: string;
  httpMethod: string;
}

const loading = ref(false);
const rows = ref<OperationLog[]>([]);
const timeRange = ref<LogTimeRange>([]);
const query = reactive<OperationLogFilter>({
  tenantId: '',
  serviceId: '',
  type: undefined,
  username: '',
  description: '',
  actionMethod: '',
  requestUri: '',
  httpMethod: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'type', title: '结果', width: 80 },
  { colKey: 'serviceId', title: '来源应用', width: 130 },
  { colKey: 'username', title: '操作账号', width: 130, ellipsis: true },
  { colKey: 'description', title: '操作描述', minWidth: 170, ellipsis: true },
  { colKey: 'actionMethod', title: '目标方法', width: 140, ellipsis: true },
  { colKey: 'requestUri', title: '请求地址', minWidth: 200, ellipsis: true },
  { colKey: 'httpMethod', title: '方式', width: 90 },
  { colKey: 'consumingTime', title: '耗时', width: 100 },
  { colKey: 'createTime', title: '操作时间', width: 170 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const data = await pageOperationLogs({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      tenantId: query.tenantId || undefined,
      serviceId: query.serviceId || undefined,
      type: query.type,
      username: query.username || undefined,
      description: query.description || undefined,
      actionMethod: query.actionMethod || undefined,
      requestUri: query.requestUri || undefined,
      httpMethod: query.httpMethod || undefined,
      ...toTimeParams(timeRange.value),
    });
    rows.value = data.records || [];
    pagination.total = data.total || 0;
  } catch (error: any) {
    MessagePlugin.error(error?.message || '操作日志加载失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};

const handleReset = () => {
  Object.assign(query, {
    tenantId: '',
    serviceId: '',
    type: undefined,
    username: '',
    description: '',
    actionMethod: '',
    requestUri: '',
    httpMethod: '',
  });
  timeRange.value = [];
  pagination.current = 1;
  fetchList();
};

const onTableChange = (changeParams: { pagination?: { current?: number; pageSize?: number } }) => {
  const { current, pageSize } = changeParams.pagination || {};
  if (current) pagination.current = current;
  if (pageSize) pagination.pageSize = pageSize;
  fetchList();
};

const detailVisible = ref(false);
const currentLog = ref<OperationLog | null>(null);
const detailTitle = computed(() => (currentLog.value ? `操作日志 #${currentLog.value.id}` : '操作日志详情'));
const detailItems = computed(() => {
  const row = currentLog.value;
  if (!row) return [];
  return [
    { label: '日志ID', value: row.id },
    { label: '租户ID', value: row.tenantId },
    { label: '来源应用', value: row.serviceId },
    { label: '操作结果', value: getResultMeta(row.type).label },
    { label: '操作账号', value: row.username },
    { label: '操作人ID', value: row.createUid },
    { label: '操作描述', value: row.description },
    { label: '操作IP', value: row.ip },
    { label: '目标类', value: row.classPath },
    { label: '目标方法', value: row.actionMethod },
    { label: '请求地址', value: row.requestUri },
    { label: '请求方式', value: row.httpMethod },
    { label: '开始时间', value: row.startTime },
    { label: '完成时间', value: row.finishTime },
    { label: '耗时', value: formatDuration(row.consumingTime) },
    { label: 'User-Agent', value: row.ua, code: true },
    { label: '请求参数', value: formatJsonText(row.params), code: true },
    { label: '返回结果', value: formatJsonText(row.result), code: true },
    { label: '异常详情', value: row.exDetail, code: true },
  ];
});

const openDetail = (row: OperationLog) => {
  currentLog.value = row;
  detailVisible.value = true;
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

  &-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  &-tip {
    color: var(--td-text-color-placeholder);
    font-size: 12px;
  }
}
</style>
