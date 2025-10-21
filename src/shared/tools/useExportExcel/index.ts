import { utils, writeFile } from "xlsx";

declare global {
  interface ImportMeta {
    vitest?: boolean;
  }
}

interface HeadConfig {
  title: string;
  width?: number;
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
    const headersFieldMap: Record<string, string> = {};
    const colWidths: Array<{ wch: number }> = [];

    Object.entries(headsConfig).forEach(([key, config]) => {
      if (config) {
        headersFieldMap[key] = config.title;
        colWidths.push({ wch: config.width || 10 });
      }
    });

    const sheet = utils.json_to_sheet([headersFieldMap, ...transformedData], {
      skipHeader: true
    });

    if (colWidths.length > 0) {
      sheet["!cols"] = colWidths;
    }

    return sheet;
  };

  const exportToFile = (sheet: any, fileName?: string): void => {
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "sheet");
    writeFile(book, `${fileName||"导出数据"}.xlsx`);
  };

  const arrayToExcel = <T extends Record<string, any>>(
    data: T[],
    headsConfig: Partial<Record<keyof T, HeadConfig>>
  ): void => {
    const transformedData = transformData(data, headsConfig);
    const sheet = createSheet(headsConfig, transformedData);
    exportToFile(sheet);
  };

  return {  arrayToExcel, transformData, createSheet, exportToFile };
};
