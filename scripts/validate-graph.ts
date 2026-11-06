import { validateGraph } from '../src/data/repository.ts';

const result = validateGraph();
if (!result.valid) {
  console.error('Graph validation failed:', result.errors);
  process.exit(1);
}
console.log('Graph valid');
