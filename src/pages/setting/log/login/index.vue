<template>
  <div class="setting-page">
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="租户ID">
          <t-input v-model="query.tenantId" placeholder="请输入租户ID" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="用户ID">
          <t-input-number v-model="query.userId" placeholder="用户ID" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="登录账号">
          <t-input v-model="query.username" placeholder="精确账号" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="登录结果">
          <t-select v-model="query.type" placeholder="全部" clearable style="width: 120px">
            <t-option v-for="item in RESULT_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </t-select>
        </t-form-item>
        <t-form-item label="登录方式">
          <t-input v-model="query.grantType" placeholder="如 password" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="登录IP">
          <t-input v-model="query.ip" placeholder="精确IP" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="浏览器">
          <t-input v-model="query.browser" placeholder="浏览器名称" clearable style="width: 140px" />
        </t-form-item>
        <t-form-item label="登录地点">
          <t-input v-model="query.location" placeholder="登录地点" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="登录时间">
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
            <span class="setting-toolbar-title">登录日志</span>
            <span class="setting-toolbar-tip">记录账号登录结果、终端信息和来源地址</span>
          </div>
        </template>
        <template #type="{ row }">
          <t-tag :theme="getResultMeta(row.type).theme" variant="light">
            {{ getResultMeta(row.type).label }}
          </t-tag>
        </template>
        <template #browser="{ row }">
          <span v-if="row.browser">{{ row.browser }}{{ row.browserVersion ? ` ${row.browserVersion}` : '' }}</span>
          <span v-else>-</span>
        </template>
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

import { pageLoginLogs } from '@/api/setting/log';
import type { LoginLog } from '@/api/setting/logModel';
import ManagedTable from '@/components/managed-table/index.vue';

import LogDetailDrawer from '../components/LogDetailDrawer.vue';
import type { LogDetailItem, LogTimeRange } from '../utils';
import { getResultMeta, toTimeParams } from '../utils';

defineOptions({ name: 'SettingLogLogin' });

const RESULT_OPTIONS = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 },
];

interface LoginLogFilter {
  tenantId: string;
  userId?: number;
  username: string;
  type?: number;
  grantType: string;
  ip: string;
  browser: string;
  location: string;
}

const loading = ref(false);
const rows = ref<LoginLog[]>([]);
const timeRange = ref<LogTimeRange>([]);
const query = reactive<LoginLogFilter>({
  tenantId: '',
  userId: undefined,
  username: '',
  type: undefined,
  grantType: '',
  ip: '',
  browser: '',
  location: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'type', title: '结果', width: 80 },
  { colKey: 'tenantId', title: '租户ID', width: 100 },
  { colKey: 'username', title: '登录账号', width: 140, ellipsis: true },
  { colKey: 'grantType', title: '登录方式', width: 120 },
  { colKey: 'ip', title: '登录IP', width: 140 },
  { colKey: 'location', title: '登录地点', width: 160, ellipsis: true },
  { colKey: 'browser', title: '浏览器', minWidth: 180, ellipsis: true },
  { colKey: 'loginTime', title: '登录时间', width: 170 },
  { colKey: 'op', title: '操作', width: 80, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const data = await pageLoginLogs({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      tenantId: query.tenantId || undefined,
      userId: query.userId,
      username: query.username || undefined,
      type: query.type,
      grantType: query.grantType || undefined,
      ip: query.ip || undefined,
      browser: query.browser || undefined,
      location: query.location || undefined,
      ...toTimeParams(timeRange.value),
    });
    rows.value = data.records || [];
    pagination.total = data.total || 0;
  } catch (error: any) {
    MessagePlugin.error(error?.message || '登录日志加载失败');
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
    userId: undefined,
    username: '',
    type: undefined,
    grantType: '',
    ip: '',
    browser: '',
    location: '',
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
const currentLog = ref<LoginLog | null>(null);
const detailTitle = computed(() => (currentLog.value ? `登录日志 #${currentLog.value.id}` : '登录日志详情'));
const detailItems = computed<LogDetailItem[]>(() => {
  const row = currentLog.value;
  if (!row) return [];
  return [
    { label: '日志ID', value: row.id },
    { label: '租户ID', value: row.tenantId },
    { label: '用户ID', value: row.userId },
    { label: '登录账号', value: row.username },
    { label: '登录结果', value: getResultMeta(row.type).label },
    { label: '登录方式', value: row.grantType },
    { label: '登录时间', value: row.loginTime },
    { label: '登录IP', value: row.ip },
    { label: '登录地点', value: row.location },
    { label: '浏览器', value: row.browser },
    { label: '浏览器版本', value: row.browserVersion },
    { label: '操作系统', value: row.operatingSystem },
    { label: '描述', value: row.description },
    { label: 'User-Agent', value: row.ua, code: true },
  ];
});

const openDetail = (row: LoginLog) => {
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
