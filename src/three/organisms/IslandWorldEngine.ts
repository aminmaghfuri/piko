import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ISLAND_THEMES } from '../../design/tokens';
import {
  CharacterPresetId,
  CompassReadout,
  CrystalChallenge,
  HatId,
  ObstacleCircle,
} from '../../types/game';
import {
  ButterflyAnimAtom,
  createCloudClusterAtom,
  createMonumentAtom,
  createOceanAtom,
  createPalmTreeAtom,
  createPierAtom,
  createSailboatAtom,
  createSkyDomeAtom,
  createTreeAtom,
  createWeatherParticlesAtom,
  SkyDomeAtom,
  WeatherParticleAtom,
} from '../atoms/BackgroundElements';
import { getGroundLevel, getTerrainHeight, perturbOrganicGeometry, smoothstep } from '../atoms/terrainMath';
import { createProceduralNoiseTexture } from '../atoms/textures';
import {
  CoinEntity,
  createCoinEntities,
  createCrystalEntities,
  CrystalEntity,
  ParticleBurstSystem,
} from './CollectibleSprites';
import { PhysicsCompanionSprite } from './PhysicsCompanionSprite';
import { MovementInputState, PhysicsPlayerSprite } from './PhysicsPlayerSprite';

export interface WorldCallbacks {
  onCoinCollected: () => void;
  onJump: () => void;
  onCrystalReached: (challenge: CrystalChallenge) => void;
  onCompassUpdate: (readout: CompassReadout) => void;
  onContextLost: (lost: boolean) => void;
}

const TREE_SPOTS: [number, number][] = [
  [-9, -9],
  [11, -8],
  [-14, 7],
  [13, 11],
  [-19, -12],
  [19, -11],
  [-17, 15],
  [18, 15],
  [6, -19],
  [-7, 19],
  [21, 2],
  [-21, -2],
  [9, 18],
  [-12, -18],
];

const PALM_SPOTS: [number, number, number][] = [
  [23, 12, 0.5],
  [-22, 13, 2.4],
  [24, -10, -0.4],
  [-23, -12, 3.6],
  [11, 23, 1.1],
  [-12, 23, 2.0],
];

const ROCK_SPOTS: [number, number][] = [
  [7, -14],
  [-8, 12],
  [16, -4],
  [-16, -6],
  [6, 15],
  [-20, 4],
];

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

// Pre-allocated color helpers (Zero-GC outside tick loop)
const _cDS = new THREE.Color();
const _cS = new THREE.Color();
const _cL = new THREE.Color();
const _cH = new THREE.Color();
const _cP = new THREE.Color();
const _cTmp = new THREE.Color();

export class IslandWorldEngine {
  private readonly container: HTMLElement;
  private readonly callbacks: WorldCallbacks;
  private readonly isSoftwareGl: boolean;
  private readonly isMobile: boolean;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private clock = new THREE.Clock();

  private skyDome!: SkyDomeAtom;
  private ocean!: ReturnType<typeof createOceanAtom>;
  private waterNormal!: THREE.CanvasTexture;
  private terrainBump!: THREE.CanvasTexture;
  private woodMat!: THREE.MeshStandardMaterial;
  private darkWoodMat!: THREE.MeshStandardMaterial;
  private stoneMat!: THREE.MeshStandardMaterial;
  private barkMat!: THREE.MeshStandardMaterial;

  private islandGroup = new THREE.Group();
  private ambientGroup = new THREE.Group();
  private boat!: THREE.Group;
  private clouds: { group: THREE.Group; speed: number }[] = [];
  private palms: THREE.Group[] = [];
  private butterflies: ButterflyAnimAtom[] = [];
  private weatherParticles: WeatherParticleAtom[] = [];
  private crystals: CrystalEntity[] = [];
  private coins: CoinEntity[] = [];
  private obstacles: ObstacleCircle[] = [];
  private bursts = new ParticleBurstSystem();

  private player!: PhysicsPlayerSprite;
  private piko!: PhysicsCompanionSprite;

  // Simulation state
  public running = false;
  public paused = false;
  public hasTurbo = false;
  private islandId = 1;
  private centerY = 2.8;
  private readonly deckY = 1.05;
  private hasPier = true;

