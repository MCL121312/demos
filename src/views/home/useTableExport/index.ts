import {
  useExportExcel,
  type HeadConfig,
  type TypeHandleOptions
} from "../../../shared/tools/useExportExcel";

export interface TableColumnConfig extends HeadConfig {
  exportable?: boolean;
}

export interface ExportOptions {
  handleNumber?: TypeHandleOptions["handleNumber"];
  handleDate?: TypeHandleOptions["handleDate"];
}

export interface CheckedColumn<T extends string = string> {
  field: T;
  columnsName: string;
  checked: boolean;
}

export const useTableExport = <T extends string>(
  columnConfig: Record<T, TableColumnConfig>
) => {
  const { arrayToExcel } = useExportExcel();

  const checkedColumns = ref<CheckedColumn<T>[]>([]);

  // 初始化列选择状态
  const initCheckedColumns = () => {
    checkedColumns.value = (Object.keys(columnConfig) as T[]).map(key => ({
      field: key,
      columnsName: columnConfig[key].label,
      checked: columnConfig[key].exportable ?? true
    }));
  };

  // 切换列的选中状态
  const toggleColumn = (column: CheckedColumn<T>) => {
    column.checked = !column.checked;
  };

  // 是否可以导出（至少有一列被选中）
  const canExport = computed(() => {
    return checkedColumns.value.reduce(
      (hasChecked, col) => hasChecked || col.checked,
      false
    );
  });

  // 获取选中的字段列表
  const getSelectedFields = (): T[] => {
    return checkedColumns.value
      .filter(col => col.checked)
      .map(col => col.field) as T[];
  };

  // 获取所有可导出的字段列表
  const getExportableFields = (): T[] => {
    return (Object.keys(columnConfig) as T[]).filter(
      key => columnConfig[key].exportable !== false
    );
  };

  const buildExportConfig = (
    customConfig?: Record<T, TableColumnConfig>
  ): Record<T, HeadConfig> => {
    const config = customConfig || columnConfig;
    return (Object.entries(config) as [T, TableColumnConfig][]).reduce(
      (acc, [key, col]) => {
        if (col.exportable !== false) {
          acc[key] = {
            label: col.label,
            width: col.width,
            dateFormat: col.dateFormat,
            type: col.type
          };
        }
        return acc;
      },
      {} as Record<T, HeadConfig>
    );
  };

  const exportTable = async (
    data: Array<Partial<Record<T, any>>>,
    fileName: string = "导出数据",
    options?: ExportOptions & {
      columnConfig?: Record<T, TableColumnConfig>;
    }
  ): Promise<void> => {
    const exportConfig = buildExportConfig(options?.columnConfig);
    arrayToExcel(
      data,
      exportConfig,
      {
        handleNumber: options?.handleNumber,
        handleDate: options?.handleDate
      },
      fileName
    );
  };

  const exportTableWithFields = async (
    data: Array<Partial<Record<T, any>>>,
    fields: T[],
    fileName: string = "导出数据",
    options?: ExportOptions
  ): Promise<void> => {
    const filteredData = data.map(item =>
      Object.fromEntries(fields.map(field => [field, item[field]]))
    ) as Array<Record<T, any>>;

    const selectedColumnConfig = Object.fromEntries(
      fields.map(field => [field, columnConfig[field]])
    ) as Record<T, TableColumnConfig>;

    await exportTable(filteredData, fileName, {
      ...options,
      columnConfig: selectedColumnConfig
    });
  };

  // 导出所有可导出的列
  const exportAllExportableColumns = async (
    data: Array<Partial<Record<T, any>>>,
    fileName: string = "导出数据",
    options?: ExportOptions
  ): Promise<void> => {
    const fields = getExportableFields();
    await exportTableWithFields(data, fields, fileName, options);
  };

  // 导出选中的列
  const exportSelectedColumns = async (
    data: Array<Partial<Record<T, any>>>,
    fileName: string = "导出数据",
    options?: ExportOptions
  ): Promise<void> => {
    const fields = getSelectedFields();
    await exportTableWithFields(data, fields, fileName, options);
  };

  return {
    // 基础导出方法
    exportTable,
    exportTableWithFields,
    // 便捷导出方法
    exportAllExportableColumns,
    exportSelectedColumns,
    // 列选择状态管理
    checkedColumns,
    initCheckedColumns,
    toggleColumn,
    canExport,
    getSelectedFields,
    getExportableFields
  };
};
