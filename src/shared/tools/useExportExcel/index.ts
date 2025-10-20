import { utils, writeFile } from "xlsx";

interface ParsedHeadsConfig {
  headersFieldMap: Record<string, string>;
  colWidths: Array<{ wch: number }>;
}

export const useExportExcel = () => {
  interface HeadConfig {
    title: string;
    width?: number;
  }
  const exportData = <T extends Record<string, any>>(
    data: T[],
    headsConfig: Partial<Record<keyof T, HeadConfig>>
  ): void => {
    const { headersFieldMap, colWidths } = parseHeadsConfig(headsConfig);
    const transformedData = transformData(data, headsConfig);
    const sheet = createSheet(headersFieldMap, transformedData, colWidths);
    exportToFile(sheet);
  };
  const parseHeadsConfig = <T extends Record<string, any>>(
    headsConfig: Partial<Record<keyof T, HeadConfig>>
  ): ParsedHeadsConfig => {
    const headersFieldMap: Record<string, string> = {};
    const colWidths: Array<{ wch: number }> = [];

    Object.entries(headsConfig).forEach(([key, config]) => {
      if (config) {
        headersFieldMap[key] = config.title;
        colWidths.push({ wch: config.width || 10 });
      }
    });

    return { headersFieldMap, colWidths };
  };

  const transformData = <T extends Record<string, any>>(
    data: T[],
    headsConfig: Partial<Record<keyof T, HeadConfig>>
  ): Record<string, any>[] => {
    return data.map(item => {
      const row: Record<string, any> = {};
      for (const key in headsConfig) {
        row[key] = item[key];
      }
      return row;
    });
  };

  const createSheet = (
    headersFieldMap: Record<string, string>,
    transformedData: Record<string, any>[],
    colWidths: Array<{ wch: number }>
  ): any => {
    const sheet = utils.json_to_sheet([headersFieldMap, ...transformedData], {
      skipHeader: true
    });

    if (colWidths.length > 0) {
      sheet["!cols"] = colWidths;
    }

    return sheet;
  };

  const exportToFile = (sheet: any, fileName: string = "导出数据"): void => {
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "sheet");
    writeFile(book, `${fileName}.xlsx`);
  };

  return {
    exportData
  };
};
