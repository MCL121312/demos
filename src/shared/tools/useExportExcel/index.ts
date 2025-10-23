import { utils, writeFile, type WorkSheet } from "xlsx";

/** 任意键值对对象 */
export type AnyValueRecord = Record<string, any>;

/** 列类型 */
export type ColumnType = "number" | "string" | "date";

/** 表头配置 */
export interface HeadConfig {
  label: string;
  // 列宽
  width?: number;
  // 日期格式
  dateFormat?: string;
  // 列类型
  type?: ColumnType;
}

/** 表头配置映射 - 将数据对象的字段映射到表头配置 */
export type HeadConfigMap<T extends AnyValueRecord> = Partial<Record<keyof T, HeadConfig>>;

/** 转换后的数据 - 部分字段的数据对象 */
export type TransformedData<T extends AnyValueRecord> = Array<Partial<T>>;

/** 类型处理选项 - 自定义数字和日期的处理方式 */
export interface TypeHandleOptions {
  handleNumber?: (value: number) => number | string;
  handleDate?: (value: number | string, format?: string) => string;
}

export const useExportExcel = () => {

  /** 根据配置类型处理单个值 */
  const transformValue = (
    value: any,
    config: HeadConfig,
    typeOptions?: TypeHandleOptions
  ): any => {
    switch (config.type) {
      case "number":
        if (typeof value !== "number") return undefined;
        return typeOptions?.handleNumber?.(value) ?? value;

      case "date":
        if (typeof value !== "number" && typeof value !== "string") return undefined;
        return typeOptions?.handleDate?.(value, config.dateFormat) ?? value;

      default:
        return value;
    }
  };

  /** 转换数据行 - 根据配置对数据进行类型转换 */
  const transformData = <T extends AnyValueRecord>(
    data: T[],
    headsConfig: HeadConfigMap<T>,
    typeOptions?: TypeHandleOptions
  ): TransformedData<T> => {
    const keys = Object.keys(headsConfig) as (keyof T)[];

    return data.map(item =>
      keys.reduce<Partial<T>>((acc, key) => {
        const value = item[key];
        if (value === undefined) return acc;

        const config = headsConfig[key]!;
        const transformedValue = transformValue(value, config, typeOptions);

        if (transformedValue !== undefined) {
          acc[key] = transformedValue as T[keyof T];
        }
        return acc;
      }, {})
    );
  };



  /** 构建表头行 - 将配置转换为表头标签对象 */
  const buildHeaderRow = <T extends AnyValueRecord>(
    headsConfig: HeadConfigMap<T>
  ): Partial<Record<keyof T, string>> => {
    return Object.entries(headsConfig).reduce<Partial<Record<keyof T, string>>>((acc, [key, config]) => {
      if (config) {
        acc[key as keyof T] = config.label;
      }
      return acc;
    }, {});
  };

  /** 构建列宽配置 - 从表头配置提取列宽 */
  const buildColumnWidths = <T extends AnyValueRecord>(
    headsConfig: HeadConfigMap<T>
  ): Array<{ wch: number }> => {
    return Object.entries(headsConfig).reduce<Array<{ wch: number }>>((acc, [_, config]) => {
      if (config) {
        acc.push({ wch: config.width || 10 });
      }
      return acc;
    }, []);
  };

  /** 构建日期格式映射 - 从表头配置提取日期格式 */
  const buildDateFormatMap = <T extends AnyValueRecord>(
    headsConfig: HeadConfigMap<T>
  ): Partial<Record<keyof T, string>> => {
    return Object.entries(headsConfig).reduce<Partial<Record<keyof T, string>>>((acc, [key, config]) => {
      if (config?.dateFormat) {
        acc[key as keyof T] = config.dateFormat;
      }
      return acc;
    }, {});
  };

  /** 应用列宽到sheet */
  const applyColumnWidths = (sheet: WorkSheet, colWidths: Array<{ wch: number }>): void => {
    if (colWidths.length > 0) {
      sheet["!cols"] = colWidths;
    }
  };

  /** 应用日期格式到sheet */
  const applyDateFormats = <T extends AnyValueRecord>(
    sheet: WorkSheet,
    dateFormatMap: Partial<Record<keyof T, string>>,
    keys: (keyof T)[]
  ): void => {
    if (Object.keys(dateFormatMap).length === 0) return;

    // 构建列索引缓存，避免重复 indexOf 查找
    const colIndexMap = new Map<keyof T, number>();
    Object.entries(dateFormatMap).forEach(([key, _]) => {
      const colIndex = keys.indexOf(key as keyof T);
      if (colIndex >= 0) {
        colIndexMap.set(key as keyof T, colIndex);
      }
    });

    const range = utils.decode_range(sheet["!ref"] || "A1");
    // 反转循环顺序：先遍历日期字段，再遍历行
    colIndexMap.forEach((colIndex, key) => {
      const format = dateFormatMap[key];
      if (format) {
        for (let row = 1; row <= range.e.r; row++) {
          const cellRef = utils.encode_cell({ r: row, c: colIndex });
          if (sheet[cellRef]) {
            sheet[cellRef].z = format;
          }
        }
      }
    });
  };

  /** 提取有效的配置键 - 过滤掉未配置的字段 */
  const getConfiguredKeys = <T extends AnyValueRecord>(
    headsConfig: HeadConfigMap<T>
  ): (keyof T)[] => {
    return Object.keys(headsConfig).filter(key => headsConfig[key as keyof T]) as (keyof T)[];
  };

  /** 创建Excel Sheet - 组装数据和应用样式 */
  const createSheet = <T extends AnyValueRecord>(
    headsConfig: HeadConfigMap<T>,
    transformedData: TransformedData<T>
  ): WorkSheet => {
    // 一次性计算有效的键
    const keys = getConfiguredKeys(headsConfig);

    // 构建表头和样式配置
    const headerRow = buildHeaderRow(headsConfig);
    const colWidths = buildColumnWidths(headsConfig);
    const dateFormatMap = buildDateFormatMap(headsConfig);

    // 创建sheet
    const sheet = utils.json_to_sheet([headerRow, ...transformedData], {
      skipHeader: true
    });

    // 应用样式
    applyColumnWidths(sheet, colWidths);
    applyDateFormats(sheet, dateFormatMap, keys);

    return sheet;
  };



  /** 导出Sheet到文件 */
  const exportToFile = (sheet: WorkSheet, fileName?: string): void => {
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "sheet");
    writeFile(book, `${fileName || "导出数据"}.xlsx`);
  };



  /** 数组导出为Excel - 编排整个导出流程 */
  const arrayToExcel = <T extends AnyValueRecord>(
    data: T[],
    headsConfig: HeadConfigMap<T>,
    typeOptions?: TypeHandleOptions,
    fileName?: string
  ): void => {
    const transformedData = transformData(data, headsConfig, typeOptions);
    const sheet = createSheet(headsConfig, transformedData);
    exportToFile(sheet, fileName);
  };

  return {
    // 数据转换
    transformData,
    // 表头构建
    buildHeaderRow,
    buildColumnWidths,
    buildDateFormatMap,
    getConfiguredKeys,
    // 样式应用
    applyColumnWidths,
    applyDateFormats,
    // Sheet创建
    createSheet,
    // 导出
    exportToFile,
    // 编排
    arrayToExcel
  };
};