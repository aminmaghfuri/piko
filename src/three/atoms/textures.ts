import * as THREE from 'three';

export function createProceduralNoiseTexture(
  size: number,
  r: number,
  g: number,
  b: number,
  variance: number,
  scaleX: number,
  scaleY: number,
  repeat: number,
  isColorMap = true,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const delta =
          (Math.sin(x * 0.15 * scaleX + Math.cos(y * 0.12 * scaleY) * 2) * 0.5 +
            (Math.random() - 0.5)) *
          variance;
        img.data[idx] = Math.min(255, Math.max(0, r + delta));
        img.data[idx + 1] = Math.min(255, Math.max(0, g + delta));
        img.data[idx + 2] = Math.min(255, Math.max(0, b + delta));
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = isColorMap ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}
