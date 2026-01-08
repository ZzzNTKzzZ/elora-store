import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../Api/apiClient";
import { useSearchParams } from "react-router-dom";
export default function useProducts({ category , minPrice , maxPrice , sort , tag, limit = 20  }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const pageRef = useRef(1);
  const [searchParams, ] = useSearchParams();
  const [meta, setMeta] = useState({});
  const [totalPage, setTotalPage] = useState(1);
  const buildParams = () => {
    const page = searchParams.get("page") || 1
    return new URLSearchParams({
      limit,
      page,
      ...(category && { category }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(sort && { sort }),
      ...(tag && { tag }),
    });
  };

  const loadPage = async (reset = false) => {
    if (loading || ( !reset )) return;
    setLoading(true);
    setError(null);

    if (reset) pageRef.current = 1;

    const params = buildParams(pageRef.current);

    // cancel previous request, attach new AbortController
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await apiFetch(`/products?${params}`, {} ,{ signal: controller.signal });
      setItems(data.data || []);
      setMeta(data.meta || {});
      setTotalPage((data.meta && data.meta.totalPages) || 1);
      if (data.data && data.data.length) pageRef.current += 1;
      setError(null);
    } catch (err) {
      if (err.name === "AbortError") {
        // aborted; ignore
      } else {
        setError(err.message || "Failed to load products");
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  // debounce on filter/sort change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      setItems([]);

      pageRef.current = 1;
      loadPage(true);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [category, minPrice, maxPrice, sort, tag]);



  // initial load
  useEffect(() => {
    loadPage(true);
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  return { items, loadPage, loading, error, meta, totalPage };
}
