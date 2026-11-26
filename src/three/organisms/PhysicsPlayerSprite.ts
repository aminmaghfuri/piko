import * as THREE from 'three';
import {
  applyCharacterAppearance,
  createCharacterRigAtom,
  PlayerRigParts,
} from '../atoms/CharacterAssets';
import { getGroundLevel } from '../atoms/terrainMath';
import { CharacterPresetId, HatId, ObstacleCircle } from '../../types/game';

export interface MovementInputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
  sprint: boolean;
  joyActive: boolean;
  joyX: number;
  joyY: number;
}

export class PhysicsPlayerSprite {
  public readonly rig: PlayerRigParts;
  public velocityY = 0;
  public grounded = true;
  private walkTime = 0;

  constructor(initialColor: string, darkWoodMat: THREE.MeshStandardMaterial) {
    this.rig = createCharacterRigAtom(initialColor, darkWoodMat);
  }

  public get position(): THREE.Vector3 {
    return this.rig.root.position;
  }

  public get rotation(): THREE.Euler {
    return this.rig.root.rotation;
  }

  public syncAppearance(
    character: CharacterPresetId,
    colorHex: string,
    hat: HatId,
    hasCape: boolean,
  ): void {
    applyCharacterAppearance(this.rig, character, colorHex, hat, hasCape);
  }

  public resetAt(x: number, y: number, z: number): void {
    this.rig.root.position.set(x, y, z);
    this.rig.root.rotation.y = 0;
    this.velocityY = 0;
    this.grounded = true;
    this.walkTime = 0;
  }

  public step(
    dt: number,
    input: MovementInputState,
    cameraAngle: number,
    hasTurbo: boolean,
    islandId: number,
    centerY: number,
    deckY: number,
    hasPier: boolean,
    obstacles: ObstacleCircle[],
    onJump: () => void,
  ): void {
    if (this.rig.propellerGroup.visible) {
      this.rig.propellerBlade.rotation.y += 14 * dt;
    }

    const mx = input.joyActive
      ? input.joyX
      : (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const mz = input.joyActive
      ? input.joyY
      : (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const mag = Math.min(1, Math.hypot(mx, mz));

    if (mag > 0.08) {
      const speed = (hasTurbo ? 13.0 : 9.5) * (input.sprint ? 1.3 : 1.0) * mag;
      const worldAngle = Math.atan2(mx, mz) + cameraAngle;
      const nx = this.rig.root.position.x + Math.sin(worldAngle) * speed * dt;
      const nz = this.rig.root.position.z + Math.cos(worldAngle) * speed * dt;

      const withinIsland = Math.hypot(nx, nz) <= 43.0;
      const onPier = hasPier && Math.abs(nx) < 1.75 && nz >= 22.8 && nz <= 52.0;
      if (withinIsland || onPier) {
        this.rig.root.position.x = nx;
        this.rig.root.position.z = nz;
      }

      let diff = worldAngle - this.rig.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rig.root.rotation.y += diff * Math.min(1, 13 * dt);

      this.walkTime += dt * (speed * 1.3);
      const swing = Math.sin(this.walkTime);
      this.rig.leftLeg.rotation.x = swing * 0.65;
      this.rig.rightLeg.rotation.x = -swing * 0.65;
      this.rig.leftArm.rotation.x = -swing * 0.55;
      this.rig.rightArm.rotation.x = swing * 0.55;
      if (this.rig.capeMesh.visible) {
        this.rig.capeMesh.rotation.x = 0.35 + Math.sin(this.walkTime * 1.5) * 0.14;
      }
    } else {
      const settle = Math.exp(-12 * dt);
      this.rig.leftLeg.rotation.x *= settle;
      this.rig.rightLeg.rotation.x *= settle;
      this.rig.leftArm.rotation.x *= settle;
      this.rig.rightArm.rotation.x *= settle;
      if (this.rig.capeMesh.visible) {
        this.rig.capeMesh.rotation.x = 0.18;
      }
    }

    if (input.jump && this.grounded) {
      this.velocityY = 10.5;
      this.grounded = false;
      onJump();
    }

    const groundY = getGroundLevel(
      this.rig.root.position.x,
      this.rig.root.position.z,
      islandId,
      centerY,
      deckY,
      hasPier,
    );
    this.velocityY -= 26 * dt;
    this.rig.root.position.y += this.velocityY * dt;
    if (this.rig.root.position.y <= groundY) {
      this.rig.root.position.y = groundY;
      this.velocityY = 0;
      this.grounded = true;
    }

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const dx = this.rig.root.position.x - obs.x;
      const dz = this.rig.root.position.z - obs.z;
      const dist = Math.hypot(dx, dz);
      const minDist = obs.r + 0.52;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / dist;
        this.rig.root.position.x += dx * push;
        this.rig.root.position.z += dz * push;
      }
    }
  }
}
