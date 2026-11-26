import * as THREE from 'three';
import { CRYSTAL_COLORS, CRYSTAL_SPOTS } from '../../design/tokens';
import { generateCrystalQuestions } from '../../systems/quizEngine';
import { QuizQuestion } from '../../types/game';
import { getTerrainHeight } from '../atoms/terrainMath';

export interface CrystalEntity {
  index: number;
  group: THREE.Group;
  gem: THREE.Mesh;
  ring: THREE.Mesh;
  hidden: boolean;
  questions: QuizQuestion[];
  questionIndex: number;
  collected: boolean;
  cooldown: boolean;
}

export interface CoinEntity {
  mesh: THREE.Mesh;
  collected: boolean;
}

interface BurstParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
}

export class ParticleBurstSystem {
  private particles: BurstParticle[] = [];
  private readonly sharedGeo = new THREE.OctahedronGeometry(0.18, 0);

  public emit(scene: THREE.Scene, origin: THREE.Vector3, colorHex: number): void {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(this.sharedGeo, mat);
      mesh.position.copy(origin);
      mesh.position.y += 1.5;
      scene.add(mesh);
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 11,
          4.5 + Math.random() * 6,
          (Math.random() - 0.5) * 11,
        ),
        life: 1,
      });
    }
  }

  public step(scene: THREE.Scene, dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vel.y -= 18 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.life -= dt * 1.25;
      p.mesh.scale.setScalar(Math.max(p.life, 0.01));
      if (p.life <= 0) {
        scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  public clear(scene: THREE.Scene): void {
    for (const p of this.particles) {
      scene.remove(p.mesh);
    }
    this.particles = [];
  }
}

export function createCrystalEntities(
  islandId: number,
  grade: number,
  stoneMat: THREE.MeshStandardMaterial,
  targetGroup: THREE.Group,
): CrystalEntity[] {
  const entities: CrystalEntity[] = [];
  CRYSTAL_SPOTS.forEach((spot, idx) => {
    const { x, z, hidden } = spot;
    const y = getTerrainHeight(x, z, islandId);
    const group = new THREE.Group();
    const color = CRYSTAL_COLORS[(idx + islandId) % CRYSTAL_COLORS.length];

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.05, 0.75, 12),
      stoneMat,
    );
    pedestal.position.y = 0.35;
    pedestal.castShadow = true;

    const gemColor = hidden ? 0x9333ea : color;
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(hidden ? 0.75 : 0.85, 0),
      new THREE.MeshPhysicalMaterial({
        color: gemColor,
        emissive: gemColor,
        emissiveIntensity: hidden ? 0.8 : 0.45,
        roughness: 0.08,
        clearcoat: 1,
      }),
    );
    gem.scale.set(0.85, 1.35, 0.85);
    gem.position.y = hidden ? 1.6 : 2;
    gem.castShadow = true;

    // If hidden, add concealing decorative foliage/bushes around it
    if (hidden) {
      const bushGeo = new THREE.SphereGeometry(0.85, 8, 8);
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
      for (let b = 0; b < 3; b++) {
        const bush = new THREE.Mesh(bushGeo, bushMat);
        const angle = (b / 3) * Math.PI * 2;
        bush.position.set(Math.cos(angle) * 1.2, 0.45, Math.sin(angle) * 1.2);
        bush.castShadow = true;
        group.add(bush);
      }
    }

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.85, 18, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: gemColor,
        transparent: true,
        opacity: hidden ? 0.22 : 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    beam.position.y = 9.5;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.48, 28),
      new THREE.MeshBasicMaterial({
        color: gemColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;

    group.add(pedestal, gem, beam, ring);
    group.position.set(x, y, z);
    targetGroup.add(group);

    entities.push({
      index: idx,
      group,
      gem,
      ring,
      hidden,
      questions: generateCrystalQuestions(grade),
      questionIndex: 0,
      collected: false,
      cooldown: false,
    });
  });

  return entities;
}

export function createCoinEntities(
  islandId: number,
  hasPier: boolean,
  deckY: number,
  targetGroup: THREE.Group,
): CoinEntity[] {
  const spots: [number, number, number][] = [];
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const radius = 7 + (i % 3) * 5.8;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    spots.push([cx, getTerrainHeight(cx, cz, islandId) + 1.05, cz]);
  }
  if (hasPier) {
    [26, 30, 34].forEach((pz) => spots.push([0, deckY + 1.05, pz]));
  }

  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0x9a6b00,
    emissiveIntensity: 0.25,
    metalness: 0.88,
    roughness: 0.18,
  });
  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 18);

  return spots.map(([x, y, z]) => {
    const mesh = new THREE.Mesh(coinGeo, coinMat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    targetGroup.add(mesh);
    return { mesh, collected: false };
  });
}
