import { renderHook, act } from '@testing-library/react';
import { useNodeSelection } from './useNodeSelection';

test('initial state has no selection', () => {
  const { result } = renderHook(() => useNodeSelection());
  expect(result.current.selectedNode).toBeNull();
  expect(result.current.history).toHaveLength(0);
});

test('selecting a node adds it to history', () => {
  const { result } = renderHook(() => useNodeSelection());
  const fakeNode = { id: 'test', nameEnglish: 'Test' } as any;
  act(() => result.current.selectNode(fakeNode));
  expect(result.current.selectedNode?.id).toBe('test');
  expect(result.current.history).toHaveLength(1);
});

test('selecting null clears selected node but keeps history', () => {
  const { result } = renderHook(() => useNodeSelection());
  const fakeNode = { id: 'test', nameEnglish: 'Test' } as any;
  act(() => result.current.selectNode(fakeNode));
  act(() => result.current.selectNode(null));
  expect(result.current.selectedNode).toBeNull();
  expect(result.current.history).toHaveLength(1);
});

test('history is capped at 10 entries', () => {
  const { result } = renderHook(() => useNodeSelection());
  for (let i = 0; i < 12; i++) {
    const node = { id: `node-${i}`, nameEnglish: `Node ${i}` } as any;
    act(() => result.current.selectNode(node));
  }
  expect(result.current.history).toHaveLength(10);
});

test('selecting undefined sanskritPassages does not crash', () => {
  const { result } = renderHook(() => useNodeSelection());
  const nodeWithoutPassages = {
    id: 'no-passages',
    nameEnglish: 'No Passages',
    sanskritPassages: undefined,
  } as any;
  act(() => result.current.selectNode(nodeWithoutPassages));
  expect(result.current.selectedNode?.id).toBe('no-passages');
  expect(result.current.selectedNode?.sanskritPassages).toBeUndefined();
});
