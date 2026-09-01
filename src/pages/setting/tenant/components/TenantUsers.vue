<template>
  <div class="tenant-users-page">
    <!-- 查询区：独立一块 -->
    <t-card :bordered="false" class="tenant-users-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="用户名" name="username">
          <t-input v-model="query.username" placeholder="请输入用户名" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="姓名" name="realname">
          <t-input v-model="query.realname" placeholder="请输入真实姓名" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="query.mobile" placeholder="请输入手机号" clearable style="width: 160px" />
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
    <t-card :bordered="false" class="tenant-users-content-card">
      <div class="tenant-users-toolbar">
        <t-button v-permission="PERM.user.create" theme="primary" @click="openCreate">
          <template #icon><t-icon name="add" /></template>
          新增租户用户
        </t-button>
        <t-button v-permission="PERM.userTenant.bind" theme="default" @click="openInvite">
          <template #icon><t-icon name="user-add" /></template>
          邀请用户
        </t-button>
        <!-- <span class="tenant-users-tip">新增用户默认密码为 123456，并自动绑定到当前租户</span> -->
      </div>

      <t-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="userId"
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
            <t-link theme="primary" @click="openRole(row)">分配角色</t-link>
            <t-link v-permission="PERM.user.resetPassword" theme="primary" @click="handleResetPwd(row)"
              >重置密码</t-link
            >
            <t-link v-permission="PERM.userTenant.remove" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑用户' : '新增租户用户'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="560px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="租户">
          <t-input :value="tenantName" readonly />
        </t-form-item>
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

    <!-- 分配角色弹窗 -->
    <t-dialog
      v-model:visible="roleVisible"
      header="分配角色"
      :confirm-btn="{ content: '保存', loading: roleSubmitting }"
      cancel-btn="取消"
      width="480px"
      @confirm="handleRoleSubmit"
    >
      <p class="tenant-users-role-tip">为「{{ currentUser?.username }}」分配当前租户下的角色，可多选。</p>
      <t-checkbox-group v-model="selectedRoleIds" :disabled="roleList.length === 0">
        <div v-for="role in roleList" :key="role.roleId" class="tenant-users-role-item">
          <t-checkbox :value="role.roleId">
            {{ role.roleName }}
            <t-tag v-if="role.readonly === 1" size="small" variant="light" style="margin-left: 4px">内置</t-tag>
          </t-checkbox>
          <span class="tenant-users-role-remark">{{ role.remark || '-' }}</span>
        </div>
      </t-checkbox-group>
      <t-empty v-if="roleList.length === 0" description="该租户暂无角色" />
    </t-dialog>

    <!-- 邀请用户弹窗 -->
    <t-dialog
      v-model:visible="inviteVisible"
      header="邀请用户"
      :confirm-btn="{ content: '邀请', loading: inviteSubmitting }"
      cancel-btn="取消"
      width="760px"
      @confirm="handleInviteSubmit"
    >
      <p class="tenant-users-invite-tip">
        从系统用户中搜索并邀请加入当前租户。至少填写一个查询条件；已加入该租户的用户不可选择。
      </p>
      <t-form layout="inline" :data="inviteQuery" @submit="handleInviteSearch" @reset="handleInviteReset">
        <t-form-item label="用户名" name="username">
          <t-input v-model="inviteQuery.username" placeholder="请输入用户名" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="姓名" name="realname">
          <t-input v-model="inviteQuery.realname" placeholder="请输入真实姓名" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="inviteQuery.mobile" placeholder="请输入手机号" clearable style="width: 150px" />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">查询</t-button>
            <t-button theme="default" type="reset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-table
        class="tenant-users-invite-table"
        :data="inviteRows"
        :columns="inviteColumns"
        :loading="inviteLoading"
        row-key="userId"
        :selected-row-keys="inviteSelectedKeys"
        @select-change="onInviteSelectChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #bound="{ row }">
          <t-tag v-if="tenantMemberIds.has(row.userId)" theme="warning" variant="light">已加入</t-tag>
          <span v-else>-</span>
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref, watch } from 'vue';

import type { SettingRole, SettingUser, UserForm, UserQuery } from '@/api/model/settingModel';
import { pageRoles } from '@/api/setting/role';
import {
  bindUserToTenant,
  createUser,
  getUserRoles,
  pageTenantUsers,
  removeUserFromTenant,
  resetPassword,
  searchInviteUsers,
  setUserRoles,
  updateUser,
} from '@/api/setting/user';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'TenantUsers' });

const props = defineProps<{
  tenantId: string;
  tenantName: string;
}>();

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
  { colKey: 'realname', title: '真实姓名', width: 110 },
  { colKey: 'mobile', title: '手机号', width: 140 },
  // { colKey: 'email', title: '邮箱', width: 180 },
  // { colKey: 'ssex', title: '性别', width: 80 },
  { colKey: 'roles', title: '角色', minWidth: 160 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 260, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const data = await pageTenantUsers({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      username: query.username || undefined,
      realname: query.realname || undefined,
      mobile: query.mobile || undefined,
      status: query.status === undefined ? undefined : String(query.status),
      tenantId: props.tenantId,
    });
    rows.value = data.records || [];
    pagination.total = data.total || 0;
  } finally {
    loading.value = false;
  }
};

watch(() => props.tenantId, fetchList);

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
      await createUser({ ...createData, tenantId: props.tenantId });
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

