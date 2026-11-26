import * as THREE from 'three';
import { CharacterPresetId, HatId } from '../../types/game';

export interface PlayerRigParts {
  root: THREE.Group;
  outfitMat: THREE.MeshStandardMaterial;
  hijabMat: THREE.MeshStandardMaterial;
  skirtMesh: THREE.Mesh;
  hairBoy: THREE.Mesh;
  hairGirl: THREE.Group;
  hijabGroup: THREE.Group;
  peciMesh: THREE.Mesh;
  capGroup: THREE.Group;
  crownGroup: THREE.Group;
  propellerGroup: THREE.Group;
  propellerBlade: THREE.Mesh;
  capeMesh: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
}

export interface PikoRigParts {
  root: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
}

function createLimbAtom(
  isArm: boolean,
  outfitMat: THREE.MeshStandardMaterial,
  bootMat: THREE.MeshStandardMaterial,
): THREE.Group {
  const pivot = new THREE.Group();
  if (isArm) {
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.1, 0.68, 10),
      outfitMat,
    );
    sleeve.position.y = -0.3;
    sleeve.castShadow = true;
    pivot.add(sleeve);
  } else {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.12, 0.56, 10),
      new THREE.MeshStandardMaterial({ color: 0x264673, roughness: 0.78 }),
    );
    leg.position.y = -0.26;
    leg.castShadow = true;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.34), bootMat);
    boot.position.set(0, -0.58, 0.05);
    boot.castShadow = true;
    pivot.add(leg, boot);
  }
  return pivot;
}

export function createCharacterRigAtom(
  initialColor: string,
  darkWoodMat: THREE.MeshStandardMaterial,
): PlayerRigParts {
  const root = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.72 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.9 });
  const outfitMat = new THREE.MeshStandardMaterial({ color: initialColor, roughness: 0.75 });
  const hijabMat = new THREE.MeshStandardMaterial({ color: 0xf9a8d4, roughness: 0.8 });

  // Torso & skirt atoms
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.42, 0.95, 14),
    outfitMat,
  );
  torso.position.y = 1.18;
  torso.castShadow = true;

  const skirtMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.56, 0.64, 16),
    outfitMat,
  );
  skirtMesh.position.y = 0.9;
  skirtMesh.castShadow = true;

  const scarf = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.1, 10, 18),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.65 }),
  );
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 1.65;

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.72, 0.34),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.82 }),
  );
  backpack.position.set(0, 1.22, -0.4);
  backpack.castShadow = true;

  // Head & Eyes atom
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), skinMat);
  head.position.y = 2.06;
  head.castShadow = true;

  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  [-0.16, 0.16].forEach((ex) => {
    const ew = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeWhiteMat);
    ew.position.set(ex, 2.09, 0.36);
    const ep = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyePupilMat);
    ep.position.set(ex, 2.09, 0.41);
    root.add(ew, ep);
  });

  // Hair & Hijab & Peci atoms
  const hairBoy = new THREE.Mesh(
    new THREE.SphereGeometry(0.435, 14, 12, 0, Math.PI * 2, 0, 1.85),
    hairMat,
  );
  hairBoy.position.set(0, 2.09, -0.02);
  hairBoy.rotation.x = -0.35;

  const hairGirl = new THREE.Group();
  const hgTop = hairBoy.clone();
  const bunL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), hairMat);
  bunL.position.set(-0.46, 2.04, -0.1);
  const bunR = bunL.clone();
  bunR.position.x = 0.46;
  const tieMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5 });
  const tieL = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 6, 12), tieMat);
  tieL.position.set(-0.41, 2.05, -0.08);
  tieL.rotation.y = Math.PI / 2;
  const tieR = tieL.clone();
  tieR.position.x = 0.41;
  hairGirl.add(hgTop, bunL, bunR, tieL, tieR);

  const hijabGroup = new THREE.Group();
  const hHood = new THREE.Mesh(new THREE.SphereGeometry(0.455, 18, 14), hijabMat);
  hHood.position.set(0, 2.08, -0.06);
  hHood.castShadow = true;
  const hRim = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.065, 10, 20), hijabMat);
  hRim.position.set(0, 2.06, 0.16);
  const hDrape = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.56, 0.58, 16), hijabMat);
  hDrape.position.set(0, 1.62, -0.02);
  hDrape.castShadow = true;
  hijabGroup.add(hHood, hRim, hDrape);

  const peciMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.37, 0.39, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 }),
  );
  peciMesh.position.y = 2.47;
  peciMesh.castShadow = true;

  // Headwear & Cape shop accessory atoms
  const capGroup = new THREE.Group();
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1d68b8, roughness: 0.68 });
  const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.68, 0.07, 16), capMat);
  capBrim.position.y = 2.38;
  const capDome = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.34, 16), capMat);
  capDome.position.y = 2.55;
  capGroup.add(capBrim, capDome);

  const crownGroup = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.9,
    roughness: 0.16,
  });
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.38, 0.2, 12), goldMat);
  crownBase.position.y = 2.52;
  crownGroup.add(crownBase);
  for (let k = 0; k < 4; k++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 6), goldMat);
    const angle = (k / 4) * Math.PI * 2;
    spike.position.set(Math.cos(angle) * 0.26, 2.72, Math.sin(angle) * 0.26);
    crownGroup.add(spike);
  }

  const propellerGroup = new THREE.Group();
  const propCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }),
  );
  propCap.position.y = 2.35;
  const propellerBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.05, 0.14),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.4, roughness: 0.3 }),
  );
  propellerBlade.position.y = 2.86;
  propellerGroup.add(propCap, propellerBlade);

  const capeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.05, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.78 }),
  );
  capeMesh.position.set(0, 1.15, -0.58);
  capeMesh.rotation.x = 0.22;
  capeMesh.castShadow = true;

  // Limbs
  const leftArm = createLimbAtom(true, outfitMat, darkWoodMat);
  leftArm.position.set(-0.48, 1.56, 0);
  const rightArm = createLimbAtom(true, outfitMat, darkWoodMat);
  rightArm.position.set(0.48, 1.56, 0);
  const leftLeg = createLimbAtom(false, outfitMat, darkWoodMat);
  leftLeg.position.set(-0.2, 0.7, 0);
  const rightLeg = createLimbAtom(false, outfitMat, darkWoodMat);
  rightLeg.position.set(0.2, 0.7, 0);

  root.add(
    torso,
    skirtMesh,
    scarf,
    backpack,
    head,
    hairBoy,
    hairGirl,
    hijabGroup,
    peciMesh,
    capGroup,
    crownGroup,
    propellerGroup,
    capeMesh,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  );

  return {
    root,
    outfitMat,
    hijabMat,
    skirtMesh,
    hairBoy,
    hairGirl,
    hijabGroup,
    peciMesh,
    capGroup,
    crownGroup,
    propellerGroup,
    propellerBlade,
    capeMesh,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  };
}

