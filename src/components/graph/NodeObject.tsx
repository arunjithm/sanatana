import * as THREE from 'three';
import type { GraphNode } from '@/types/knowledge';
import { DOMAIN_COLORS } from './useGraphData';

export type LabelMode = 'both' | 'english' | 'devanagari' | 'none';

interface NodeObjectOptions {
  highlighted?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  labelMode?: LabelMode;
}

const TIER_MULTIPLIERS: Record<string, number> = {
  galaxy: 3.2,
  solar: 2.2,
  planet: 1.5,
  moon: 1.0,
};

// Reusable circular radial gradient texture for glowing celestial auras
let cachedAuraTexture: THREE.CanvasTexture | null = null;
function getAuraTexture(): THREE.CanvasTexture {
  if (!cachedAuraTexture && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    cachedAuraTexture = new THREE.CanvasTexture(canvas);
  }
  return cachedAuraTexture!;
}

// Cached text sprite generator
const labelCache = new Map<string, THREE.CanvasTexture>();

function createTextTexture(
  devanagari: string,
  english: string,
  color: string,
  highlighted: boolean,
  mode: LabelMode
): THREE.CanvasTexture | null {
  if (mode === 'none' || typeof document === 'undefined') return null;

  const cacheKey = `${devanagari}_${english}_${color}_${highlighted}_${mode}`;
  if (labelCache.has(cacheKey)) {
    return labelCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = 384;
  canvas.height = 128;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background subtle pill when highlighted
  if (highlighted) {
    ctx.fillStyle = 'rgba(20, 20, 45, 0.85)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    const r = 24;
    ctx.beginPath();
    ctx.roundRect(16, 8, canvas.width - 32, canvas.height - 16, r);
    ctx.fill();
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textColor = highlighted ? '#ffffff' : color;
  const shadowColor = highlighted ? '#ffd700' : 'rgba(0, 0, 0, 0.9)';

  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = highlighted ? 8 : 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  if (mode === 'both') {
    // Devanagari line
    ctx.font = 'bold 30px "Noto Serif Devanagari", "Noto Serif", serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(devanagari, canvas.width / 2, 42);

    // English line
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(english, canvas.width / 2, 84);
  } else if (mode === 'devanagari') {
    ctx.font = 'bold 38px "Noto Serif Devanagari", "Noto Serif", serif';
    ctx.fillStyle = highlighted ? '#ffffff' : '#ffd700';
    ctx.fillText(devanagari, canvas.width / 2, 64);
  } else if (mode === 'english') {
    ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(english, canvas.width / 2, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  labelCache.set(cacheKey, texture);
  return texture;
}

export function createNodeObject(
  node: GraphNode,
  options?: NodeObjectOptions
): THREE.Object3D {
  const group = new THREE.Group();

  const tierMultiplier = TIER_MULTIPLIERS[node.tier] ?? 1.2;
  const radius = (node.size ?? 5) * tierMultiplier;
  const baseColor = node.color ?? DOMAIN_COLORS[node.domain] ?? '#ffffff';

  const isHighlighted = options?.highlighted || options?.selected;
  const isDimmed = options?.dimmed && !isHighlighted;
  const labelMode = options?.labelMode ?? 'both';

  const sphereColor = isHighlighted ? '#ffffff' : baseColor;
  const opacity = isDimmed ? 0.15 : 1.0;
  const transparent = isDimmed;

  // 1. Central Core Sphere
  const geometry = new THREE.SphereGeometry(radius, 24, 24);
  const material = new THREE.MeshPhongMaterial({
    color: sphereColor,
    transparent,
    opacity,
    emissive: isHighlighted
      ? new THREE.Color('#ffffaa')
      : new THREE.Color(baseColor).multiplyScalar(0.2),
    emissiveIntensity: isHighlighted ? 0.8 : 0.3,
    shininess: 60,
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // 2. Celestial Halos for Galaxy & Solar tiers
  if (typeof document !== 'undefined') {
    const auraTex = getAuraTexture();
    if (auraTex && !isDimmed) {
      if (node.tier === 'galaxy') {
        const auraMat = new THREE.SpriteMaterial({
          map: auraTex,
          color: new THREE.Color(baseColor),
          transparent: true,
          opacity: isHighlighted ? 0.85 : 0.45,
          blending: THREE.AdditiveBlending,
        });
        const auraSprite = new THREE.Sprite(auraMat);
        auraSprite.scale.set(radius * 5.5, radius * 5.5, 1);
        group.add(auraSprite);

        // Celestial Ring for Galaxy tier (Vedas, Trimurti, Devi)
        const ringGeo = new THREE.RingGeometry(radius * 1.8, radius * 2.3, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#ffd700'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isHighlighted ? 0.7 : 0.35,
          blending: THREE.AdditiveBlending,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.5;
        group.add(ringMesh);
      } else if (node.tier === 'solar') {
        const auraMat = new THREE.SpriteMaterial({
          map: auraTex,
          color: new THREE.Color(baseColor),
          transparent: true,
          opacity: isHighlighted ? 0.7 : 0.3,
          blending: THREE.AdditiveBlending,
        });
        const auraSprite = new THREE.Sprite(auraMat);
        auraSprite.scale.set(radius * 3.8, radius * 3.8, 1);
        group.add(auraSprite);
      }
    }
  }

  // 3. Dual-Script Billboard Text Sprite
  // Display text label if highlighted, galaxy/solar tier, or selected
  const shouldShowLabel =
    labelMode !== 'none' &&
    (!isDimmed || isHighlighted) &&
    (isHighlighted || node.tier === 'galaxy' || node.tier === 'solar' || labelMode !== 'both');

  if (shouldShowLabel && typeof document !== 'undefined') {
    const labelTex = createTextTexture(
      node.nameDevanagari,
      node.nameEnglish,
      baseColor,
      !!isHighlighted,
      labelMode
    );

    if (labelTex) {
      const spriteMat = new THREE.SpriteMaterial({
        map: labelTex,
        transparent: true,
        opacity: isDimmed ? 0.2 : 0.95,
        depthWrite: false,
      });
      const labelSprite = new THREE.Sprite(spriteMat);
      const spriteWidth = Math.max(radius * 3.5, 24);
      labelSprite.scale.set(spriteWidth, spriteWidth * (128 / 384), 1);
      labelSprite.position.set(0, radius + (node.tier === 'galaxy' ? 6 : 4), 0);
      group.add(labelSprite);
    }
  }

  return group;
}
