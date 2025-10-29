import { describe, it, expect } from 'vitest';
import { usePagination } from './index';

describe('usePagination', () => {

  it("应该能通过方法修改页码", () => {
    const { pagination, changePageNumber } = usePagination();
    changePageNumber(2);
    expect(pagination.value.pageNumber).toBe(2);
  });

  it("应该能通过方法修改页大小", () => {
    const { pagination, changePageSize } = usePagination();
    changePageSize(30);
    expect(pagination.value.pageSize).toBe(30);
  });

  it("应该能重置分页", () => {
    const { pagination, resetPagination } = usePagination();
    pagination.value.pageNumber = 2;
    pagination.value.pageSize = 30;
    pagination.value = {
      ...pagination.value,
      pageNumber: 2,
      pageSize: 30
    }
    resetPagination();
    expect(pagination.value.pageNumber).toBe(1);
    expect(pagination.value.pageSize).toBe(20);
  });

  it("应该能获取正确的分页数据", () => {
    const { getPaginatedData } = usePagination();
    const data = [
      {
        id: 1,
        name: "Alice"
      },
      {
        id: 2,
        name: "Bob"
      },
      {
        id: 3,
        name: "Charlie"
      },
      {
        id: 4,
        name: "David"
      },
      {
        id: 5,
        name: "Eve"
      }
    ];
    const paginatedData = getPaginatedData(data, 1, 2);
    expect(paginatedData).toEqual([
      {
        id: 1,
        name: "Alice"
      },
      {
        id: 2,
        name: "Bob"
      }
    ]);
  });

 
  it("应该使用默认的 pageSizes", () => {
    const { getPageSizes } = usePagination();
    expect(getPageSizes()).toEqual([10, 20, 50, 100]);
  });

  it("应该支持自定义 pageSizes", () => {
    const customSizes = [5, 15, 30, 60];
    const { getPageSizes } = usePagination(1, customSizes);
    expect(getPageSizes()).toEqual(customSizes);
  });

  it("应该能动态更新 pageSizes", () => {
    const { getPageSizes, setPageSizes } = usePagination();
    const newSizes = [25, 50, 75];
    setPageSizes(newSizes);
    expect(getPageSizes()).toEqual(newSizes);
  });

  it("应该支持自定义初始 pageNumber", () => {
    const { pagination } = usePagination(2);
    expect(pagination.value.pageNumber).toBe(2);
  });

  it("应该支持自定义初始 pageSize", () => {
    const { pagination } = usePagination(1, [10, 20, 50], 50);
    expect(pagination.value.pageSize).toBe(50);
  });

  it("应该支持同时配置 pageNumber、pageSizes 和 pageSize", () => {
    const { pagination, getPageSizes, resetPagination } = usePagination(
      2,
      [25, 50, 100],
      50
    );
    expect(pagination.value.pageNumber).toBe(2);
    expect(pagination.value.pageSize).toBe(50);
    expect(getPageSizes()).toEqual([25, 50, 100]);

    resetPagination();
    expect(pagination.value.pageNumber).toBe(2);
    expect(pagination.value.pageSize).toBe(50);
  });
});
