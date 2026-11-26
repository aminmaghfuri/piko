import * as THREE from 'three';
import { IslandTheme, ObstacleCircle } from '../../types/game';
import { getTerrainHeight, perturbOrganicGeometry } from './terrainMath';

export interface ButterflyAnimAtom {
  group: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  cx: number;
  cz: number;
  baseY: number;
  phase: number;
}

export interface WeatherParticleAtom {
  mesh: THREE.Mesh;
  vy: number;
  vx: number;
  phase: number;
}

export interface SkyDomeAtom {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
}

export function createSkyDomeAtom(sunDirection: THREE.Vector3): SkyDomeAtom {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uS: { value: sunDirection },
      uT: { value: new THREE.Color(0x1c6bd0) },
      uM: { value: new THREE.Color(0x70c2f5) },
      uH: { value: new THREE.Color(0xdbeeff) },
    },
    vertexShader:
      'varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:
      'varying vec3 vW; uniform vec3 uS,uT,uM,uH; void main(){ vec3 d=normalize(vW); float h=clamp(d.y,0.,1.); vec3 c=mix(uH,uM,smoothstep(0.,.25,h)); c=mix(c,uT,smoothstep(.22,.85,h)); float s=max(dot(d,normalize(uS)),0.); c+=vec3(1.,.9,.65)*pow(s,12.)*.35+vec3(1.,.98,.9)*smoothstep(.996,.9992,s)*1.4; gl_FragColor=vec4(c,1.); }',
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(250, 28, 20), material);
  return { mesh, material };
}

export function createOceanAtom(
  waterNormal: THREE.CanvasTexture,
  isLowDetail: boolean,
): { mesh: THREE.Mesh; geometry: THREE.PlaneGeometry; material: THREE.MeshStandardMaterial } {
  const segs = isLowDetail ? 32 : 48;
  const geometry = new THREE.PlaneGeometry(500, 500, segs, segs);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0685b8,
    roughness: 0.14,
    metalness: 0.35,
    bumpMap: waterNormal,
    bumpScale: 0.12,
    transparent: true,
    opacity: 0.88,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.02;
  mesh.receiveShadow = true;
  return { mesh, geometry, material };
}

export function createSailboatAtom(
  woodMat: THREE.MeshStandardMaterial,
  darkWoodMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.55, 4.2, 12), woodMat);
  hull.rotation.z = Math.PI / 2;
  hull.scale.set(0.65, 1, 1.2);
  hull.castShadow = true;

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), darkWoodMat);
  mast.position.y = 2.1;

  const sail = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 3),
    new THREE.MeshStandardMaterial({
      color: 0xfdf8ee,
      roughness: 0.85,
      side: THREE.DoubleSide,
    }),
  );
  sail.position.set(0.1, 2.4, 0.6);
  sail.rotation.y = 0.3;

  boat.add(hull, mast, sail);
  boat.position.set(24, 0.2, 54);
  boat.rotation.y = -0.5;
  return boat;
}

export function createCloudClusterAtom(): { group: THREE.Group; speed: number } {
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const group = new THREE.Group();
  const puffs: [number, number, number, number][] = [
    [0, 0, 0, 3],
    [2.4, -0.4, 0.3, 2.2],
    [-2.3, -0.5, -0.2, 2.2],
  ];
  puffs.forEach(([x, y, z, r]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), cloudMat);
    puff.position.set(x, y, z);
    puff.scale.y = 0.65;
    group.add(puff);
  });
  group.position.set(
    (Math.random() - 0.5) * 220,
    26 + Math.random() * 10,
    (Math.random() - 0.5) * 220,
  );
  return { group, speed: 0.45 + Math.random() * 0.4 };
}

