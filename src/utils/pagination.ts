export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(urlSearchParams: URLSearchParams): PaginationParams {
  const pageParam = urlSearchParams.get("page");
  const limitParam = urlSearchParams.get("limit");

  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function getPaginationMetadata(totalCount: number, page: number, limit: number) {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    page,
    limit,
    totalCount,
    totalPages,
  };
}
