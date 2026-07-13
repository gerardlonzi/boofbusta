export function buildPaginationUrl(
    page: number,
    filterParams: {
      category?: string;
      sort?: string;
      search?: string;
    }
  ) {
    const params = new URLSearchParams();
  
    params.set("page", page.toString());
  
    if (filterParams.category)
      params.set("category", filterParams.category);
  
    if (filterParams.sort)
      params.set("sort", filterParams.sort);
  
    if (filterParams.search)
      params.set("search", filterParams.search);
  
    return `/shop?${params.toString()}`;
  }