// ==================== 分配角色 ====================
const roleVisible = ref(false);
const roleSubmitting = ref(false);
const currentUser = ref<SettingUser | null>(null);
const roleList = ref<SettingRole[]>([]);
const selectedRoleIds = ref<number[]>([]);

const openRole = async (row: SettingUser) => {
  currentUser.value = row;
  roleVisible.value = true;
  try {
    const [rolePage, roleIds] = await Promise.all([
      pageRoles({ pageNum: 1, pageSize: 200, tenantId: props.tenantId }),
      getUserRoles(row.userId, props.tenantId),
    ]);
    roleList.value = rolePage.records || [];
    selectedRoleIds.value = Array.isArray(roleIds) ? roleIds : [];
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载角色失败');
  }
};

const handleRoleSubmit = async () => {
  if (!currentUser.value) return;
  roleSubmitting.value = true;
  try {
    await setUserRoles({
      userId: currentUser.value.userId,
      tenantId: props.tenantId,
      roleIds: selectedRoleIds.value,
    });
    MessagePlugin.success('分配成功');
    roleVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '分配失败');
  } finally {
    roleSubmitting.value = false;
  }
};

// ==================== 邀请用户 ====================
const inviteVisible = ref(false);
const inviteLoading = ref(false);
const inviteSubmitting = ref(false);
const inviteQuery = reactive({
  username: '',
  realname: '',
  mobile: '',
});
const inviteRows = ref<SettingUser[]>([]);
const inviteSelectedKeys = ref<Array<string | number>>([]);
/** 当前租户已有成员 ID，用于标记并禁用已加入用户 */
const tenantMemberIds = ref<Set<number>>(new Set());

const inviteColumns: PrimaryTableCol<SettingUser>[] = [
  {
    colKey: 'row-select',
    type: 'multiple',
    width: 50,
    disabled: ({ row }: { row: SettingUser }) => tenantMemberIds.value.has(row.userId),
  },
  { colKey: 'username', title: '用户名', width: 130 },
  { colKey: 'realname', title: '真实姓名', width: 110 },
  { colKey: 'mobile', title: '手机号', width: 140 },
  { colKey: 'status', title: '状态', width: 80 },
  { colKey: 'bound', title: '租户状态', width: 90 },
];

const openInvite = async () => {
  inviteVisible.value = true;
  inviteQuery.username = '';
  inviteQuery.realname = '';
  inviteQuery.mobile = '';
  inviteRows.value = [];
  inviteSelectedKeys.value = [];
  // 加载当前租户已有成员，用于标记已加入用户
  try {
    const data = await pageTenantUsers({ pageNum: 1, pageSize: 500, tenantId: props.tenantId });
    tenantMemberIds.value = new Set((data.records || []).map((user) => user.userId));
  } catch {
    tenantMemberIds.value = new Set();
  }
};

const handleInviteSearch = async () => {
  if (!inviteQuery.username && !inviteQuery.realname && !inviteQuery.mobile) {
    MessagePlugin.warning('请至少填写一个查询条件');
    return;
  }
  inviteLoading.value = true;
  try {
    const data = await searchInviteUsers({
      username: inviteQuery.username || undefined,
      realname: inviteQuery.realname || undefined,
      mobile: inviteQuery.mobile || undefined,
      tenantId: props.tenantId,
    });
    inviteRows.value = data || [];
    inviteSelectedKeys.value = [];
  } catch (e: any) {
    MessagePlugin.error(e?.message || '查询失败');
  } finally {
    inviteLoading.value = false;
  }
};

const handleInviteReset = () => {
  inviteQuery.username = '';
  inviteQuery.realname = '';
  inviteQuery.mobile = '';
  inviteRows.value = [];
  inviteSelectedKeys.value = [];
};

const onInviteSelectChange = (keys: Array<string | number>) => {
  inviteSelectedKeys.value = keys;
};

const handleInviteSubmit = async () => {
  if (inviteSelectedKeys.value.length === 0) {
    MessagePlugin.warning('请先选择要邀请的用户');
    return;
  }
  inviteSubmitting.value = true;
  let successCount = 0;
  let failCount = 0;
  let firstError = '';
  try {
    for (const key of inviteSelectedKeys.value) {
      try {
        await bindUserToTenant(Number(key), props.tenantId);
        successCount += 1;
      } catch (e: any) {
        failCount += 1;
        firstError = firstError || e?.message || '邀请失败';
      }
    }
    if (successCount > 0) {
      MessagePlugin.success(`已邀请 ${successCount} 位用户加入租户`);
    }
    if (failCount > 0) {
      MessagePlugin.warning(`${failCount} 位用户邀请失败：${firstError}`);
    }
    if (successCount > 0) {
      inviteVisible.value = false;
      fetchList();
    }
  } finally {
    inviteSubmitting.value = false;
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

const handleDelete = (row: SettingUser) => {
  const dialog = DialogPlugin.confirm({
    header: '移出租户',
    body: `确定将用户「${row.username}」移出当前租户吗？移除后该用户将无法访问此租户（账号不会被删除）。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await removeUserFromTenant(row.userId, props.tenantId);
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
.tenant-users-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tenant-users-toolbar {
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

.tenant-users-role-tip {
  margin: 0 0 12px;
  color: var(--td-text-color-secondary);
}

.tenant-users-role-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--td-component-stroke);

  &:last-child {
    border-bottom: none;
  }
}

.tenant-users-role-remark {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}

.tenant-users-invite-tip {
  margin: 0 0 12px;
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.tenant-users-invite-table {
  margin-top: 16px;
}
</style>
