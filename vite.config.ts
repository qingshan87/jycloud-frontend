import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { ConfigEnv, UserConfig } from 'vite';
import { loadEnv } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd();

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL, VITE_API_URL_PREFIX, VITE_GATEWAY } = loadEnv(mode, CWD);
  const gateway = VITE_GATEWAY || process.env.VITE_GATEWAY || 'http://localhost:9000';
  const apiPrefix = VITE_API_URL_PREFIX || '';

  // 接口前缀（如 /api）代理到网关，转发前剥离前缀，保证网关按 /jy-user/** 路由
  const proxy: Record<string, { target: string; changeOrigin: boolean; rewrite: (path: string) => string }> = {};
  if (apiPrefix) {
    proxy[apiPrefix] = {
      target: gateway,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(apiPrefix, ''),
    };
  }

  return {
    base: VITE_BASE_URL,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },

    plugins: [
      vue(),
      vueJsx(),
      viteMockServe({
        mockPath: 'mock',
        enable: true,
      }),
      svgLoader(),
    ],

    server: {
      port: 3002,
      host: '0.0.0.0',
      proxy,
    },
  };
};
