export type LogTimeRange = Array<string | number | Date>;

export interface LogDetailItem {
  label: string;
  value?: string | number;
  code?: boolean;
}

/** 将日期范围转换为后端统一的分页查询时间参数 */
export function toTimeParams(range: LogTimeRange) {
  return {
    beginTime: range[0] ? String(range[0]) : undefined,
    endTime: range[1] ? String(range[1]) : undefined,
  };
}

/** 格式化 JSON 文本，非 JSON 内容保持原样 */
export function formatJsonText(value?: string) {
  if (!value) return '-';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

/** 格式化耗时 */
export function formatDuration(value?: number) {
  return value === undefined || value === null ? '-' : `${value} ms`;
}

/** 日志结果状态 */
export function getResultMeta(type?: number) {
  return type === 1 ? { label: '成功', theme: 'success' as const } : { label: '失败', theme: 'danger' as const };
}

/** HTTP 响应状态标签主题 */
export function getResponseTheme(code?: number) {
  if (!code) return 'default';
  if (code < 300) return 'success';
  if (code < 400) return 'warning';
  return 'danger';
}
