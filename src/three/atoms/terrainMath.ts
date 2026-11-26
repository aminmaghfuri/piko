import * as THREE from 'three';

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function getTerrainHeight(x: number, z: number, islandId: number): number {
  const r = Math.hypot(x, z);
  const t = Math.min(1, r / 56);
  const seed = islandId * 1.75;
  return (
    5.6 * Math.pow(Math.max(0, 1 - Math.pow(t, 2.0)), 1.3) -
    1.6 +
    (Math.sin(x * 0.11 + seed) * Math.cos(z * 0.1 - seed) * 1.15 +
      Math.cos(x * 0.22 - z * 0.18 + seed * 1.5) * 0.5) *
      smoothstep(6, 16, r) *
      (1 - smoothstep(44, 54, r))
  );
}

export function getGroundLevel(
  x: number,
  z: number,
  islandId: number,
  centerY: number,
  deckY: number,
  hasPier: boolean,
): number {
  let height = getTerrainHeight(x, z, islandId);
  if (Math.hypot(x, z) < 4.7) {
    height = Math.max(height, centerY + 0.36);
  }
  if (hasPier && Math.abs(x) < 1.75 && z >= 38 && z <= 52) {
    height = Math.max(height, deckY + 0.08);
  }
  return height;
}

export function perturbOrganicGeometry<T extends THREE.BufferGeometry>(
  geometry: T,
  amount: number,
): T {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = Math.sin(x * 3.1 + y * 2.7 + z * 4.3) * amount;
    pos.setXYZ(i, x * (1 + n), y * (1 + n * 0.6), z * (1 + n));
  }
  geometry.computeVertexNormals();
  return geometry;
}
