export const getPaginatedData = <T extends any>(data: T[],{
    pageNumber,
    pageSize
}:{
    pageNumber: number;
    pageSize: number;
}):{
    paginatedData:T [];
    total: number;
} => {
    const paginatedData =  data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    const total = data.length;

  return {
    paginatedData,
    total
  }
};
 