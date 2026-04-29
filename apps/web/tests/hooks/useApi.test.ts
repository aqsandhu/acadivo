import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockApiCall = vi.fn();

const useApi = <T,>(url: string) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await mockApiCall(url);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchData();

  return { data, loading, error, fetchData, refetch };
};

describe('useApi Hook', () => {
  it('initial state has no data and no loading', () => {
    const { result } = renderHook(() => useApi('/api/students'));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading state while fetching', async () => {
    mockApiCall.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ students: [] }), 100)));

    const { result } = renderHook(() => useApi('/api/students'));

    act(() => {
      result.current.fetchData();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('sets data on successful fetch', async () => {
    const mockData = { students: [{ id: '1', name: 'Ahmad' }, { id: '2', name: 'Sana' }] };
    mockApiCall.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useApi('/api/students'));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed fetch', async () => {
    mockApiCall.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useApi('/api/students'));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('refetch clears previous error', async () => {
    mockApiCall.mockRejectedValueOnce(new Error('First error'));
    mockApiCall.mockResolvedValueOnce({ students: [] });

    const { result } = renderHook(() => useApi('/api/students'));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ students: [] });
  });

  it('refetch updates data', async () => {
    mockApiCall.mockResolvedValueOnce({ count: 10 });
    mockApiCall.mockResolvedValueOnce({ count: 15 });

    const { result } = renderHook(() => useApi('/api/students/count'));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.data).toEqual({ count: 10 });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual({ count: 15 });
  });

  it('handles 404 error', async () => {
    mockApiCall.mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useApi('/api/nonexistent'));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.error?.message).toBe('Not found');
  });

  it('handles empty response', async () => {
    mockApiCall.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useApi('/api/empty'));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
