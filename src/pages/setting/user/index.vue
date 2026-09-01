<template>
  <div class="setting-page">
    <!-- 查询区：独立一块 -->
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="用户名" name="username">
          <t-input v-model="query.username" placeholder="请输入用户名" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="姓名" name="realname">
          <t-input v-model="query.realname" placeholder="请输入真实姓名" clearable style="width: 180px" />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="query.mobile" placeholder="请输入手机号" clearable style="width: 180px" />
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
        <t-button v-permission="PERM.user.create" theme="primary" @click="openCreate">
          <template #icon><t-icon name="add" /></template>
          新增用户
        </t-button>
        <t-button
          v-permission="PERM.user.resetPassword"
          theme="default"
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchResetPwd"
        >
          重置密码
        </t-button>
      </div>

      <t-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="userId"
        :selected-row-keys="selectedRowKeys"
        :selectable="hasPerm(PERM.user.resetPassword)"
        @select-change="(val: Array<string | number>) => (selectedRowKeys = val)"
        @change="onTableChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #ssex="{ row }">
          {{ SEX_MAP[row.ssex ?? 0] || '保密' }}
        </template>
        <template #roles="{ row }">
          <span v-if="!row.roles || row.roles.length === 0">-</span>
          <t-tag v-for="role in row.roles" :key="role.roleId" variant="light" style="margin-right: 4px">
            {{ role.roleName }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="PERM.user.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.user.resetPassword" theme="primary" @click="handleResetPwd(row)"
              >重置密码</t-link
            >
            <t-link v-permission="PERM.user.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑用户' : '新增用户'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="560px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="用户名" name="username">
          <t-input
            v-model="form.username"
            :disabled="isEdit"
            placeholder="字母开头，6-20位字母、数字或下划线"
            clearable
          />
        </t-form-item>
        <t-form-item label="真实姓名" name="realname">
          <t-input v-model="form.realname" placeholder="2-8个字符" clearable />
        </t-form-item>
        <t-form-item label="昵称" name="nickname">
          <t-input v-model="form.nickname" placeholder="请输入昵称" clearable />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="form.mobile" placeholder="请输入手机号" clearable />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="form.email" placeholder="请输入邮箱" clearable />
        </t-form-item>
        <t-form-item label="性别" name="ssex">
          <t-radio-group v-model="form.ssex">
            <t-radio v-for="item in SEX_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="生日" name="birthday">
          <t-date-picker v-model="form.birthday" clearable style="width: 100%" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="form.description" placeholder="请输入描述" :maxlength="100" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import type { SettingUser, UserForm, UserQuery } from '@/api/model/settingModel';
import { createUser, deleteUser, pageUsers, resetPassword, updateUser } from '@/api/setting/user';
import { PERM } from '@/constants/permission';
import { hasPerm } from '@/utils/permission';

defineOptions({ name: 'SettingUser' });

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

const SEX_MAP: Record<number, string> = { 0: '保密', 1: '男', 2: '女' };
const SEX_OPTIONS = [
  { label: '保密', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];

const loading = ref(false);
const rows = ref<SettingUser[]>([]);
const selectedRowKeys = ref<Array<string | number>>([]);
const query = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  realname: '',
  mobile: '',
  status: undefined,
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
});

const columns: PrimaryTableCol[] = [
  { colKey: 'username', title: '用户名', width: 140 },
  { colKey: 'realname', title: '真实姓名', width: 120 },
  { colKey: 'mobile', title: '手机号', width: 140 },
  { colKey: 'email', title: '邮箱', width: 180 },
  { colKey: 'ssex', title: '性别', width: 80 },
  { colKey: 'roles', title: '角色', minWidth: 160 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 200, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const params: UserQuery = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      username: query.username || undefined,
      realname: query.realname || undefined,
      mobile: query.mobile || undefined,
      status: query.status === undefined ? undefined : String(query.status),
    };
    const data = await pageUsers(params);
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
  query.username = '';
  query.realname = '';
  query.mobile = '';
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
const form = reactive<UserForm>({});

const rules: Record<string, FormRule[]> = {
  username: [{ required: true, message: '请输入用户名', type: 'error' }],
  mobile: [{ required: true, message: '请输入手机号', type: 'error' }],
  email: [{ email: true, message: '邮箱格式不正确', type: 'error' }],
};

const openCreate = () => {
  isEdit.value = false;
  Object.assign(form, {
    userId: undefined,
    username: '',
    realname: '',
    nickname: '',
    mobile: '',
    email: '',
    ssex: 0,
    birthday: '',
    description: '',
    status: 1,
  });
  dialogVisible.value = true;
};

const openEdit = (row: SettingUser) => {
  isEdit.value = true;
  Object.assign(form, {
    userId: row.userId,
    username: row.username,
    realname: row.realname,
    nickname: row.nickname,
    mobile: row.mobile,
    email: row.email,
    ssex: row.ssex ?? 0,
    birthday: row.birthday || '',
    description: row.description,
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
      await updateUser(form);
      MessagePlugin.success('修改成功');
    } else {
      // 新增时剥离 userId，避免编辑残留的 ID 被提交
      const { userId: _userId, ...createData } = form;
      await createUser(createData);
      MessagePlugin.success('创建成功，初始密码 123456');
    }
    dialogVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};

// ==================== 重置密码 / 删除 ====================
const handleResetPwd = (row: SettingUser) => {
  const dialog = DialogPlugin.confirm({
    header: '重置密码',
    body: `确定将用户「${row.username}」的密码重置为 123456 吗？`,
    theme: 'warning',
    onConfirm: async () => {
      try {
        await resetPassword([row.userId]);
        MessagePlugin.success('重置密码成功');
        dialog.hide();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '重置失败');
      }
    },
  });
};

const handleBatchResetPwd = () => {
  const ids = selectedRowKeys.value.map(Number);
  if (ids.length === 0) return;
  const dialog = DialogPlugin.confirm({
    header: '重置密码',
    body: `确定将选中的 ${ids.length} 个用户密码重置为 123456 吗？`,
    theme: 'warning',
    onConfirm: async () => {
      try {
        await resetPassword(ids);
        MessagePlugin.success('重置密码成功');
        dialog.hide();
        selectedRowKeys.value = [];
        fetchList();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '重置失败');
      }
    },
  });
};

const handleDelete = (row: SettingUser) => {
  const dialog = DialogPlugin.confirm({
    header: '删除用户',
    body: `确定删除用户「${row.username}」吗？删除后不可恢复。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteUser(row.userId);
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
