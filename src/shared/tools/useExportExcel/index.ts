import { utils, writeFile } from "xlsx";
interface HeadConfig {
  label: string;
  width?: number;
  dateFormat?: string; // 时间格式，如 "yyyy-mm-dd hh:mm:ss"
}

export const useExportExcel = () => {
  const transformData = <T extends Record<string, any>>(
    data: T[],
    headsConfig: Partial<Record<keyof T, HeadConfig>>
  ): Record<string, any>[] => {
    const keys = Object.keys(headsConfig);
    return data.map(item =>
      Object.fromEntries(keys.map(key => [key, item[key]]))
    );
  };

  const createSheet = <T extends Record<string, any>>(
    headsConfig: Partial<Record<keyof T, HeadConfig>>,
    transformedData: Record<string, any>[]
  ): any => {
    const keys = Object.keys(headsConfig).filter(key => headsConfig[key as keyof T]);
    const headersFieldMap: Record<string, string> = {};
    const colWidths: Array<{ wch: number }> = [];
    const dateFormatMap: Record<string, string> = {};

    keys.forEach(key => {
      const config = headsConfig[key as keyof T];
      if (config) {
        headersFieldMap[key] = config.label;
        colWidths.push({ wch: config.width || 10 });
        if (config.dateFormat) {
          dateFormatMap[key] = config.dateFormat;
        }
      }
    });

    const sheet = utils.json_to_sheet([headersFieldMap, ...transformedData], {
      skipHeader: true
    });

    if (colWidths.length > 0) {
      sheet["!cols"] = colWidths;
    }

    // 应用时间格式到对应的列
    if (Object.keys(dateFormatMap).length > 0) {
      const range = utils.decode_range(sheet["!ref"] || "A1");
      for (let row = 1; row <= range.e.r; row++) {
        Object.entries(dateFormatMap).forEach(([key, format]) => {
          const colIndex = keys.indexOf(key);
          if (colIndex >= 0) {
            const cellRef = utils.encode_cell({ r: row, c: colIndex });
            if (sheet[cellRef]) {
              sheet[cellRef].z = format;
            }
          }
        });
      }
    }

    return sheet;
  };

  const exportToFile = (sheet: any, fileName?: string): void => {
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "sheet");
    writeFile(book, `${fileName || "导出数据"}.xlsx`);
  };

  const arrayToExcel = <T extends Record<string, any>>(
    data: T[],
    headsConfig: Partial<Record<keyof T, HeadConfig>>
  ): void => {
    const transformedData = transformData(data, headsConfig);
    const sheet = createSheet(headsConfig, transformedData);
    exportToFile(sheet);
  };

  return { arrayToExcel, transformData, createSheet, exportToFile };
};
