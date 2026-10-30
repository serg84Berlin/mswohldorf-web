/**
 * 3D-Hero: Wasser in Echtzeit (Gerstner-Wellen im eigenen Shader), Himmel mit
 * tiefer Sonne, Hafensilhouette im Dunst — und die echte MS Wohldorf als
 * freigestellte Bildebene (2.5D), die sanft auf den Wellen schaukelt.
 *
 * Wird erst nach dem ersten Zeichnen und nur auf fähigen Geräten geladen
 * (siehe start.ts). Alle Farben sind Anzeige-Farben (sRGB), ohne Tonemapping.
 */
import {
  BackSide,
  CanvasTexture,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

export interface SzenenSteuerung {
  /** Fortschritt des Scrollens durch den Hero, 0…1. */
  setzeScroll(p: number): void;
  /** Zeiger/Neigung, je -1…1. */
  setzeZeiger(x: number, y: number): void;
  starte(): void;
  halte(): void;
  entsorge(): void;
}

interface Optionen {
  schiffUrl: string;
  /** Feste Zeit, kein Laufen (für das Standbild/Poster). */
  standbild?: number;
  beiErstemBild?: () => void;
  beiFehler?: () => void;
}

const SONNE = new Vector3(0.32, 0.075, -1).normalize();

// Gerstner-Wellen: Richtung (x, z), Steilheit, Wellenlänge (m)
const WELLEN = [
  [1.0, 0.35, 0.16, 11.0],
  [0.7, -0.6, 0.14, 6.3],
  [-0.25, 1.0, 0.12, 3.9],
  [0.9, 0.95, 0.09, 2.3],
  [-0.8, 0.4, 0.07, 1.45],
];

const gemeinsamGlsl = /* glsl */ `
  uniform vec3 uSonne;
  uniform vec3 uHorizont;
  uniform vec3 uDunst;
  uniform vec3 uHoehe;
  uniform vec3 uZenit;
  uniform vec3 uSonnenFarbe;
  vec3 himmel(vec3 r) {
    float h = clamp(r.y, 0.0, 1.0);
    vec3 c = mix(uHorizont, uDunst, smoothstep(0.0, 0.07, h));
    c = mix(c, uHoehe, smoothstep(0.05, 0.28, h));
    c = mix(c, uZenit, smoothstep(0.25, 0.85, h));
    float s = max(dot(normalize(r), uSonne), 0.0);
    c += uSonnenFarbe * (pow(s, 900.0) * 3.0 + pow(s, 40.0) * 0.32 + pow(s, 6.0) * 0.1);
    return c;
  }
`;

const wasserVertex = /* glsl */ `
  uniform float uZeit;
  uniform vec4 uWellen[5];
  varying vec3 vWelt;
  varying vec3 vNormale;
  varying float vHub;

  vec3 gerstner(vec4 w, vec3 p, inout vec3 t, inout vec3 b) {
    float steil = w.z;
    float k = 6.2831853 / w.w;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(w.xy);
    float f = k * (dot(d, p.xz) - c * uZeit);
    float a = steil / k;
    float s = sin(f), co = cos(f);
    t += vec3(-d.x * d.x * steil * s, d.x * steil * co, -d.x * d.y * steil * s);
    b += vec3(-d.x * d.y * steil * s, d.y * steil * co, -d.y * d.y * steil * s);
    return vec3(d.x * a * co, a * s, d.y * a * co);
  }

  void main() {
    vec3 p = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 t = vec3(1.0, 0.0, 0.0);
    vec3 b = vec3(0.0, 0.0, 1.0);
    vec3 v = p;
    for (int i = 0; i < 5; i++) v += gerstner(uWellen[i], p, t, b);
    vNormale = normalize(cross(b, t));
    vWelt = v;
    vHub = v.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(v, 1.0);
  }
`;

const wasserFragment = /* glsl */ `
  uniform float uZeit;
  uniform vec3 uTief;
  uniform vec3 uKamm;
  uniform vec3 uNebel;
  uniform float uNebelDichte;
  uniform vec2 uSchiffA;
  uniform vec2 uSchiffB;
  uniform float uSchiffBreite;
  varying vec3 vWelt;
  varying vec3 vNormale;
  varying float vHub;
  ${gemeinsamGlsl}

  float abstandStrecke(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 q = vWelt.xz;
    float t = uZeit;
    float abstand = length(cameraPosition - vWelt);
    // feine Kräuselung, nur in der Nähe
    vec2 kr = vec2(
      sin(q.x * 3.1 + t * 1.7) * 0.5 + sin(q.x * 7.3 - q.y * 2.1 + t * 2.9) * 0.3 + sin((q.x + q.y) * 13.0 + t * 4.1) * 0.15,
      sin(q.y * 2.7 - t * 1.3) * 0.5 + sin(q.y * 6.1 + q.x * 1.7 - t * 2.3) * 0.3 + sin((q.y - q.x) * 11.0 - t * 3.7) * 0.15
    );
    vec3 n = normalize(vNormale + vec3(kr.x, 0.0, kr.y) * 0.11 * (1.0 - smoothstep(8.0, 80.0, abstand)));

    vec3 v = normalize(cameraPosition - vWelt);
    float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
    vec3 r = reflect(-v, n);
    r.y = abs(r.y);
    vec3 spiegel = himmel(r);
    vec3 koerper = mix(uTief, uKamm, clamp(vHub * 1.1 + 0.25, 0.0, 1.0) * 0.55);
    vec3 farbe = mix(koerper, spiegel, clamp(fresnel * 1.15, 0.0, 1.0));

    // Glitzern der tiefen Sonne (Messing)
    float glanz = pow(max(dot(r, uSonne), 0.0), 260.0);
    float breit = pow(max(dot(r, uSonne), 0.0), 18.0);
    farbe += uSonnenFarbe * (glanz * 2.6 + breit * 0.12);

    // Schatten und dunkle Kante am Rumpf
    float d = abstandStrecke(q, uSchiffA, uSchiffB);
    float schatten = 1.0 - smoothstep(uSchiffBreite * 0.35, uSchiffBreite * 1.4, d);
    farbe *= 1.0 - 0.42 * schatten;

    // Dunst zum Horizont
    float nebel = 1.0 - exp(-pow(abstand * uNebelDichte, 1.5));
    farbe = mix(farbe, uNebel, clamp(nebel, 0.0, 1.0));
    gl_FragColor = vec4(farbe, 1.0);
  }
`;

const himmelVertex = /* glsl */ `
  varying vec3 vRichtung;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vRichtung = w.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const himmelFragment = /* glsl */ `
  uniform float uZeit;
  varying vec3 vRichtung;
  ${gemeinsamGlsl}
  void main() {
    vec3 r = normalize(vRichtung);
    vec3 c = himmel(r);
    // zarte Wolkenbänder
    float band = sin(r.x * 7.0 + uZeit * 0.01) * sin(r.y * 40.0 + r.x * 3.0) * 0.5 + 0.5;
    c = mix(c, c * 1.06 + vec3(0.02, 0.015, 0.0), band * smoothstep(0.02, 0.12, r.y) * (1.0 - smoothstep(0.12, 0.4, r.y)) * 0.6);
    gl_FragColor = vec4(c, 1.0);
  }
`;

const silhouetteFragment = /* glsl */ `
  uniform sampler2D uBild;
  uniform vec3 uNebel;
  uniform vec3 uFarbe;
  varying vec2 vUv;
  void main() {
    vec4 s = texture2D(uBild, vUv);
    if (s.a < 0.02) discard;
    vec3 c = mix(uFarbe, uNebel, 0.62);
    c = mix(c, vec3(1.0, 0.84, 0.6), s.r * 0.75);
    gl_FragColor = vec4(c, s.a * 0.82);
  }
`;

const ebeneVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Wasserlinie des freigestellten Fotos (u → v), aus der Maske abgeleitet.
const schiffFragment = /* glsl */ `
  uniform sampler2D uBild;
  uniform float uZeit;
  uniform vec3 uNebel;
  uniform vec3 uSonnenFarbe;
  varying vec2 vUv;
  float wasserlinie(float u) {
    float v = 0.47;
    v = mix(v, 0.335, smoothstep(0.04, 0.166, u));
    v = mix(v, 0.224, smoothstep(0.166, 0.376, u));
    v = mix(v, 0.155, smoothstep(0.376, 0.532, u));
    v = mix(v, 0.089, smoothstep(0.532, 0.69, u));
    v = mix(v, 0.035, smoothstep(0.69, 0.847, u));
    v = mix(v, 0.011, smoothstep(0.847, 0.921, u));
    return v;
  }
  void main() {
    vec4 s = texture2D(uBild, vUv);
    float linie = wasserlinie(vUv.x) + 0.028 + sin(vUv.x * 38.0 - uZeit * 1.9) * 0.004 + sin(vUv.x * 91.0 + uZeit * 2.7) * 0.0025;
    float tauch = smoothstep(linie - 0.012, linie + 0.01, vUv.y);
    vec3 c = s.rgb;
    // Abendlicht: wärmer, etwas gedämpft, Dunst
    c = c * vec3(1.0, 0.92, 0.8) * 0.84;
    c += uSonnenFarbe * 0.1 * smoothstep(0.35, 1.2, vUv.x * 0.7 + vUv.y * 0.6);
    c = mix(c, uNebel, 0.08);
    // dunkle Spiegelung knapp über der Wasserlinie
    c *= mix(0.7, 1.0, smoothstep(linie, linie + 0.05, vUv.y));
    float a = s.a * tauch;
    if (a < 0.01) discard;
    gl_FragColor = vec4(c, a);
  }
`;

function zufall(saat: number) {
  return () => {
    saat |= 0;
    saat = (saat + 0x6d2b79f5) | 0;
    let t = Math.imul(saat ^ (saat >>> 15), 1 | saat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hafensilhouette: Speicher, Kräne, ein paar Lichter — gezeichnet, nicht geladen. */
function zeichneSilhouette(): HTMLCanvasElement {
  const B = 4096,
    H = 256;
  const c = document.createElement('canvas');
  c.width = B;
  c.height = H;
  const g = c.getContext('2d')!;
  const z = zufall(1959);
  const boden = H - 18;
  g.fillStyle = '#000';
  g.fillRect(0, boden, B, 18);
  // Speicher und Hallen
  for (let x = 0; x < B; ) {
    const w = 40 + z() * 150;
    const h = 8 + z() * 34;
    g.fillRect(x, boden - h, w, h + 1);
    if (z() > 0.55) {
      // Sägezahndach
      const zaehne = Math.max(2, Math.round(w / 18));
      g.beginPath();
      for (let i = 0; i < zaehne; i++) {
        const x0 = x + (i * w) / zaehne;
        g.moveTo(x0, boden - h);
        g.lineTo(x0 + w / zaehne, boden - h - 7);
        g.lineTo(x0 + w / zaehne, boden - h);
      }
      g.fill();
    }
    x += w + (z() > 0.7 ? z() * 120 : 0);
  }
  // Containerbrücken (Kräne)
  g.strokeStyle = '#000';
  g.lineCap = 'square';
  const kraene = [2350, 2520, 2690, 2860, 3120, 3290, 900, 1060];
  for (const kx of kraene) {
    const hoehe = 52 + z() * 26;
    const fuss = 30;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(kx, boden);
    g.lineTo(kx + 6, boden - hoehe);
    g.moveTo(kx + fuss, boden);
    g.lineTo(kx + fuss - 6, boden - hoehe);
    g.stroke();
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(kx - 60, boden - hoehe + 6);
    g.lineTo(kx + fuss + 40, boden - hoehe + 6);
    g.stroke();
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(kx + fuss / 2, boden - hoehe - 26);
    g.lineTo(kx - 58, boden - hoehe + 6);
    g.moveTo(kx + fuss / 2, boden - hoehe - 26);
    g.lineTo(kx + fuss + 38, boden - hoehe + 6);
    g.moveTo(kx + fuss / 2, boden - hoehe - 26);
    g.lineTo(kx + fuss / 2, boden - hoehe + 6);
    g.stroke();
  }
  // Lichter (roter Kanal = Licht, Alpha = Silhouette)
  const daten = g.getImageData(0, 0, B, H);
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(z() * B);
    const y = Math.floor(boden - 2 - z() * 40);
    const idx = (y * B + x) * 4;
    if (daten.data[idx + 3] > 0) {
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]) {
        const j = ((y + dy) * B + x + dx) * 4;
        daten.data[j] = 255;
      }
    }
  }
  g.putImageData(daten, 0, 0);
  return c;
}

export async function erstelleSzene(leinwand: HTMLCanvasElement, opt: Optionen): Promise<SzenenSteuerung> {
  const renderer = new WebGLRenderer({
    canvas: leinwand,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: opt.standbild !== undefined,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x0a1d30, 1);

  const szene = new Scene();
  const kamera = new PerspectiveCamera(42, 1, 0.5, 900);

  const farben = {
    uSonne: { value: SONNE },
    uHorizont: { value: new Vector3(0.86, 0.66, 0.43) },
    uDunst: { value: new Vector3(0.5, 0.47, 0.44) },
    uHoehe: { value: new Vector3(0.15, 0.27, 0.34) },
    uZenit: { value: new Vector3(0.035, 0.1, 0.17) },
    uSonnenFarbe: { value: new Vector3(1.0, 0.82, 0.55) },
  };
  const nebel = new Vector3(0.36, 0.38, 0.39);

  // Himmel
  const himmel = new Mesh(
    new SphereGeometry(600, 32, 16),
    new ShaderMaterial({
      vertexShader: himmelVertex,
      fragmentShader: himmelFragment,
      uniforms: { ...farben, uZeit: { value: 0 } },
      side: BackSide,
      depthWrite: false,
    }),
  );
  himmel.renderOrder = -2;
  szene.add(himmel);

  // Wasser
  const schmal = window.innerWidth < 700;
  const teile = schmal ? 140 : 220;
  const wasserGeo = new PlaneGeometry(460, 460, teile, teile);
  wasserGeo.rotateX(-Math.PI / 2);
  wasserGeo.translate(0, 0, -150);
  const wasserUniforms = {
    ...farben,
    uZeit: { value: 0 },
    uWellen: { value: new Float32Array(WELLEN.flat()) },
    uTief: { value: new Vector3(0.03, 0.11, 0.18) },
    uKamm: { value: new Vector3(0.1, 0.33, 0.4) },
    uNebel: { value: nebel },
    uNebelDichte: { value: 0.0095 },
    uSchiffA: { value: new Vector2() },
    uSchiffB: { value: new Vector2() },
    uSchiffBreite: { value: 1.5 },
  };
  const wasser = new Mesh(
    wasserGeo,
    new ShaderMaterial({ vertexShader: wasserVertex, fragmentShader: wasserFragment, uniforms: wasserUniforms }),
  );
  szene.add(wasser);

  // Hafensilhouette im Dunst
  const silTex = new CanvasTexture(zeichneSilhouette());
  silTex.anisotropy = 4;
  const silhouette = new Mesh(
    new PlaneGeometry(1300, 81.25),
    new ShaderMaterial({
      vertexShader: ebeneVertex,
      fragmentShader: silhouetteFragment,
      uniforms: { uBild: { value: silTex }, uNebel: { value: new Vector3(0.62, 0.56, 0.5) }, uFarbe: { value: new Vector3(0.12, 0.2, 0.25) } },
      transparent: true,
      depthWrite: false,
    }),
  );
  silhouette.position.set(60, 33, -370);
  silhouette.renderOrder = -1;
  szene.add(silhouette);

  // Das Schiff (freigestelltes Foto)
  const bild = new Image();
  bild.decoding = 'async';
  bild.src = opt.schiffUrl;
  await bild.decode();
  const schiffTex = new Texture(bild);
  schiffTex.needsUpdate = true;
  schiffTex.anisotropy = 4;
  const seiten = bild.naturalWidth / bild.naturalHeight;
  const schiffHoehe = 8.6;
  const schiffUniforms = {
    uBild: { value: schiffTex },
    uZeit: { value: 0 },
    uNebel: { value: nebel },
    uSonnenFarbe: farben.uSonnenFarbe,
  };
  const schiff = new Mesh(
    new PlaneGeometry(schiffHoehe * seiten, schiffHoehe),
    new ShaderMaterial({
      vertexShader: ebeneVertex,
      fragmentShader: schiffFragment,
      uniforms: schiffUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  schiff.renderOrder = 5;
  szene.add(schiff);

  // Aufbau je nach Seitenverhältnis: Das Schiff wird über eine Zielposition
  // auf dem Bildschirm (NDC) und einen Abstand zur Kamera platziert — so
  // steht es auf jedem Format neben bzw. unter dem Text.
  const basis = { kx: 0, ky: 7.2, kz: 24, zy: 1.2, sx: 0, sy: 0, sz: 0, massstab: 1 };
  const ziel = new Vector3();
  function anordnen(b: number, h: number) {
    renderer.setSize(b, h, false);
    const a = b / h;
    kamera.aspect = a;
    let ndcX: number, ndcY: number, abstand: number;
    if (a < 0.95) {
      // Hochformat: Text oben, Schiff unten
      Object.assign(basis, { kx: 0, ky: 8.4, kz: 26, zy: 0.6 });
      kamera.fov = 50;
      ndcX = 0.06;
      ndcY = -0.6;
      abstand = 19;
      basis.massstab = Math.max(0.5, Math.min(0.85, a * 1.3));
    } else {
      // Querformat: Text links, Schiff rechts
      const breit = Math.min(1, (a - 0.95) / 0.8);
      Object.assign(basis, { kx: 0, ky: 7.2, kz: 24, zy: 1.2 });
      kamera.fov = 42;
      ndcX = 0.5 - 0.06 * breit;
      ndcY = -0.3 + 0.14 * breit;
      abstand = 21;
      basis.massstab = 0.72 + 0.28 * breit;
    }
    kamera.updateProjectionMatrix();
    kamera.position.set(basis.kx, basis.ky, basis.kz);
    kamera.lookAt(basis.kx * 0.5, basis.zy, 0);
    kamera.updateMatrixWorld();
    ziel.set(ndcX, ndcY, 0.5).unproject(kamera).sub(kamera.position).normalize().multiplyScalar(abstand).add(kamera.position);
    basis.sx = ziel.x;
    basis.sy = ziel.y;
    basis.sz = ziel.z;
    schiff.scale.setScalar(basis.massstab);
  }

  const zustand = { scroll: 0, zx: 0, zy: 0, glattX: 0, glattY: 0 };
  const strahl = new Vector3();
  const punkt = new Vector3();
  function aufWasser(u: number, v: number, ziel: Vector2) {
    // Punkt der Bildebene (u, v) → Strahl von der Kamera → Schnitt mit y = 0
    punkt.set((u - 0.5) * schiffHoehe * seiten, (v - 0.5) * schiffHoehe, 0);
    schiff.localToWorld(punkt); // berücksichtigt auch den Maßstab
    strahl.copy(punkt).sub(kamera.position).normalize();
    const t = strahl.y < -0.001 ? -kamera.position.y / strahl.y : 200;
    ziel.set(kamera.position.x + strahl.x * t, kamera.position.z + strahl.z * t);
  }

  let zeit = 0;
  let letzte = performance.now();
  let laeuft = false;
  let rahmen = 0;
  let ersterRahmen = false;

  function bild_(jetzt: number) {
    const dt = Math.min(0.05, (jetzt - letzte) / 1000);
    letzte = jetzt;
    zeit = opt.standbild ?? zeit + dt;

    zustand.glattX += (zustand.zx - zustand.glattX) * 0.05;
    zustand.glattY += (zustand.zy - zustand.glattY) * 0.05;
    const p = zustand.scroll;

    kamera.position.set(basis.kx + zustand.glattX * 1.1, basis.ky - 3.6 * p - zustand.glattY * 0.5, basis.kz - 9 * p);
    kamera.lookAt(basis.kx * 0.5 + zustand.glattX * 0.35, basis.zy - 0.9 * p, 0);

    // Schiff schaukelt: Hub, Rollen, leichtes Nicken
    const hub = 0.09 * Math.sin(zeit * 0.85) + 0.04 * Math.sin(zeit * 1.63 + 1.3);
    schiff.position.set(basis.sx, basis.sy + hub, basis.sz);
    schiff.quaternion.copy(kamera.quaternion);
    schiff.rotateZ(0.014 * Math.sin(zeit * 0.72 + 0.4) + 0.006 * Math.sin(zeit * 1.37));
    schiff.updateMatrixWorld();
    aufWasser(0.06, 0.45, wasserUniforms.uSchiffA.value);
    aufWasser(0.9, 0.04, wasserUniforms.uSchiffB.value);
    wasserUniforms.uSchiffBreite.value = 1.5 * basis.massstab;

    himmel.position.copy(kamera.position);
    wasserUniforms.uZeit.value = zeit * 0.8;
    schiffUniforms.uZeit.value = zeit;
    (himmel.material as ShaderMaterial).uniforms.uZeit.value = zeit;

    renderer.render(szene, kamera);
    if (!ersterRahmen) {
      ersterRahmen = true;
      opt.beiErstemBild?.();
    }
    if (laeuft && opt.standbild === undefined) rahmen = requestAnimationFrame(bild_);
  }

  const groesse = new ResizeObserver(() => {
    anordnen(leinwand.clientWidth || 1, leinwand.clientHeight || 1);
    if (!laeuft) bild_(performance.now());
  });
  groesse.observe(leinwand);
  anordnen(leinwand.clientWidth || 1, leinwand.clientHeight || 1);

  leinwand.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    laeuft = false;
    cancelAnimationFrame(rahmen);
    opt.beiFehler?.();
  });

  return {
    setzeScroll(p) {
      zustand.scroll = Math.max(0, Math.min(1, p));
    },
    setzeZeiger(x, y) {
      zustand.zx = x;
      zustand.zy = y;
    },
    starte() {
      if (laeuft) return;
      laeuft = true;
      letzte = performance.now();
      rahmen = requestAnimationFrame(bild_);
    },
    halte() {
      laeuft = false;
      cancelAnimationFrame(rahmen);
    },
    entsorge() {
      laeuft = false;
      cancelAnimationFrame(rahmen);
      groesse.disconnect();
      szene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        const mat = m.material as ShaderMaterial | undefined;
        mat?.dispose();
      });
      silTex.dispose();
      schiffTex.dispose();
      renderer.dispose();
    },
  };
}
