import { useEffect, useState, useRef, useCallback } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle — limita a taxa de execução de uma função.
 * Ideal para ações críticas (login, registro de ponto) que não devem
 * ser disparadas múltiplas vezes em sequência (anti brute-force / duplo registro).
 *
 * @param fn     Função a ser throttled
 * @param delay  Intervalo mínimo entre execuções em ms
 */
export function useThrottle<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  const lastCalledRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastCalledRef.current);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        lastCalledRef.current = now;
        return fn(...args);
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now();
          timerRef.current = null;
          fn(...args);
        }, remaining);
      }
    },

    [fn, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return throttled;
}
