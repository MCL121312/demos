import { getUsersApi } from "../../../network/apis/users";
import { usePagination } from "../../../shared/tools/usePagination";
// viewModel
interface User {
  id: number;
  name: string;
  phone: string;
  registerTime: Date;
}
type Users = User[];

export const useUsers = () => {
  const users = ref<Users>([]);

  const {
    pagination,
    resetPagination,
    changePageNumber: changePaginationPageNumber,
    changePageSize: changePaginationPageSize,
    pageSizes
  } = usePagination(1,[10,20,50,1000],1000);

  // 重置搜索条件 并搜索
  async function loadUsers() {
    resetPagination();
    await searchUsers(pagination.value);
  }

  interface PaginationFilterConditions {
    pageNumber: number;
    pageSize: number;
  }
  interface KeywordFilterConditions {
    name: string;
  }
  async function searchUsers(
    paginationFilterConditions: PaginationFilterConditions,
    keywordFilterConditions: KeywordFilterConditions={ name: "" }
  ) {
    
    const { data, total } = await getUsersApi(paginationFilterConditions, keywordFilterConditions);
    users.value = data;
    pagination.value.total = total;
  }

  const changePageNumber = (newPage: number) => {
    changePaginationPageNumber(newPage);
  };

  const changePageSize = (newSize: number) => {
    changePaginationPageSize(newSize);
  };

  // users是无效的
  const invalidUsers = computed(() => {
    return users.value.length === 0 || users.value[0] === undefined;
  });

  return {
    users,

    loadUsers,
    searchUsers,
    invalidUsers,

    pagination,
    changePageNumber,
    changePageSize,

    pageSizes
  };
};
