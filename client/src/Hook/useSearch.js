import { useState, useEffect } from "react";

export default function useSearch(apiUrl, query = "", type = "get", delay = 300) {
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load static data for type "get"
  useEffect(() => {
    if (type !== "get" || !apiUrl) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResult(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setResult([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [apiUrl, type]);

  // Load dynamic search / query data
  useEffect(() => {
    if (!query && type !== "get") {
      setResult([]);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchUrl = type === "get" ? apiUrl : `${apiUrl}?q=${encodeURIComponent(query)}`;
    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(fetchUrl, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResult(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setResult([]);
        }
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [apiUrl, query, type, delay]);

  return { result, error, loading };
}
