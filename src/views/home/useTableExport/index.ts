import { computed } from "vue";
import { useExportExcel } from "../../../shared/tools/useExportExcel";

interface ColumnConfig {
  label: string;
  width?: number;
  exportable?: boolean;
  dateFormat?: string; // 时间格式，如 "yyyy-mm-dd hh:mm:ss"
}

/**
 * 通用的表格导出工具
 * 
 * @description
 * 提供配置驱动的表格导出功能，支持：
 * - 从列配置自动派生列名映射
 * - 从列配置自动派生导出配置
 * - 控制哪些列可导出（exportable）
 * 
 * @example
 * ```ts
 * const COLUMN_CONFIG = {
 *   id: { label: "ID", width: 10, exportable: false },
 *   name: { label: "姓名", width: 15 },
 *   phone: { label: "手机号", width: 15 }
 * } as const;
 * 
 * const { tableColumnInfo, exportConfig, exportTable } = useTableExport(COLUMN_CONFIG);
 * 
 * // 使用列名映射
 * const displayName = tableColumnInfo.value['name']; // "姓名"
 * 
 * // 导出数据
 * exportTable(users.value, "用户列表");
 * ```
 */
export const useTableExport = <T extends Record<string, ColumnConfig>>(
  columnConfig: T
) => {
  /**
   * 列名映射表
   * 将字段名映射为显示名称
   */
  const tableColumnInfo = computed(() =>
    Object.fromEntries(
      Object.entries(columnConfig).map(([key, config]) => [key, config.label])
    )
  );

  /**
   * 导出配置
   * 只包含 exportable !== false 的列
   * 使用 reduce 一次遍历完成过滤和转换
   */
  const exportConfig = computed(() =>
    Object.entries(columnConfig).reduce(
      (acc, [key, config]) => {
        if (config.exportable !== false) {
          acc[key] = {
            label: config.label,
            width: config.width || 10,
            ...(config.dateFormat && { dateFormat: config.dateFormat })
          };
        }
        return acc;
      },
      {} as Record<string, { label: string; width: number; dateFormat?: string }>
    )
  );

  /**
   * 导出表格数据
   *
   * @param data - 要导出的数据数组
   * @param fileName - 导出的文件名（可选，默认为"导出数据"）
   */
  const exportTable = <D extends Record<string, any>>(
    data: D[],
    fileName?: string
  ) => {
    const { transformData, createSheet, exportToFile } = useExportExcel();
    const transformedData = transformData(data, exportConfig.value as any);
    const sheet = createSheet(exportConfig.value as any, transformedData);
    exportToFile(sheet, fileName);
  };

  return {
    tableColumnInfo,
    exportConfig,
    exportTable
  };
};