export function createMonumentAtom(
  theme: IslandTheme,
  centerY: number,
  stoneMat: THREE.MeshStandardMaterial,
  obstacles: ObstacleCircle[],
): THREE.Group {
  const group = new THREE.Group();
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.4, 0.5, 24), stoneMat);
  plaza.position.set(0, centerY + 0.1, 0);
  plaza.receiveShadow = true;
  group.add(plaza);

  if (theme.monument === 'plaza') {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.78;
      const px = Math.cos(a) * 4.2;
      const pz = Math.sin(a) * 4.2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 2.8, 10), stoneMat);
      pillar.position.set(px, centerY + 1.5, pz);
      pillar.castShadow = true;
      group.add(pillar);
      obstacles.push({ x: px, z: pz, r: 0.5 });
    }
  } else if (theme.monument === 'arch') {
    const archMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.6, 10), archMat);
    postL.position.set(-2.2, centerY + 2, -3.5);
    const postR = postL.clone();
    postR.position.x = 2.2;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.45, 0.6), archMat);
    beam.position.set(0, centerY + 3.8, -3.5);
    group.add(postL, postR, beam);
    obstacles.push({ x: -2.2, z: -3.5, r: 0.45 }, { x: 2.2, z: -3.5, r: 0.45 });
  } else if (theme.monument === 'pyramid') {
    const py = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 4.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.75 }),
    );
    py.rotation.y = 0.78;
    py.position.set(0, centerY + 2.4, -3.2);
    py.castShadow = true;
    group.add(py);
    obstacles.push({ x: 0, z: -3.2, r: 2.2 });
  } else if (theme.monument === 'igloo') {
    const igloo = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.38 }),
    );
    igloo.position.set(0, centerY + 0.35, -2.8);
    group.add(igloo);
    obstacles.push({ x: 0, z: -2.8, r: 2.3 });
  } else if (theme.monument === 'spire') {
    const spire = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        clearcoat: 1,
      }),
    );
    spire.scale.set(1, 2.5, 1);
    spire.position.set(0, centerY + 3.8, -3.2);
    group.add(spire);
    obstacles.push({ x: 0, z: -3.2, r: 1.2 });
  } else {
    const trophy = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 0.5, 2, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.88, roughness: 0.15 }),
    );
    trophy.position.set(0, centerY + 2.4, -3.2);
    trophy.castShadow = true;
    group.add(trophy);
    obstacles.push({ x: 0, z: -3.2, r: 1.1 });
  }

  return group;
}

export function createPierAtom(
  deckY: number,
  woodMat: THREE.MeshStandardMaterial,
  darkWoodMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const group = new THREE.Group();
  for (let pz = 32.2; pz <= 50.4; pz += 0.75) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.68), woodMat);
    plank.position.set(0, deckY, pz);
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.4,
    roughness: 0.3,
  });
  [34, 39, 44, 49.2].forEach((zp, ix) => {
    [-1.55, 1.55].forEach((xp) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 2.8, 10), darkWoodMat);
      post.position.set(xp, 0.3, zp);
      group.add(post);
      if (ix === 3) {
        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.35, 8), lanternMat);
        lantern.position.set(xp, 1.85, zp);
        group.add(lantern);
      }
    });
  });
  return group;
}

export function createTreeAtom(
  theme: IslandTheme,
  tx: number,
  tz: number,
  idx: number,
  barkMat: THREE.MeshStandardMaterial,
  stoneMat: THREE.MeshStandardMaterial,
): { group: THREE.Group; radius: number } | null {
  const y = getTerrainHeight(tx, tz, theme.id);
  if (y < 0.7) return null;
  const scale = 0.9 + (idx % 3) * 0.18;
  const group = new THREE.Group();

  if (theme.treeType === 'cactus') {
    const cMat = new THREE.MeshStandardMaterial({ color: theme.treeColors[idx % 3], roughness: 0.78 });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32 * scale, 0.38 * scale, 3 * scale, 10),
      cMat,
    );
    trunk.position.y = 1.5 * scale;
    trunk.castShadow = true;
    const armL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2 * scale, 0.22 * scale, 1.2 * scale, 8),
      cMat,
    );
    armL.position.set(-0.55 * scale, 1.8 * scale, 0);
    armL.rotation.z = 0.6;
    const armR = armL.clone();
    armR.position.set(0.55 * scale, 2 * scale, 0);
    armR.rotation.z = -0.6;
    group.add(trunk, armL, armR);
  } else if (theme.treeType === 'sakura' || theme.treeType === 'rain') {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * scale, 0.42 * scale, 2.5 * scale, 10),
      barkMat,
    );
    trunk.position.y = 1.25 * scale;
    trunk.castShadow = true;
    group.add(trunk);
    const canopies: [number, number, number, number][] = [
      [0, 3.1, 0, 1.8],
      [-1, 2.6, 0.6, 1.3],
      [1, 2.7, -0.5, 1.35],
    ];
    canopies.forEach(([px, py, pz, pr], ci) => {
      const puff = new THREE.Mesh(
        perturbOrganicGeometry(new THREE.IcosahedronGeometry(pr * scale, 1), 0.15),
        new THREE.MeshStandardMaterial({
          color: theme.treeColors[(idx + ci) % 3],
          roughness: 0.78,
        }),
      );
      puff.position.set(px * scale, py * scale, pz * scale);
      puff.castShadow = true;
      group.add(puff);
    });
  } else if (theme.treeType === 'crys') {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, 1.2 * scale, 8),
      stoneMat,
    );
    base.position.y = 0.6 * scale;
    const col = theme.treeColors[idx % 3];
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.1 * scale, 0),
      new THREE.MeshPhysicalMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.35,
        roughness: 0.15,
        clearcoat: 1,
      }),
    );
    shard.scale.set(0.8, 2, 0.8);
    shard.position.y = 2.4 * scale;
    shard.castShadow = true;
    group.add(base, shard);
  } else {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24 * scale, 0.46 * scale, 2.6 * scale, 10),
      barkMat,
    );
    trunk.position.y = 1.3 * scale;
    trunk.castShadow = true;
    group.add(trunk);
    const tiers = [
      { r: 2, h: 2.4, y: 2.8, c: theme.treeColors[0] },
      { r: 1.55, h: 2.2, y: 4.1, c: theme.treeColors[1] },
      { r: 1, h: 1.8, y: 5.2, c: theme.treeColors[2] },
    ];
    tiers.forEach((tier) => {
      const cone = new THREE.Mesh(
        perturbOrganicGeometry(new THREE.ConeGeometry(tier.r * scale, tier.h * scale, 11, 2), 0.12),
        new THREE.MeshStandardMaterial({ color: tier.c, roughness: 0.85 }),
      );
      cone.position.y = tier.y * scale;
      cone.castShadow = true;
      group.add(cone);
    });
  }

  group.position.set(tx, y - 0.1, tz);
  return { group, radius: 0.72 * scale };
}

