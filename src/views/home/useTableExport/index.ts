import { useExportExcel, type HeadConfig, type TypeHandleOptions } from "../../../shared/tools/useExportExcel";

/** 表格列配置 - 包含导出所需的所有信息 */
export interface TableColumnConfig extends HeadConfig {
  /** 是否可导出（默认 true） */
  exportable?: boolean;
}

/** 导出选项 - 自定义类型处理 */
export interface ExportOptions {
  handleNumber?: TypeHandleOptions["handleNumber"];
  handleDate?: TypeHandleOptions["handleDate"];
}

export const useTableExport = (columnConfig: Record<string, TableColumnConfig>) => {

  /** 构建导出配置 - 过滤可导出的列 */
  const buildExportConfig = (
    customConfig?: Record<string, TableColumnConfig>
  ): Record<string, HeadConfig> => {
    const config = customConfig || columnConfig;
    return Object.entries(config).reduce((acc, [key, col]) => {
      if (col.exportable !== false) {
        acc[key] = {
          label: col.label,
          width: col.width,
          dateFormat: col.dateFormat,
          type: col.type
        };
      }
      return acc;
    }, {} as Record<string, HeadConfig>);
  };

  /** 导出表格数据为Excel  */
  const exportTable = async (
    data: Record<string, any>[],
    fileName: string = "导出数据",
    options?: ExportOptions & { columnConfig?: Record<string, TableColumnConfig> }
  ): Promise<void> => {
    const { arrayToExcel } = useExportExcel();
    // 如果提供了自定义列配置，使用自定义配置；否则使用默认配置
    const exportConfig = buildExportConfig(options?.columnConfig);

    // 调用导出，错误由调用者处理
    arrayToExcel(data, exportConfig, {
      handleNumber: options?.handleNumber,
      handleDate: options?.handleDate
    }, fileName);
  };

  /** 根据字段列表导出 - 自动处理数据过滤和配置构建 */
  const exportTableWithFields = async (
    data: Record<string, any>[],
    fields: string[],
    fileName: string = "导出数据",
    options?: ExportOptions
  ): Promise<void> => {
    // 过滤数据：只保留指定的字段
    const filteredData = data.map(item =>
      Object.fromEntries(
        fields.map(field => [field, item[field]])
      )
    );

    // 构建只包含指定字段的配置
    const selectedColumnConfig = Object.fromEntries(
      fields.map(field => [field, columnConfig[field]])
    );

    // 调用导出
    await exportTable(filteredData, fileName, {
      ...options,
      columnConfig: selectedColumnConfig as Record<string, TableColumnConfig>
    });
  };

  return { exportTable, exportTableWithFields };
};