  // Camera orbit state
  private camAngle = 0;
  private camPitch = 0.44;
  private camDistance = 11.5;
  private activePointerId: number | null = null;
  private prevPointerX = 0;
  private prevPointerY = 0;

  // Input state
  public input: MovementInputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
    rotateLeft: false,
    rotateRight: false,
    sprint: false,
    joyActive: false,
    joyX: 0,
    joyY: 0,
  };

  private frameId = 0;
  private disposed = false;
  private lastCompassText = '';
  private lastCompassDeg = -999;

  constructor(
    container: HTMLElement,
    callbacks: WorldCallbacks,
    initialCharacter: CharacterPresetId,
    initialColor: string,
    initialHat: HatId,
    initialCape: boolean,
    initialTurbo: boolean,
    initialIsland: number,
    initialGrade: number,
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();
    this.isMobile =
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 900;
    this.hasTurbo = initialTurbo;
    this.islandId = initialIsland;

    this.initScene(initialCharacter, initialColor, initialHat, initialCape, initialIsland, initialGrade);
    this.attachEvents();
    this.startLoop();
  }

  private initScene(
    character: CharacterPresetId,
    color: string,
    hat: HatId,
    cape: boolean,
    islandId: number,
    grade: number,
  ): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7dd3fc);
    this.scene.fog = new THREE.FogExp2(0x9bd7f5, 0.0075);

    this.camera = new THREE.PerspectiveCamera(
      52,
      this.container.clientWidth / Math.max(1, this.container.clientHeight),
      0.2,
      320,
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && !this.isMobile,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2),
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Studio environment reflection for metallic crowns, coins, and clearcoat crystals
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRT = pmrem.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRT.texture;
    roomEnv.dispose();
    pmrem.dispose();

    // Lighting rig
    const sunDir = new THREE.Vector3(45, 38, -32).normalize();
    this.skyDome = createSkyDomeAtom(sunDir);
    this.scene.add(this.skyDome.mesh);

    this.scene.add(new THREE.HemisphereLight(0xbbe6ff, 0x3b6e38, 0.65));
    const sunLight = new THREE.DirectionalLight(0xfff5db, 1.65);
    sunLight.position.copy(sunDir).multiplyScalar(65);
    sunLight.castShadow = !this.isSoftwareGl;
    const shadowSize = this.isMobile ? 1024 : 2048;
    sunLight.shadow.mapSize.set(shadowSize, shadowSize);
    sunLight.shadow.camera.left = -42;
    sunLight.shadow.camera.bottom = -42;
    sunLight.shadow.camera.right = 42;
    sunLight.shadow.camera.top = 42;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.terrainBump = createProceduralNoiseTexture(256, 128, 128, 128, 55, 1, 1, 18, false, maxAniso);
    this.waterNormal = createProceduralNoiseTexture(128, 128, 128, 240, 40, 2, 2, 16, false, maxAniso);

    this.woodMat = new THREE.MeshStandardMaterial({
      map: createProceduralNoiseTexture(128, 139, 90, 43, 30, 0.2, 3, 2, true, maxAniso),
      roughness: 0.85,
    });
    this.darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x54361b, roughness: 0.92 });
    this.stoneMat = new THREE.MeshStandardMaterial({
      map: createProceduralNoiseTexture(128, 155, 155, 150, 35, 1, 1, 2, true, maxAniso),
      roughness: 0.88,
    });
    this.barkMat = new THREE.MeshStandardMaterial({
      map: createProceduralNoiseTexture(128, 102, 68, 42, 35, 3, 0.3, 2, true, maxAniso),
      roughness: 0.95,
    });

    this.ocean = createOceanAtom(this.waterNormal, this.isMobile || this.isSoftwareGl);
    this.scene.add(this.ocean.mesh);

    this.boat = createSailboatAtom(this.woodMat, this.darkWoodMat);
    this.scene.add(this.boat);

    for (let i = 0; i < 8; i++) {
      const cloud = createCloudClusterAtom();
      this.scene.add(cloud.group);
      this.clouds.push(cloud);
    }

    this.scene.add(this.islandGroup, this.ambientGroup);

    this.player = new PhysicsPlayerSprite(color, this.darkWoodMat);
    this.player.syncAppearance(character, color, hat, cape);
    this.scene.add(this.player.rig.root);

    this.piko = new PhysicsCompanionSprite();
    this.scene.add(this.piko.rig.root);

    this.buildIsland(islandId, grade);
    this.player.resetAt(0, this.centerY + 0.36, 0);
    this.piko.resetAt(-1.3, this.centerY + 2.5, -0.5);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  public syncPlayerStyle(
    character: CharacterPresetId,
    color: string,
    hat: HatId,
    hasCape: boolean,
    hasTurbo: boolean,
  ): void {
    this.hasTurbo = hasTurbo;
    this.player.syncAppearance(character, color, hat, hasCape);
  }

  public triggerCelebration(origin?: THREE.Vector3, burstColor = 0x38bdf8): void {
    this.piko.triggerSpin(1.3);
    this.bursts.emit(this.scene, origin || this.piko.position, burstColor);
  }

  public completeCrystal(crystalIndex: number): void {
    const cr = this.crystals.find((c) => c.index === crystalIndex);
    if (!cr || cr.collected) return;
    cr.collected = true;
    this.piko.triggerSpin(1.4);
    this.bursts.emit(this.scene, cr.group.position, 0xfacc15);
    this.islandGroup.remove(cr.group);
  }

  public advanceCrystalQuestion(crystalIndex: number): void {
    const cr = this.crystals.find((c) => c.index === crystalIndex);
    if (cr) cr.questionIndex++;
  }

  public setCrystalCooldown(crystalIndex: number, value: boolean): void {
    const cr = this.crystals.find((c) => c.index === crystalIndex);
    if (cr) cr.cooldown = value;
  }

  public buildIsland(islandId: number, grade: number): void {
    this.islandId = islandId;
    const theme = ISLAND_THEMES[islandId - 1] || ISLAND_THEMES[0];
    this.hasPier = theme.hasPier;

    while (this.islandGroup.children.length > 0) {
      this.islandGroup.remove(this.islandGroup.children[0]);
    }
    while (this.ambientGroup.children.length > 0) {
      this.ambientGroup.remove(this.ambientGroup.children[0]);
    }
    this.bursts.clear(this.scene);

    this.obstacles = [];
    this.crystals = [];
    this.coins = [];
    this.butterflies = [];
    this.palms = [];
    this.weatherParticles = [];

    this.skyDome.material.uniforms.uT.value.setHex(theme.skyTop);
    this.skyDome.material.uniforms.uM.value.setHex(theme.skyMid);
    this.skyDome.material.uniforms.uH.value.setHex(theme.skyHorizon);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(theme.fog);
    }
    this.ocean.material.color.setHex(theme.water);

    const segs = this.isMobile ? 72 : 108;
    const terrainGeo = new THREE.PlaneGeometry(86, 86, segs, segs);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    _cDS.setHex(theme.deepSand);
    _cS.setHex(theme.sand);
    _cL.setHex(theme.grassLow);
    _cH.setHex(theme.grassHigh);
    _cP.setHex(theme.path);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z, islandId);
      pos.setY(i, y);

      if (y < 0.05) {
        _cTmp.copy(_cDS).lerp(_cS, smoothstep(-0.8, 0.05, y));
      } else if (y < 0.85) {
        _cTmp.copy(_cS).lerp(_cL, smoothstep(0.35, 0.85, y));
      } else {
        _cTmp.copy(_cL).lerp(_cH, smoothstep(1.2, 3.2, y));
      }

      const pathDist = Math.abs(x - Math.sin(z * 0.15) * 1.4);
      if (z > 4 && z < 26 && pathDist < 2.1) {
        _cTmp.lerp(_cP, (1 - smoothstep(0.6, 2.1, pathDist)) * 0.72);
      }

      colors[i * 3] = _cTmp.r;
      colors[i * 3 + 1] = _cTmp.g;
      colors[i * 3 + 2] = _cTmp.b;
    }

    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMesh = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        bumpMap: this.terrainBump,
        bumpScale: 0.08,
      }),
    );
    terrainMesh.receiveShadow = true;
    this.islandGroup.add(terrainMesh);

    this.centerY = getTerrainHeight(0, 0, islandId);
    this.islandGroup.add(createMonumentAtom(theme, this.centerY, this.stoneMat, this.obstacles));

    if (theme.hasPier) {
      this.islandGroup.add(createPierAtom(this.deckY, this.woodMat, this.darkWoodMat));
    }

    TREE_SPOTS.forEach(([tx, tz], idx) => {
      const tree = createTreeAtom(theme, tx, tz, idx, this.barkMat, this.stoneMat);
      if (tree) {
        this.islandGroup.add(tree.group);
        this.obstacles.push({ x: tx, z: tz, r: tree.radius });
      }
    });

    if (theme.hasPalms) {
      PALM_SPOTS.forEach(([px, pz, rotY]) => {
        const palm = createPalmTreeAtom(islandId, px, pz, rotY, this.barkMat);
        this.islandGroup.add(palm.group);
        this.palms.push(palm.crown);
        this.obstacles.push({ x: px, z: pz, r: 0.55 });
      });
    }

    ROCK_SPOTS.forEach(([rx, rz]) => {
      const scale = 0.75 + Math.random() * 0.55;
      const y = getTerrainHeight(rx, rz, islandId);
      const rockMat =
        theme.treeType === 'snow'
          ? new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, roughness: 0.2, clearcoat: 0.8 })
          : this.stoneMat;
      const rock = new THREE.Mesh(
        perturbOrganicGeometry(new THREE.IcosahedronGeometry(scale, 1), 0.22),
        rockMat,
      );
      rock.position.set(rx, y + scale * 0.35, rz);
      rock.castShadow = true;
      this.islandGroup.add(rock);
      this.obstacles.push({ x: rx, z: rz, r: scale * 0.88 });
    });

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
    for (let fi = 0; fi < 28; fi++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 18;
      const fx = Math.cos(angle) * radius;
      const fz = Math.sin(angle) * radius;
      const fy = getTerrainHeight(fx, fz, islandId);
      if (fy <= 0.9) continue;

      const flowerGroup = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 5), stemMat);
      stem.position.y = 0.17;
      const petal = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.16, 0),
        new THREE.MeshStandardMaterial({ color: theme.flowerColors[fi % 4], roughness: 0.75 }),
      );
      petal.position.y = 0.36;
      flowerGroup.add(stem, petal);
      flowerGroup.position.set(fx, fy, fz);
      this.islandGroup.add(flowerGroup);

      if (fi % 3 === 0) {
        const bfGroup = new THREE.Group();
        const wingMat = new THREE.MeshBasicMaterial({
          color: theme.flowerColors[(fi + 1) % 4],
          side: THREE.DoubleSide,
        });
        const wingGeo = new THREE.PlaneGeometry(0.22, 0.16);
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.x = -0.11;
        const rightWing = leftWing.clone();
        rightWing.position.x = 0.11;
        bfGroup.add(leftWing, rightWing);
        bfGroup.position.set(fx, fy + 0.9, fz);
        this.islandGroup.add(bfGroup);
        this.butterflies.push({
          group: bfGroup,
          leftWing,
          rightWing,
          cx: fx,
          cz: fz,
          baseY: fy + 1,
          phase: Math.random() * 10,
        });
      }
    }

    this.weatherParticles = createWeatherParticlesAtom(theme, this.ambientGroup);
    this.crystals = createCrystalEntities(islandId, grade, this.stoneMat, this.islandGroup);
    this.coins = createCoinEntities(islandId, theme.hasPier, this.deckY, this.islandGroup);
  }

  public startIsland(islandId: number, grade: number): void {
    this.buildIsland(islandId, grade);
    const startY = getGroundLevel(0, 0, islandId, this.centerY, this.deckY, this.hasPier) + 0.1;
    this.player.resetAt(0, startY, 0);
    this.piko.resetAt(-1.3, startY + 2.3, -0.5);
    this.camAngle = 0;
    this.running = true;
    this.paused = false;
  }

  public clearMovementInput(): void {
    this.input.up = false;
    this.input.down = false;
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    this.input.rotateLeft = false;
    this.input.rotateRight = false;
    this.input.sprint = false;
    this.input.joyActive = false;
    this.input.joyX = 0;
    this.input.joyY = 0;
  }

  private attachEvents(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    dom.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('resize', this.onResize);
    dom.addEventListener('webglcontextlost', this.onContextLost);
    dom.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (this.activePointerId === null) {
      this.activePointerId = e.pointerId;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId || this.paused) return;
    this.camAngle -= (e.clientX - this.prevPointerX) * 0.007;
    this.camPitch = Math.max(
      0.18,
      Math.min(1.05, this.camPitch + (e.clientY - this.prevPointerY) * 0.005),
    );
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerId === this.activePointerId) {
      this.activePointerId = null;
    }
  };

  private onWheel = (e: WheelEvent): void => {
    this.camDistance = Math.max(6.5, Math.min(19, this.camDistance + e.deltaY * 0.01));
  };

  public zoomIn(): void {
    this.camDistance = Math.max(6.5, this.camDistance - 2.0);
  }

  public zoomOut(): void {
    this.camDistance = Math.min(19, this.camDistance + 2.0);
  }

  private onResize = (): void => {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2),
    );
  };

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.callbacks.onContextLost(true);
  };

  private onContextRestored = (): void => {
    this.callbacks.onContextLost(false);
  };

  private startLoop(): void {
    const tick = () => {
      if (this.disposed) return;
      this.stepFrame();
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private stepFrame(): void {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const el = this.clock.getElapsedTime();

    // Ocean waves
    this.waterNormal.offset.x = el * 0.025;
    this.waterNormal.offset.y = el * 0.018;
    const wp = this.ocean.geometry.attributes.position;
    for (let i = 0; i < wp.count; i++) {
      wp.setY(
        i,
        Math.sin(wp.getX(i) * 0.14 + el * 1.8) * 0.13 +
          Math.cos(wp.getZ(i) * 0.16 + el * 1.5) * 0.1,
      );
    }
    wp.needsUpdate = true;
    this.ocean.geometry.computeVertexNormals();

    // Boat, palms, clouds, butterflies, crystals, coins
    this.boat.position.y = 0.18 + Math.sin(el * 1.6) * 0.14;
    this.boat.rotation.z = Math.sin(el * 1.3) * 0.06;

    for (let i = 0; i < this.palms.length; i++) {
      this.palms[i].rotation.z = Math.sin(el * 1.7 + i) * 0.05;
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.group.position.x += c.speed * dt;
      if (c.group.position.x > 70) c.group.position.x = -70;
    }
    for (let i = 0; i < this.butterflies.length; i++) {
      const b = this.butterflies[i];
      const t = el * 1.5 + b.phase;
      b.group.position.set(
        b.cx + Math.cos(t) * 1.4,
        b.baseY + Math.sin(t * 3) * 0.25,
        b.cz + Math.sin(t * 1.3) * 1.4,
      );
      b.group.rotation.y = -t;
      const flap = Math.sin(el * 22 + b.phase) * 0.85;
      b.leftWing.rotation.y = flap;
      b.rightWing.rotation.y = -flap;
    }
    for (let i = 0; i < this.crystals.length; i++) {
      const cr = this.crystals[i];
      if (!cr.collected) {
        cr.gem.rotation.y += 1.6 * dt;
        cr.gem.position.y = 2 + Math.sin(el * 2.8 + i) * 0.22;
        const pulseScale = 1 + Math.sin(el * 4 + i) * 0.09;
        cr.ring.scale.set(pulseScale, pulseScale, 1);
      }
    }
    for (let i = 0; i < this.coins.length; i++) {
      if (!this.coins[i].collected) {
        this.coins[i].mesh.rotation.z += 2.6 * dt;
      }
    }

    // Weather particles wrapped around player
    const px = this.player.position.x;
    const pz = this.player.position.z;
    for (let i = 0; i < this.weatherParticles.length; i++) {
      const a = this.weatherParticles[i];
      a.mesh.position.y += a.vy * dt;
      a.mesh.position.x += (a.vx + Math.sin(el + a.phase) * 0.35) * dt;
      a.mesh.rotation.y += dt;
      if (a.mesh.position.y < 0.5) a.mesh.position.y = 12.5;
      else if (a.mesh.position.y > 13.5) a.mesh.position.y = 1.0;
      if (a.mesh.position.x - px > 17) a.mesh.position.x -= 34;
      else if (a.mesh.position.x - px < -17) a.mesh.position.x += 34;
      if (a.mesh.position.z - pz > 17) a.mesh.position.z -= 34;
      else if (a.mesh.position.z - pz < -17) a.mesh.position.z += 34;
    }

    this.bursts.step(this.scene, dt);

    if (this.running && !this.paused) {
      if (this.input.rotateLeft) this.camAngle += 2.1 * dt;
      if (this.input.rotateRight) this.camAngle -= 2.1 * dt;

      this.player.step(
        dt,
        this.input,
        this.camAngle,
        this.hasTurbo,
        this.islandId,
        this.centerY,
        this.deckY,
        this.hasPier,
        this.obstacles,
        this.callbacks.onJump,
      );

      // Coin collisions
      for (let i = 0; i < this.coins.length; i++) {
        const coin = this.coins[i];
        if (
          !coin.collected &&
          Math.hypot(
            this.player.position.x - coin.mesh.position.x,
            this.player.position.z - coin.mesh.position.z,
          ) < 1.35 &&
          Math.abs(this.player.position.y - coin.mesh.position.y) < 1.8
        ) {
          coin.collected = true;
          this.islandGroup.remove(coin.mesh);
          this.bursts.emit(this.scene, coin.mesh.position, 0xfacc15);
          this.callbacks.onCoinCollected();
        }
      }

      // Nearest crystal & trigger check
      let nearestDist = 999;
      let nearestCrystal: CrystalEntity | null = null;
      for (let i = 0; i < this.crystals.length; i++) {
        const cr = this.crystals[i];
        if (!cr.collected) {
          const dist = Math.hypot(
            this.player.position.x - cr.group.position.x,
            this.player.position.z - cr.group.position.z,
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestCrystal = cr;
          }
          if (dist < 2 && !cr.cooldown) {
            this.callbacks.onCrystalReached({
              index: cr.index,
              questions: cr.questions,
              currentIndex: cr.questionIndex,
              collected: cr.collected,
              cooldown: cr.cooldown,
              hidden: cr.hidden,
            });
          } else if (dist > 3 && cr.cooldown) {
            cr.cooldown = false;
          }
        }
      }

      if (nearestCrystal) {
        const vx = nearestCrystal.group.position.x - this.player.position.x;
        const vz = nearestCrystal.group.position.z - this.player.position.z;
        const fwd = -vx * Math.sin(this.camAngle) - vz * Math.cos(this.camAngle);
        const rgt = vx * Math.cos(this.camAngle) - vz * Math.sin(this.camAngle);
        const deg = Math.round(Math.atan2(rgt, fwd) * 57.2958);
        const distRounded = Math.round(nearestDist);
        const text = `${distRounded}m`;
        if (text !== this.lastCompassText || Math.abs(deg - this.lastCompassDeg) >= 2) {
          this.lastCompassText = text;
          this.lastCompassDeg = deg;
          this.callbacks.onCompassUpdate({ angleDeg: deg, distanceMeters: distRounded });
        }
      } else if (this.lastCompassText !== '✓') {
        this.lastCompassText = '✓';
        this.callbacks.onCompassUpdate({ angleDeg: 0, distanceMeters: null });
      }
    } else if (!this.running) {
      // Gentle atmospheric title-screen pan around the live island
      this.camAngle += 0.14 * dt;
    }

    // Companion Piko follow physics
    this.piko.step(dt, el, this.player.position, this.player.rotation.y);

    // Smooth third-person camera damping
    const horizDist = this.camDistance * Math.cos(this.camPitch);
    const vertDist = this.camDistance * Math.sin(this.camPitch) + 1.8;
    const targetCamX = this.player.position.x + Math.sin(this.camAngle) * horizDist;
    const targetCamZ = this.player.position.z + Math.cos(this.camAngle) * horizDist;
    const targetCamY = Math.max(
      getTerrainHeight(targetCamX, targetCamZ, this.islandId) + 1.5,
      this.player.position.y + vertDist,
    );

    const camAlpha = 1 - Math.exp(-7.5 * dt);
    this.camera.position.x += (targetCamX - this.camera.position.x) * camAlpha;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * camAlpha;
    this.camera.position.y += (targetCamY - this.camera.position.y) * camAlpha;
    this.camera.lookAt(
      this.player.position.x,
      this.player.position.y + 1.6,
      this.player.position.z,
    );
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    dom.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);
    dom.removeEventListener('webglcontextlost', this.onContextLost);
    dom.removeEventListener('webglcontextrestored', this.onContextRestored);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.terrainBump.dispose();
    this.waterNormal.dispose();
    this.envRT?.dispose();
    this.renderer.dispose();
    if (dom.parentElement === this.container) {
      this.container.removeChild(dom);
    }
  }
}