const _whiteColor = new THREE.Color(0xffffff);

export function applyCharacterAppearance(
  rig: PlayerRigParts,
  character: CharacterPresetId,
  colorHex: string,
  hat: HatId,
  hasCape: boolean,
): void {
  rig.outfitMat.color.set(colorHex || '#d93838');
  rig.hijabMat.color.set(colorHex || '#ec4899').lerp(_whiteColor, 0.28);

  rig.hairBoy.visible = character === 'boy' || character === 'peci';
  rig.hairGirl.visible = character === 'girl';
  rig.hijabGroup.visible = character === 'hijab';
  rig.peciMesh.visible = character === 'peci' && hat === 'cap';
  rig.skirtMesh.visible = character === 'girl' || character === 'hijab';

  rig.capGroup.visible = hat === 'cap' && (character === 'boy' || character === 'girl');
  rig.crownGroup.visible = hat === 'crown';
  rig.propellerGroup.visible = hat === 'prop';
  rig.capeMesh.visible = hasCape;
}

export function createPikoDroneAtom(): PikoRigParts {
  const root = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 14),
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.25,
      roughness: 0.15,
      clearcoat: 1,
    }),
  );
  body.castShadow = true;

  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.24, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.6 }),
  );
  visor.position.set(0, 0.04, 0.3);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), eyeMat);
  eyeLeft.position.set(-0.12, 0.04, 0.38);
  const eyeRight = eyeLeft.clone();
  eyeRight.position.x = 0.12;

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.45,
    roughness: 0.35,
  });
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.06), wingMat);
  leftWing.position.set(-0.46, 0.02, -0.05);
  const rightWing = leftWing.clone();
  rightWing.position.x = 0.46;

  root.add(body, visor, eyeLeft, eyeRight, leftWing, rightWing);
  return { root, leftWing, rightWing };
}
