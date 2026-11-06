import { renderHook, act } from '@testing-library/react';
import { useSearch } from './useSearch';

test('empty query returns empty results', () => {
  const { result } = renderHook(() => useSearch());
  expect(result.current.results).toHaveLength(0);
});

test('query "Karma" returns at least one result', () => {
  const { result } = renderHook(() => useSearch());
  act(() => result.current.setQuery('Karma'));
  expect(result.current.results.length).toBeGreaterThan(0);
});

test('query "Karma" produces non-empty highlightedIds', () => {
  const { result } = renderHook(() => useSearch());
  act(() => result.current.setQuery('Karma'));
  expect(result.current.highlightedIds.size).toBeGreaterThan(0);
});

test('zero-result query returns empty array not undefined', () => {
  const { result } = renderHook(() => useSearch());
  act(() => result.current.setQuery('xyzzy_no_match_12345'));
  expect(Array.isArray(result.current.results)).toBe(true);
  expect(result.current.results).toHaveLength(0);
});
