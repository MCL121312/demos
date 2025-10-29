import { useExportExcel, type HeadConfig, type TypeHandleOptions } from "../../../shared/tools/useExportExcel";

export interface TableColumnConfig extends HeadConfig {
  exportable?: boolean;
}

export interface ExportOptions {
  handleNumber?: TypeHandleOptions["handleNumber"];
  handleDate?: TypeHandleOptions["handleDate"];
}

export const useTableExport = <T extends string>(
  columnConfig: Record<T, TableColumnConfig>
) => {
  
  const buildExportConfig = (
    customConfig?: Record<T, TableColumnConfig>
  ): Record<T, HeadConfig> => {
    const config = customConfig || columnConfig;
    return (Object.entries(config) as [T, TableColumnConfig][]).reduce((acc, [key, col]) => {
      if (col.exportable !== false) { 
        acc[key] = {
          label: col.label,
          width: col.width,
          dateFormat: col.dateFormat,
          type: col.type
        };
      }
      return acc;
    }, {} as Record<T, HeadConfig>);
  };

  const exportTable = async (
    data: Array<Partial<Record<T, any>>>,
    fileName: string = "导出数据",
    options?: ExportOptions & {
      columnConfig?: Record<T, TableColumnConfig>
    }
  ): Promise<void> => {
    const { arrayToExcel } = useExportExcel();
    const exportConfig = buildExportConfig(options?.columnConfig);
    arrayToExcel(data, exportConfig, {
      handleNumber: options?.handleNumber,
      handleDate: options?.handleDate
    }, fileName);
  };
 
  const exportTableWithFields = async (
    data: Array<Partial<Record<T, any>>>,
    fields: T[],
    fileName: string = "导出数据",
    options?: ExportOptions
  ): Promise<void> => {

    const filteredData = data.map(item =>
      Object.fromEntries(
        fields.map(field => [field, item[field]])
      )
    ) as Array<Record<T, any>>; 

    const selectedColumnConfig = Object.fromEntries(
      fields.map(field => [field, columnConfig[field]])
    ) as Record<T, TableColumnConfig>; 

    await exportTable(filteredData, fileName, {
      ...options,
      columnConfig: selectedColumnConfig
    });
  };

  return { exportTable, exportTableWithFields };
};