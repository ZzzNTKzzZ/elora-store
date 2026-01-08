import { apiFetch } from "./apiClient";

export async function getProducts({
  page = 1,
  limit = 20,
  category = "",
  minPrice = "",
  maxPrice = "",
  sort = "",
  tag = "",
}) {
  const query = new URLSearchParams({
    page,
    limit,
    ...(category && { category }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(sort && { sort }),
  });

  return apiFetch(`/products/${tag ?? ""}?${query}`);
}

export async function getProductDetail(slug) {
  return apiFetch(`/products/${slug}`);
}

export async function createProduct(formData) {
  // send FormData directly so file uploads are preserved
  const option = {
    method: "POST",
    body: formData,
  };
  return apiFetch(`/products/add`, option);
}

export async function searchProduct(query, limit = 10) {
  if (!query) return [];
  const encodedQuery = encodeURIComponent(query);
  try {
    const response = await apiFetch(`/products/search?q=${encodedQuery}`);
    return Array.isArray(response) ? response : response.data || [];
  } catch (err) {
    console.error("Search API error:", err);
    return [];
  }
}