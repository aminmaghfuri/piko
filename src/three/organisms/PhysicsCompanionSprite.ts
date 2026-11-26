import * as THREE from 'three';
import { createPikoDroneAtom, PikoRigParts } from '../atoms/CharacterAssets';

export class PhysicsCompanionSprite {
  public readonly rig: PikoRigParts;
  private spinTimer = 0;

  constructor() {
    this.rig = createPikoDroneAtom();
  }

  public get position(): THREE.Vector3 {
    return this.rig.root.position;
  }

  public triggerSpin(duration = 1.3): void {
    this.spinTimer = duration;
  }

  public resetAt(x: number, y: number, z: number): void {
    this.rig.root.position.set(x, y, z);
    this.spinTimer = 0;
  }

  public step(
    dt: number,
    elapsed: number,
    playerPos: THREE.Vector3,
    playerRotY: number,
  ): void {
    const offsetAngle = playerRotY - 2.13;
    const targetX = playerPos.x + Math.sin(offsetAngle) * 1.45;
    const targetZ = playerPos.z + Math.cos(offsetAngle) * 1.45;
    const targetY = playerPos.y + 2.35 + Math.sin(elapsed * 3.2) * 0.2;

    const followAlpha = 1 - Math.exp(-5.5 * dt);
    const verticalAlpha = 1 - Math.exp(-6.5 * dt);

    this.rig.root.position.x += (targetX - this.rig.root.position.x) * followAlpha;
    this.rig.root.position.z += (targetZ - this.rig.root.position.z) * followAlpha;
    this.rig.root.position.y += (targetY - this.rig.root.position.y) * verticalAlpha;

    if (this.spinTimer > 0) {
      this.spinTimer -= dt;
      this.rig.root.rotation.y += 12 * dt;
    } else {
      let diff = playerRotY - this.rig.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rig.root.rotation.y += diff * (1 - Math.exp(-6 * dt));
    }

    this.rig.leftWing.rotation.z = 0.25 + Math.sin(elapsed * 8) * 0.15;
    this.rig.rightWing.rotation.z = -0.25 - Math.sin(elapsed * 8) * 0.15;
  }
}
