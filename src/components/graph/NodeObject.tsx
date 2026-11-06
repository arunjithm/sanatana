import * as THREE from 'three';
import type { GraphNode } from '@/types/knowledge';
import { DOMAIN_COLORS } from './useGraphData';

const TIER_MULTIPLIERS: Record<string, number> = {
  galaxy: 3,
  solar: 2,
  planet: 1.5,
  moon: 1,
};

export function createNodeObject(node: GraphNode): THREE.Object3D {
  const tierMultiplier = TIER_MULTIPLIERS[node.tier] ?? 1;
  const radius = (node.size ?? 5) * tierMultiplier;
  const color = node.color ?? DOMAIN_COLORS[node.domain] ?? '#ffffff';

  const geometry = new THREE.SphereGeometry(radius, 16, 16);
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);

  if (node.tier === 'galaxy') {
    const spriteMaterial = new THREE.SpriteMaterial({
      color,
      transparent: true,
      opacity: 0.3,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(radius * 6, radius * 6, 1);
    mesh.add(sprite);
  }

  return mesh;
}