export function createPalmTreeAtom(
  islandId: number,
  px: number,
  pz: number,
  rotY: number,
  barkMat: THREE.MeshStandardMaterial,
): { group: THREE.Group; crown: THREE.Group } {
  const y = getTerrainHeight(px, pz, islandId);
  const palm = new THREE.Group();
  palm.position.set(px, y - 0.15, pz);

  let cx = 0;
  let cy = 0;
  for (let i = 0; i < 7; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28 - i * 0.02, 0.33 - i * 0.02, 0.85, 9),
      barkMat,
    );
    const bend = i * 0.08;
    cx += Math.sin(bend) * 0.35;
    cy += Math.cos(bend) * 0.75;
    seg.position.set(cx, cy, 0);
    seg.rotation.z = -bend;
    seg.castShadow = true;
    palm.add(seg);
  }

  const crown = new THREE.Group();
  crown.position.set(cx, cy + 0.2, 0);
  const frondMat = new THREE.MeshStandardMaterial({
    color: 0x3b8c2a,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  for (let f = 0; f < 7; f++) {
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.7, 5), frondMat);
    frond.scale.set(1, 1, 0.15);
    frond.rotation.z = -1.2;
    frond.position.x = 1.2;
    const pivot = new THREE.Group();
    pivot.rotation.y = (f / 7) * Math.PI * 2;
    pivot.add(frond);
    crown.add(pivot);
  }

  palm.add(crown);
  palm.rotation.y = rotY;
  return { group: palm, crown };
}

export function createWeatherParticlesAtom(
  theme: IslandTheme,
  targetGroup: THREE.Group,
): WeatherParticleAtom[] {
  const color =
    theme.weather === 'snow'
      ? 0xffffff
      : theme.weather === 'petal'
        ? 0xf9a8d4
        : theme.weather === 'ember'
          ? 0xfb923c
          : theme.weather === 'star'
            ? 0x38bdf8
            : 0xfef08a;
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const geo =
    theme.weather === 'petal'
      ? new THREE.PlaneGeometry(0.22, 0.14)
      : new THREE.OctahedronGeometry(0.11, 0);

  const items: WeatherParticleAtom[] = [];
  for (let i = 0; i < 60; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 50,
      1 + Math.random() * 16,
      (Math.random() - 0.5) * 50,
    );
    targetGroup.add(mesh);
    items.push({
      mesh,
      vy: theme.weather === 'ember' ? 1.2 + Math.random() : -(0.8 + Math.random() * 1.4),
      vx: (Math.random() - 0.5) * 0.9,
      phase: Math.random() * 6,
    });
  }
  return items;
}
