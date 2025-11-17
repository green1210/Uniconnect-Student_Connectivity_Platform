import { useEffect, useState, useRef } from 'react';

const internalCache = new Map();

export function useStaleCache(key, fetcher, { ttl = 30000 } = {}) {
  const [data, setData] = useState(() => internalCache.get(key)?.data || null);
  const [loading, setLoading] = useState(!internalCache.has(key));
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const entry = internalCache.get(key);
    const expired = !entry || (Date.now() - entry.time) > ttl;
    if (expired) {
      setLoading(true);
      (async () => {
        try {
          const result = await fetcher();
          internalCache.set(key, { data: result, time: Date.now() });
          if (mounted.current) setData(result);
        } catch (e) {
          if (mounted.current) setData(null);
        } finally {
          if (mounted.current) setLoading(false);
        }
      })();
    }
    return () => { mounted.current = false; };
  }, [key, fetcher, ttl]);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      internalCache.set(key, { data: result, time: Date.now() });
      if (mounted.current) setData(result);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return { data, loading, refresh };
}
