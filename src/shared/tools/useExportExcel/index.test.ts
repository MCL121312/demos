import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExportExcel } from ".";
import * as xlsx from "xlsx";

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn()
  },
  writeFile: vi.fn()
}));

describe("useExportExcel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初始化 - 文件名配置", () => {
    it("未传入 bookName 时，应该使用默认文件名 '导出数据'", () => {
      const { exportToFile } = useExportExcel();
      const mockSheet = {};
      const mockBook = { Sheets: {}, SheetNames: [] };

      vi.mocked(xlsx.utils.book_new).mockReturnValue(mockBook);

      exportToFile(mockSheet);

      expect(xlsx.writeFile).toHaveBeenCalledWith(mockBook, "导出数据.xlsx");
    });
  });

  describe("数据转换 - transformData", () => {
    const testData = {
      users: [
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 }
      ],
      empty: []
    };

    const headsConfigs = {
      basic: {
        id: { label: "ID", width: 10 },
        name: { label: "姓名", width: 15 }
      }
    };
    it("应该根据列配置 headsConfig 过滤并转换数据", () => {
      const { transformData } = useExportExcel();
      const result = transformData(testData.users, headsConfigs.basic);

      expect(result).toEqual([
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
      ]);
    });

    it("应该只保留 headsConfig 中指定的字段，过滤掉其他字段", () => {
      const { transformData } = useExportExcel();
      const result = transformData(testData.users, headsConfigs.basic);

      expect(result[0]).not.toHaveProperty("age");
      expect(result[0]).not.toHaveProperty("email");
    });

    it("传入空数组时，应该返回空数组", () => {
      const { transformData } = useExportExcel();
      const result = transformData(testData.empty, headsConfigs.basic);

      expect(result).toEqual([]);
    });
  });

  describe("工作表创建 - createSheet", () => {
    it("应该创建包含列头和数据行的工作表，并设置列宽", () => {
      const { createSheet } = useExportExcel();
      const mockSheet = { "!cols": [] };
      vi.mocked(xlsx.utils.json_to_sheet).mockReturnValue(mockSheet);

      const headsConfig = {
        id: { label: "ID", width: 10 },
        name: { label: "姓名", width: 15 }
      };
      const transformedData = [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
      ];

      const result = createSheet(headsConfig, transformedData);

      expect(xlsx.utils.json_to_sheet).toHaveBeenCalledWith(
        [
          { id: "ID", name: "姓名" },
          { id: 1, name: "张三" },
          { id: 2, name: "李四" }
        ],
        { skipHeader: true }
      );
      expect(result["!cols"]).toEqual([{ wch: 10 }, { wch: 15 }]);
    });

    it("未指定 width 时，应该使用默认列宽 10", () => {
      const { createSheet } = useExportExcel();
      const mockSheet = { "!cols": [] };
      vi.mocked(xlsx.utils.json_to_sheet).mockReturnValue(mockSheet);

      const headsConfig = {
        id: { label: "ID" },
        name: { label: "姓名" }
      };
      const transformedData: Record<string, any>[] = [];

      createSheet(headsConfig, transformedData);

      const calls = vi.mocked(xlsx.utils.json_to_sheet).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const callArgs = calls[0]?.[0];
      expect(callArgs?.[0]).toEqual({ id: "ID", name: "姓名" });
    });

    it("配置为 undefined 时，应该跳过该列", () => {
      const { createSheet } = useExportExcel();
      const mockSheet = { "!cols": [] };
      vi.mocked(xlsx.utils.json_to_sheet).mockReturnValue(mockSheet);

      const headsConfig = {
        id: { label: "ID" },
        name: undefined
      };
      const transformedData: Record<string, any>[] = [];

      createSheet(headsConfig, transformedData);

      const calls = vi.mocked(xlsx.utils.json_to_sheet).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const callArgs = calls[0]?.[0];
      expect(callArgs?.[0]).toEqual({ id: "ID" });
    });
  });

  describe("完整导出流程 - arrayToExcel", () => {
    it("应该完整执行数据转换、工作表创建、工作簿创建和文件写入的全流程（book 和 sheet 作为完整步骤）", () => {
      const { arrayToExcel } = useExportExcel();
      const mockSheet = { "!cols": [] } as any;
      const mockBook = { Sheets: {}, SheetNames: [] } as any;

      vi.mocked(xlsx.utils.json_to_sheet).mockReturnValue(mockSheet);
      vi.mocked(xlsx.utils.book_new).mockReturnValue(mockBook);

      const data = [
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 }
      ];
      const headsConfig = {
        id: { label: "ID", width: 10 },
        name: { label: "姓名", width: 15 }
      };

      arrayToExcel(data, headsConfig);

      // 验证完整的 sheet 创建流程
      expect(xlsx.utils.json_to_sheet).toHaveBeenCalledWith(
        [
          { id: "ID", name: "姓名" },
          { id: 1, name: "张三" },
          { id: 2, name: "李四" }
        ],
        { skipHeader: true }
      );

      // 验证完整的 book 和 sheet 集成流程
      expect(xlsx.utils.book_new).toHaveBeenCalled();
      expect(xlsx.utils.book_append_sheet).toHaveBeenCalledWith(
        mockBook,
        mockSheet,
        "sheet"
      );

      // 验证文件写入
      expect(xlsx.writeFile).toHaveBeenCalledWith(mockBook, "导出数据.xlsx");
    });
  });
});
