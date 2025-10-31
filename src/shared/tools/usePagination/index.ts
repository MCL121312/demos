interface Pagination {
  pageNumber: number;
  pageSize: number;
  total: number;
}

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];
const defaultPagination: Pagination = {
  pageNumber: 1,
  pageSize: 20,
  total: 0
};

export function usePagination(
  pageNumber: number = 1,
  customizePageSizes: number[] = [...DEFAULT_PAGE_SIZES],
  pageSize: number = 20
) {
  const pagination = ref<Pagination>({
    ...defaultPagination,
    pageNumber,
    pageSize
  });

  const pageSizes =  ref([...customizePageSizes]);

  function resetPagination() {
    pagination.value = {
      pageNumber,
      pageSize,
      total: 0
    };
  }

  const changePageNumber = (newPage: number) => {
    pagination.value.pageNumber = newPage;
  };

  const changePageSize = (newSize: (typeof pageSizes.value)[number]) => {
    // 验证 pageSize 是否在允许的范围内
    if (!pageSizes.value.includes(newSize)) {
      console.warn(
        `pageSize ${newSize} is not in available sizes: ${pageSizes.value.join(
          ", "
        )}`
      );
    }
    pagination.value.pageSize = newSize;
  };


  const getPaginatedData = <T extends any>(
    data: T[],
    pageNumber?: number,
    pageSize?: number
  ) => {
    const pn = pageNumber ?? pagination.value.pageNumber;
    const ps = pageSize ?? pagination.value.pageSize;
    return data.slice((pn - 1) * ps, pn * ps);
  };

  return {
    pagination,

    resetPagination,
    changePageNumber,
    changePageSize,
    
    pageSizes,
    
    getPaginatedData
  };
}
