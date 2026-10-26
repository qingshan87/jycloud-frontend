<template>
  <div class="setting-page">
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="请求ID">
          <t-input v-model="query.requestId" placeholder="链路请求标识" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="应用ID">
          <t-input v-model="query.clientId" placeholder="如 1111" clearable style="width: 130px" />
        </t-form-item>
        <t-form-item label="租户ID">
          <t-input v-model="query.tenantId" placeholder="请输入租户ID" clearable style="width: 140px" />
        </t-form-item>
        <t-form-item label="服务名称">
          <t-input v-model="query.serviceName" placeholder="如 jy-user" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="调用结果">
          <t-select v-model="query.type" placeholder="全部" clearable style="width: 120px">
            <t-option v-for="item in RESULT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </t-select>
        </t-form-item>
        <t-form-item label="API编号">
          <t-input v-model="query.actionId" placeholder="API编号" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="请求地址">
          <t-input v-model="query.requestUri" placeholder="/api/..." clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="请求方式">
          <t-select v-model="query.httpMethod" placeholder="全部" clearable style="width: 120px">
            <t-option v-for="item in HTTP_METHODS" :key="item" :label="item" :value="item" />
          </t-select>
        </t-form-item>
        <t-form-item label="响应码">
          <t-input-number
            v-model="query.responseCode"
            placeholder="如 200"
            :min="100"
            :max="599"
            clearable
            style="width: 120px"
          />
        </t-form-item>
        <t-form-item label="应用名称">
          <t-input v-model="query.clientName" placeholder="应用名称" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="调用时间">
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
            <span class="setting-toolbar-title">API 调用日志</span>
            <span class="setting-toolbar-tip">按请求链路记录跨服务 API 调用与响应结果</span>
          </div>
        </template>
        <template #type="{ row }">
          <t-tag :theme="getResultMeta(row.type).theme" variant="light">
            {{ getResultMeta(row.type).label }}
          </t-tag>
        </template>
        <template #client="{ row }">
          <div>{{ row.clientName || '-' }}</div>
          <div class="log-sub-text">{{ row.clientId || '-' }}</div>
        </template>
        <template #responseCode="{ row }">
          <t-tag :theme="getResponseTheme(row.responseCode)" variant="light">
            {{ row.responseCode ?? '-' }}
          </t-tag>
        </template>
        <template #costTime="{ row }">{{ formatDuration(row.costTime) }}</template>
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

import { pageApiLogs } from '@/api/setting/log';
import type { ApiLog } from '@/api/setting/logModel';
import ManagedTable from '@/components/managed-table/index.vue';

import LogDetailDrawer from '../components/LogDetailDrawer.vue';
import type { LogTimeRange } from '../utils';
import { formatDuration, formatJsonText, getResponseTheme, getResultMeta, toTimeParams } from '../utils';

defineOptions({ name: 'SettingLogApi' });

const RESULT_OPTIONS = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 },
];
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface ApiLogFilter {
  requestId: string;
  clientId: string;
  tenantId: string;
  serviceName: string;
  type?: number;
  actionId: string;
  requestUri: string;
  httpMethod: string;
  responseCode?: number;
  clientName: string;
}

const loading = ref(false);
const rows = ref<ApiLog[]>([]);
const timeRange = ref<LogTimeRange>([]);
const query = reactive<ApiLogFilter>({
  requestId: '',
  clientId: '',
  tenantId: '',
  serviceName: '',
  type: undefined,
  actionId: '',
  requestUri: '',
  httpMethod: '',
  responseCode: undefined,
  clientName: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'type', title: '结果', width: 80 },
  { colKey: 'requestId', title: '请求ID', width: 190, ellipsis: true },
  { colKey: 'client', title: '发起应用', width: 150, ellipsis: true },
  { colKey: 'serviceName', title: '服务名称', width: 140, ellipsis: true },
  { colKey: 'actionId', title: 'API编号', width: 140, ellipsis: true },
  { colKey: 'requestUri', title: '请求地址', minWidth: 200, ellipsis: true },
  { colKey: 'responseCode', title: '响应码', width: 90 },
  { colKey: 'costTime', title: '耗时', width: 100 },
  { colKey: 'createTime', title: '调用时间', width: 170 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const data = await pageApiLogs({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      requestId: query.requestId || undefined,
      clientId: query.clientId || undefined,
      tenantId: query.tenantId || undefined,
      serviceName: query.serviceName || undefined,
      type: query.type,
      actionId: query.actionId || undefined,
      requestUri: query.requestUri || undefined,
      httpMethod: query.httpMethod || undefined,
      responseCode: query.responseCode,
      clientName: query.clientName || undefined,
      ...toTimeParams(timeRange.value),
    });
    rows.value = data.records || [];
    pagination.total = data.total || 0;
  } catch (error: any) {
    MessagePlugin.error(error?.message || 'API 日志加载失败');
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
    requestId: '',
    clientId: '',
    tenantId: '',
    serviceName: '',
    type: undefined,
    actionId: '',
    requestUri: '',
    httpMethod: '',
    responseCode: undefined,
    clientName: '',
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
const currentLog = ref<ApiLog | null>(null);
const detailTitle = computed(() => (currentLog.value ? `API 日志 #${currentLog.value.id}` : 'API 日志详情'));
const detailItems = computed(() => {
  const row = currentLog.value;
  if (!row) return [];
  return [
    { label: '日志ID', value: row.id },
    { label: '请求ID', value: row.requestId },
    { label: '租户ID', value: row.tenantId },
    { label: '发起应用', value: row.clientName },
    { label: '应用ID', value: row.clientId },
    { label: '服务名称', value: row.serviceName },
    { label: '调用结果', value: getResultMeta(row.type).label },
    { label: '调用IP', value: row.ip },
    { label: 'API编号', value: row.actionId },
    { label: 'API描述', value: row.description },
    { label: '目标类', value: row.classPath },
    { label: '目标方法', value: row.actionMethod },
    { label: '请求地址', value: row.requestUri },
    { label: '请求方式', value: row.httpMethod },
    { label: '响应状态', value: row.responseCode },
    { label: '响应描述', value: row.responseMsg },
    { label: '开始时间', value: row.startTime },
    { label: '完成时间', value: row.finishTime },
    { label: '耗时', value: formatDuration(row.costTime) },
    { label: '请求参数', value: formatJsonText(row.params), code: true },
    { label: '响应数据', value: formatJsonText(row.responseData), code: true },
    { label: '异常详情', value: row.exDetail, code: true },
  ];
});

const openDetail = (row: ApiLog) => {
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

.log-sub-text {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}
</style>
