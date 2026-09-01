<template>
  <div class="ucenter-home">
    <t-card :bordered="false" class="ucenter-welcome">
      <div class="ucenter-welcome-inner">
        <t-avatar size="56px">{{ greetingAvatar }}</t-avatar>
        <div>
          <div class="ucenter-welcome-name">{{ displayName }}</div>
          <div class="ucenter-welcome-sub">
            <span>欢迎回来</span>
            <t-tag v-if="userStore.tenant?.tenantName" theme="primary" variant="light" style="margin-left: 8px">
              {{ userStore.tenant.tenantName }}
            </t-tag>
          </div>
        </div>
      </div>
    </t-card>

    <t-card :bordered="false" title="我的应用" class="ucenter-apps">
      <template #actions>
        <t-tag variant="light">{{ apps.length }} 个应用</t-tag>
      </template>
      <t-loading :loading="loading">
        <t-row v-if="apps.length > 0" :gutter="[16, 16]">
          <t-col v-for="app in apps" :key="app.clientId" :xs="12" :sm="8" :md="6" :xl="4">
            <t-card class="ucenter-app-card" hoverable @click="enterApp(app)">
              <div class="ucenter-app-icon">
                <t-icon :name="app.icon || 'app'" size="32px" />
              </div>
              <div class="ucenter-app-name">{{ app.appName || app.clientId }}</div>
              <div class="ucenter-app-id">{{ app.clientId }}</div>
              <div class="ucenter-app-desc">{{ app.description || '点击进入应用' }}</div>
            </t-card>
          </t-col>
        </t-row>
        <t-empty v-else-if="!loading" description="当前租户暂无可用应用" />
      </t-loading>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import type { MyClient } from '@/api/model/permissionModel';
import { getMyClients } from '@/api/permission';
import { useUserStore } from '@/store';

defineOptions({ name: 'UserCenterHome' });

const userStore = useUserStore();

const loading = ref(false);
const apps = ref<MyClient[]>([]);

const displayName = computed(() => userStore.userInfo.name || '用户');
const greetingAvatar = computed(() => displayName.value.slice(0, 1).toUpperCase());

const fetchApps = async () => {
  loading.value = true;
  try {
    apps.value = (await getMyClients()) || [];
  } catch {
    // 接口未就绪时保持空态，便于后续接入
    apps.value = [];
  } finally {
    loading.value = false;
  }
};

const enterApp = async (app: MyClient) => {
  // 外部系统：新窗口打开（授权码跳转后续接入）
  if (app.category === 2 && app.website) {
    window.open(app.website, '_blank');
    return;
  }
  // 内部/业务系统：控制台内切换应用
  await userStore.switchApp(app.clientId);
};

onMounted(fetchApps);
</script>
<style lang="less" scoped>
.ucenter-home {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ucenter-welcome-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ucenter-welcome-name {
  font-size: 20px;
  font-weight: 600;
}

.ucenter-welcome-sub {
  display: flex;
  align-items: center;
  margin-top: 6px;
  color: var(--td-text-color-secondary);
}

.ucenter-app-card {
  cursor: pointer;
  user-select: none;
}

.ucenter-app-icon {
  margin-bottom: 8px;
  color: var(--td-brand-color);
}

.ucenter-app-name {
  font-size: 15px;
  font-weight: 600;
}

.ucenter-app-id {
  margin-top: 2px;
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}

.ucenter-app-desc {
  margin-top: 8px;
  overflow: hidden;
  color: var(--td-text-color-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
