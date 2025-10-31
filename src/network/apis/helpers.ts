export const getPaginatedData = <T extends any>(
  data: T[],
  {
    pageNumber,
    pageSize
  }: {
    pageNumber: number;
    pageSize: number;
  }
): T[] => {
  const paginatedData = data.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  return paginatedData;
};
