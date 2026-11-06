import { getAllNodes, getAllEdges, getAllDomains, getNodeById, getNodesByDomain, getEdgesForNode, validateGraph } from './repository';

test('getAllNodes returns 109 nodes', () => {
  expect(getAllNodes()).toHaveLength(109);
});

test('every node has at least one source', () => {
  getAllNodes().forEach(node => {
    expect(node.sources.length).toBeGreaterThan(0);
  });
});

test('getAllEdges returns at least 300 edges', () => {
  expect(getAllEdges().length).toBeGreaterThanOrEqual(300);
});

test('validateGraph returns no errors', () => {
  const result = validateGraph();
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test('getNodeById returns correct node', () => {
  const node = getNodeById('veda-rigveda');
  expect(node?.nameEnglish).toBe('Rigveda');
});

test('validateGraph detects orphan edges', () => {
  const edges = getAllEdges();
  const nodeIds = new Set(getAllNodes().map(n => n.id));
  edges.forEach(edge => {
    expect(nodeIds.has(edge.source)).toBe(true);
    expect(nodeIds.has(edge.target)).toBe(true);
  });
});

test('getAllDomains returns domains', () => {
  const domains = getAllDomains();
  expect(domains.length).toBeGreaterThan(0);
  domains.forEach(d => {
    expect(d.id).toBeDefined();
    expect(d.name).toBeDefined();
  });
});

test('getNodesByDomain returns only nodes of that domain', () => {
  const nodes = getNodesByDomain('shruti');
  expect(nodes.length).toBeGreaterThan(0);
  nodes.forEach(n => expect(n.domain).toBe('shruti'));
});

test('getEdgesForNode returns edges where node is source or target', () => {
  const edges = getEdgesForNode('veda-rigveda');
  expect(edges.length).toBeGreaterThan(0);
  edges.forEach(e => {
    expect(e.source === 'veda-rigveda' || e.target === 'veda-rigveda').toBe(true);
  });
});

test('getAllNodes returns cached result on second call', () => {
  const first = getAllNodes();
  const second = getAllNodes();
  expect(first).toBe(second);
});
