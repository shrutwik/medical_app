import { useEffect, useState } from 'react';

interface AsyncState<T> {
  loading: boolean;
  error?: string;
  data?: T;
}

export function useAsyncResource<T>(factory: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    setState({
      loading: true,
    });

    factory()
      .then((data) => {
        if (cancelled) return;
        setState({
          loading: false,
          data,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Something went wrong.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
