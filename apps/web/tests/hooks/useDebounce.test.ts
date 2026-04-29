import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'changed', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('changed');
  });

  it('does not update before delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a');

    rerender({ value: 'c', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a');

    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('c'); // Last value after full delay
  });

  it('uses different delay times', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 100 } }
    );

    rerender({ value: 'updated', delay: 100 });
    act(() => { vi.advanceTimersByTime(50); });
    expect(result.current).toBe('test');

    act(() => { vi.advanceTimersByTime(50); });
    expect(result.current).toBe('updated');
  });

  it('cancels previous timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 200 } }
    );

    rerender({ value: '1', delay: 200 });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: '2', delay: 200 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('start'); // First timer cancelled

    rerender({ value: '3', delay: 200 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('start'); // Second timer cancelled

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('3'); // Only last value applied
  });

  it('handles numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    rerender({ value: 42, delay: 100 });
    expect(result.current).toBe(0);

    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe(42);
  });

  it('handles object values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { query: '' }, delay: 150 } }
    );

    rerender({ value: { query: 'search term' }, delay: 150 });
    expect(result.current.query).toBe('');

    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current.query).toBe('search term');
  });
});
