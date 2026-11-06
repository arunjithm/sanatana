import { buildGraphData } from './useGraphData';
import { getAllDomains } from '@/data/repository';
import type { DomainId } from '@/types/knowledge';

const ALL_DOMAINS = new Set<DomainId>([
  'shruti', 'smriti', 'purana', 'vedanga',
  'darshana', 'agama', 'deity', 'sage', 'concept', 'science_art', 'upaveda',
]);

test('returns all nodes when all domains active', () => {
  const data = buildGraphData(ALL_DOMAINS);
  expect(data.nodes.length).toBe(109);
});

test('filters nodes by domain', () => {
  const data = buildGraphData(new Set<DomainId>(['deity']));
  expect(data.nodes.length).toBe(18);
});

test('edges with hidden endpoint are excluded', () => {
  const data = buildGraphData(new Set<DomainId>(['deity']));
  const nodeIds = new Set(data.nodes.map(n => n.id));
  data.links.forEach(link => {
    expect(nodeIds.has(link.source as string)).toBe(true);
    expect(nodeIds.has(link.target as string)).toBe(true);
  });
});

test('empty activeDomains returns no nodes or links', () => {
  const data = buildGraphData(new Set<DomainId>());
  expect(data.nodes.length).toBe(0);
  expect(data.links.length).toBe(0);
});

test('nodes have color and size set', () => {
  const data = buildGraphData(new Set<DomainId>(['deity']));
  data.nodes.forEach(n => {
    expect(n.color).toBeTruthy();
    expect(typeof n.size).toBe('number');
    expect((n.size as number)).toBeGreaterThan(0);
  });
});

test('getAllDomains returns 11 domains', () => {
  const domains = getAllDomains();
  expect(domains.length).toBe(11);
});

test('links have color set', () => {
  const data = buildGraphData(ALL_DOMAINS);
  data.links.forEach(link => {
    expect(link.color).toBeTruthy();
  });
});
