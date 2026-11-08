/**
 * 3D-Hero: die echte MS Wohldorf (freigestelltes Drohnenbild 2024) auf ruhigem
 * Elbwasser im Abendlicht — aus derselben Perspektive wie das Foto.
 *
 * Warum so: Das Foto ist von schräg oben aufgenommen. Die Kamera der Szene
 * schaut deshalb ebenfalls wie eine Drohne von oben (DROHNE.neigung), sonst
 * wirkt das Schiff gekippt bzw. „sinkend“. Die Wasserlinie wird aus der Maske
 * des Freistellers gemessen (nicht geschätzt); darunter zeichnet der Shader die
 * Spiegelung des Rumpfs, darüber bleibt das Foto unverändert. Das Wasser hat
 * pro Pixel berechnete Wellen-Normalen (kein Raster sichtbar), Glitzern der
 * tiefen Sonne und Dunst zum oberen Bildrand.
 *
 * Bewegung: Die Kamera schwebt ruhig wie eine Drohne, das Schiff liegt fest am
 * Liegeplatz (kaum merkliches Heben und Rollen um die Wasserlinie). Beim Scrollen
 * steigt die Kamera auf und kippt nach unten.
 *
 * Wird erst nach dem ersten Zeichnen und nur auf fähigen Geräten geladen
 * (siehe start.ts). Alle Farben sind Anzeige-Farben (sRGB), ohne Tonemapping.
 */
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
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

const GRAD = Math.PI / 180;

/** Länge der Wohldorf (Presse 2019: 30 m) — Maßstab für Wasser und Wellen. */
const SCHIFF_LAENGE = 30;

/** Kamera wie die Drohne, die das Foto aufgenommen hat. */
const DROHNE = { neigung: 25 * GRAD, fov: 38 };

/** Tiefe Sonne vorn rechts — ihr Glitzern liegt oben rechts hinter dem Schiff. */
const SONNE = new Vector3(0.34, 0.2, -1).normalize();

// Wellen für ruhiges Flusswasser: Richtung (x, z), Höhe-Faktor, Wellenlänge (m)
const WELLEN = [
  [1.0, 0.35, 0.032, 9.0],
  [0.45, -0.9, 0.034, 5.9],
  [-0.4, 1.0, 0.036, 3.7],
  [0.95, 0.6, 0.034, 2.3],
  [-0.85, 0.45, 0.032, 1.45],
  [0.15, -1.0, 0.03, 0.95],
  [-0.65, -0.75, 0.026, 0.62],
  [0.9, -0.3, 0.022, 0.41],
];

/** Stützstellen der Wasserlinie im Foto (u = 0…1, je Spalte die Unterkante der Maske). */
const LINIE_N = 33;

const gemeinsamGlsl = /* glsl */ `
  uniform vec3 uSonne;
  uniform vec3 uHorizont;
  uniform vec3 uDunst;
  uniform vec3 uHoehe;
  uniform vec3 uZenit;
  uniform vec3 uSonnenFarbe;
  vec3 himmel(vec3 r) {
    float h = clamp(r.y, 0.0, 1.0);
    vec3 c = mix(uHorizont, uDunst, smoothstep(0.0, 0.08, h));
    c = mix(c, uHoehe, smoothstep(0.06, 0.3, h));
    c = mix(c, uZenit, smoothstep(0.28, 0.9, h));
    float s = max(dot(normalize(r), uSonne), 0.0);
    c += uSonnenFarbe * (pow(s, 1400.0) * 2.4 + pow(s, 60.0) * 0.38 + pow(s, 7.0) * 0.12);
    return c;
  }
`;

const wasserVertex = /* glsl */ `
  varying vec3 vWelt;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWelt = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const wasserFragment = /* glsl */ `
  uniform float uZeit;
  uniform vec4 uWellen[${WELLEN.length}];
  uniform vec3 uTief;
  uniform vec3 uKamm;
  uniform vec3 uNebel;
  uniform float uNebelDichte;
  uniform vec2 uRumpf[6];
  uniform float uRumpfBreite;
  varying vec3 vWelt;
  ${gemeinsamGlsl}

  float abstandStrecke(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec2 q = vWelt.xz;
    float abstand = length(cameraPosition - vWelt);
    // Normalen aller Wellen pro Pixel (analytisch) — feine Wellen blenden mit dem Abstand aus.
    vec3 n = vec3(0.0, 1.0, 0.0);
    float hub = 0.0;
    for (int i = 0; i < ${WELLEN.length}; i++) {
      vec4 w = uWellen[i];
      float k = 6.2831853 / w.w;
      float c = sqrt(9.8 / k);
      vec2 d = normalize(w.xy);
      float f = k * (dot(d, q) - c * uZeit);
      float a = w.z;
      float aus = 1.0 - smoothstep(w.w * 18.0, w.w * 70.0, abstand);
      n.xz -= d * a * cos(f) * aus * 1.6;
      hub += a * sin(f) * aus;
    }
    // unregelmäßige Kräuselung (zwei gedrehte, langsam laufende Felder) gegen ein zu gleichmäßiges Riffelmuster
    float nah = 1.0 - smoothstep(30.0, 160.0, abstand);
    vec2 k1 = mat2(0.8, -0.6, 0.6, 0.8) * q * 1.7;
    vec2 k2 = mat2(0.28, 0.96, -0.96, 0.28) * q * 2.9;
    n.xz += vec2(sin(k1.x + uZeit * 1.1) * cos(k1.y * 0.7 - uZeit * 0.8), cos(k2.y - uZeit * 1.4) * sin(k2.x * 0.6 + uZeit * 0.9)) * 0.045 * nah;
    n = normalize(n);

    vec3 v = normalize(cameraPosition - vWelt);
    float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
    vec3 r = reflect(-v, n);
    r.y = abs(r.y);
    vec3 spiegel = himmel(r);
    vec3 koerper = mix(uTief, uKamm, clamp(hub * 3.0 + 0.35, 0.0, 1.0) * 0.35);
    vec3 farbe = mix(koerper, spiegel, clamp(fresnel * 1.25, 0.0, 1.0));

    // Glitzern der tiefen Sonne
    float sd = max(dot(r, uSonne), 0.0);
    farbe += uSonnenFarbe * (pow(sd, 700.0) * 4.0 + pow(sd, 90.0) * 0.5 + pow(sd, 14.0) * 0.06);

    // Kontaktschatten am Rumpf (Wasserlinie auf dem Wasser)
    float d = 1e5;
    for (int i = 0; i < 5; i++) d = min(d, abstandStrecke(q, uRumpf[i], uRumpf[i + 1]));
    farbe *= 1.0 - 0.38 * (1.0 - smoothstep(0.0, uRumpfBreite, d));
    // feine Ringwellen, die vom Rumpf weglaufen (das Schiff bewegt sich kaum merklich)
    float ring = sin(d * 4.2 - uZeit * 2.0) * (1.0 - smoothstep(0.3, 7.0, d)) * smoothstep(0.0, 0.6, d);
    farbe += vec3(0.55, 0.5, 0.42) * ring * 0.035;

    // Dunst zum oberen Bildrand
    float nebel = 1.0 - exp(-pow(abstand * uNebelDichte, 1.6));
    farbe = mix(farbe, uNebel, clamp(nebel, 0.0, 1.0));
    gl_FragColor = vec4(farbe, 1.0);
  }
`;

const ebeneVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Die Bildebene reicht unter dem Foto um UNTEN (Anteil der Fotohöhe) weiter —
// dort liegt die Spiegelung. vUv.y = 0 ist die Unterkante dieser Erweiterung.
const UNTEN = 0.32;

const schiffFragment = /* glsl */ `
  uniform sampler2D uBild;
  uniform float uZeit;
  uniform float uLinie[${LINIE_N}];
  uniform vec3 uNebel;
  uniform vec3 uTief;
  uniform vec3 uSonnenFarbe;
  varying vec2 vUv;

  float linie(float u) {
    float x = clamp(u, 0.0, 1.0) * ${(LINIE_N - 1).toFixed(1)};
    int i = int(floor(x));
    int j = min(i + 1, ${LINIE_N - 1});
    return mix(uLinie[i], uLinie[j], fract(x));
  }

  vec3 abendlicht(vec3 c, vec2 uv) {
    // Tageslicht-Foto → Abendlicht: wärmer, etwas gedämpft, Sonnenseite oben rechts heller.
    c = c * vec3(1.0, 0.9, 0.78) * 0.8;
    c += uSonnenFarbe * 0.16 * smoothstep(0.3, 1.1, uv.x * 0.6 + uv.y * 0.7);
    return mix(c, uNebel, 0.06);
  }

  void main() {
    // Koordinaten im Foto (0…1); darunter (y < 0) liegt die Spiegelung.
    vec2 uv = vec2(vUv.x, (vUv.y * (1.0 + ${UNTEN.toFixed(2)})) - ${UNTEN.toFixed(2)});
    float wl = linie(uv.x);
    // Die Wasserlinie atmet minimal mit den kleinen Wellen.
    float welle = sin(uv.x * 46.0 - uZeit * 1.7) * 0.0018 + sin(uv.x * 113.0 + uZeit * 2.3) * 0.0011;
    float l = wl + welle;

    if (uv.y >= l) {
      vec4 s = texture2D(uBild, uv);
      float a = s.a * smoothstep(l, l + 0.006, uv.y);
      if (a < 0.01) discard;
      vec3 c = abendlicht(s.rgb, uv);
      // dunkler Saum direkt über dem Wasser (Rumpfschatten)
      c *= mix(0.78, 1.0, smoothstep(l, l + 0.035, uv.y));
      gl_FragColor = vec4(c, a);
      return;
    }

    // Spiegelung: senkrecht an der Wasserlinie gespiegelt, von kleinen Wellen verzerrt.
    float tiefe = l - uv.y;
    vec2 verzerrt = vec2(
      uv.x + sin(uv.y * 160.0 + uZeit * 2.1) * 0.0035 * (0.4 + tiefe * 6.0),
      l + tiefe * 1.05 + sin(uv.x * 90.0 - uZeit * 1.6) * 0.004 * tiefe * 8.0
    );
    vec4 s = texture2D(uBild, verzerrt);
    float aus = 1.0 - smoothstep(0.0, 0.14, tiefe);
    float a = s.a * aus * 0.55;
    if (a < 0.01) discard;
    vec3 c = mix(uTief, abendlicht(s.rgb, verzerrt) * 0.62, 0.7);
    // feiner heller Kontakt-Saum genau an der Wasserlinie
    c += vec3(0.5, 0.45, 0.38) * (1.0 - smoothstep(0.0, 0.006, tiefe)) * 0.35;
    gl_FragColor = vec4(c, a);
  }
`;

/** Unterkante der Maske je Spalte = Wasserlinie im Foto (v von unten, 0…1). */
function messeWasserlinie(bild: HTMLImageElement): Float32Array {
  const b = bild.naturalWidth,
    h = bild.naturalHeight;
  const c = document.createElement('canvas');
  c.width = b;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bild, 0, 0);
  const d = g.getImageData(0, 0, b, h).data;
  const roh: (number | null)[] = [];
  for (let i = 0; i < LINIE_N; i++) {
    const x = Math.min(b - 1, Math.round((i / (LINIE_N - 1)) * (b - 1)));
    let v: number | null = null;
    for (let y = h - 1; y >= 0; y--) {
      if (d[(y * b + x) * 4 + 3] > 128) {
        v = 1 - y / (h - 1);
        break;
      }
    }
    roh.push(v);
  }
  // Ränder ohne Rumpf: vom Nachbarn übernehmen; dann leicht glätten und 2 px nach innen.
  for (let i = 0; i < LINIE_N; i++) if (roh[i] === null) roh[i] = roh[i + 1] ?? roh[i - 1] ?? 0;
  const linie = new Float32Array(LINIE_N);
  for (let i = 0; i < LINIE_N; i++) {
    const a = roh[Math.max(0, i - 1)]!,
      m = roh[i]!,
      e = roh[Math.min(LINIE_N - 1, i + 1)]!;
    linie[i] = (a + 2 * m + e) / 4 + 2 / h;
  }
  return linie;
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

  const szene = new Scene();
  const kamera = new PerspectiveCamera(DROHNE.fov, 1, 1, 8000);

  const farben = {
    uSonne: { value: SONNE },
    uHorizont: { value: new Vector3(0.93, 0.7, 0.45) },
    uDunst: { value: new Vector3(0.56, 0.5, 0.45) },
    uHoehe: { value: new Vector3(0.18, 0.29, 0.36) },
    uZenit: { value: new Vector3(0.04, 0.11, 0.18) },
    uSonnenFarbe: { value: new Vector3(1.0, 0.8, 0.52) },
  };
  const nebel = new Vector3(0.42, 0.4, 0.38);
  // Jenseits des Wassers (sehr hohe Formate): dieselbe Dunstfarbe, keine Kante.
  renderer.setClearColor(new Color().setRGB(nebel.x, nebel.y, nebel.z, SRGBColorSpace), 1);
  const tief = new Vector3(0.025, 0.085, 0.12);

  // Wasser: flache Ebene, Wellen stecken in den Normalen (pro Pixel).
  const wasserGeo = new PlaneGeometry(9000, 9000, 1, 1);
  wasserGeo.rotateX(-Math.PI / 2);
  const wasserUniforms = {
    ...farben,
    uZeit: { value: 0 },
    uWellen: { value: new Float32Array(WELLEN.flat()) },
    uTief: { value: tief },
    uKamm: { value: new Vector3(0.09, 0.27, 0.32) },
    uNebel: { value: nebel },
    uNebelDichte: { value: 0.0042 },
    uRumpf: { value: Array.from({ length: 6 }, () => new Vector2()) },
    uRumpfBreite: { value: 2.2 },
  };
  const wasser = new Mesh(wasserGeo, new ShaderMaterial({ vertexShader: wasserVertex, fragmentShader: wasserFragment, uniforms: wasserUniforms }));
  szene.add(wasser);

  // Das Schiff (freigestelltes Foto)
  const bild = new Image();
  bild.decoding = 'async';
  bild.src = opt.schiffUrl;
  await bild.decode();
  const linie = messeWasserlinie(bild);
  const schiffTex = new Texture(bild);
  schiffTex.needsUpdate = true;
  schiffTex.anisotropy = 4;
  const seiten = bild.naturalWidth / bild.naturalHeight;
  const linieBei = (u: number) => {
    const x = Math.max(0, Math.min(1, u)) * (LINIE_N - 1);
    const i = Math.floor(x);
    const j = Math.min(i + 1, LINIE_N - 1);
    return linie[i] + (linie[j] - linie[i]) * (x - i);
  };

  // Fotohöhe in Metern, so dass die Wasserlinie (Heck bis Bug) 30 m lang ist —
  // bei der Drohnenneigung wird die Tiefe auf dem Wasser um 1/sin(neigung) gestreckt.
  const u0 = 0.04,
    u1 = 0.93;
  const du = (u1 - u0) * seiten,
    dv = linieBei(u0) - linieBei(u1);
  const fotoHoehe = SCHIFF_LAENGE / Math.hypot(du, dv / Math.sin(DROHNE.neigung));

  const schiffUniforms = {
    uBild: { value: schiffTex },
    uZeit: { value: 0 },
    uLinie: { value: Array.from(linie) },
    uNebel: { value: nebel },
    uTief: { value: tief },
    uSonnenFarbe: farben.uSonnenFarbe,
  };
  const schiffGeo = new PlaneGeometry(fotoHoehe * seiten, fotoHoehe * (1 + UNTEN));
  // Ursprung der Ebene = Punkt der Wasserlinie in der Bildmitte (u = 0.5).
  schiffGeo.translate(0, fotoHoehe * ((1 + UNTEN) / 2 - UNTEN - linieBei(0.5)), 0);
  const schiff = new Mesh(
    schiffGeo,
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

  // Aufbau je nach Format: Kamera als Drohne über dem Liegeplatz, das Schiff an
  // einer Zielstelle des Bildschirms (neben bzw. unter dem Text).
  const rig = { abstand: 80, neigung: DROHNE.neigung, ndcX: 0.45, ndcY: -0.2, anteil: 0.5 };
  function anordnen(b: number, h: number) {
    renderer.setSize(b, h, false);
    const a = b / h;
    kamera.aspect = a;
    if (a < 0.95) {
      // Hochformat: Text oben, Schiff unten
      kamera.fov = DROHNE.fov + 8;
      Object.assign(rig, { ndcX: 0.02, ndcY: -0.84, anteil: Math.min(0.36, (0.62 * a) / seiten) });
    } else {
      // Querformat: Text links, Schiff rechts
      const breit = Math.min(1, (a - 0.95) / 0.8);
      kamera.fov = DROHNE.fov;
      Object.assign(rig, { ndcX: 0.42 + 0.06 * breit, ndcY: -0.4 + 0.04 * breit, anteil: 0.62 - 0.05 * breit });
    }
    kamera.updateProjectionMatrix();
    // Abstand so, dass das Foto `anteil` der Bildhöhe einnimmt — gemessen am Liegeplatz,
    // nicht an der Bildmitte (zum unteren Rand hin ist das Wasser näher an der Kamera).
    stelleKamera(1, rig.neigung, 0);
    const naehe = aufsWasser(rig.ndcX, rig.ndcY, ziel).distanceTo(kamera.position);
    rig.abstand = fotoHoehe / (rig.anteil * 2 * Math.tan((kamera.fov / 2) * GRAD)) / naehe;
  }

  /** Drohne auf einer Kugel um den Ursprung: Abstand, Neigung nach unten, Drehung um die Hochachse. */
  function stelleKamera(abstand: number, neigung: number, dreh: number) {
    blick.set(Math.sin(dreh) * Math.cos(neigung), -Math.sin(neigung), -Math.cos(dreh) * Math.cos(neigung));
    kamera.position.copy(blick).multiplyScalar(-abstand);
    kamera.lookAt(0, 0, 0);
    kamera.updateMatrixWorld();
  }

  const zustand = { scroll: 0, zx: 0, zy: 0, glattX: 0, glattY: 0 };
  const blick = new Vector3();
  const ziel = new Vector3();
  const strahl = new Vector3();
  const punkt = new Vector3();

  /** Strahl durch einen Bildschirmpunkt (NDC) → Schnitt mit dem Wasser (y = 0). */
  function aufsWasser(x: number, y: number, aus: Vector3) {
    strahl.set(x, y, 0.5).unproject(kamera).sub(kamera.position).normalize();
    const t = strahl.y < -1e-4 ? -kamera.position.y / strahl.y : 1e4;
    return aus.copy(kamera.position).addScaledVector(strahl, t);
  }
  /** Punkt des Fotos (u, v) auf der Bildebene → Strahl → Schnitt mit dem Wasser. */
  function fotoAufsWasser(u: number, v: number, aus: Vector2) {
    punkt.set((u - 0.5) * fotoHoehe * seiten, (v - linieBei(0.5)) * fotoHoehe, 0);
    schiff.localToWorld(punkt);
    strahl.copy(punkt).sub(kamera.position).normalize();
    const t = strahl.y < -1e-4 ? -kamera.position.y / strahl.y : 1e4;
    aus.set(kamera.position.x + strahl.x * t, kamera.position.z + strahl.z * t);
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

    zustand.glattX += (zustand.zx - zustand.glattX) * 0.04;
    zustand.glattY += (zustand.zy - zustand.glattY) * 0.04;
    const p = zustand.scroll;

    // Drohne: ruhiges Schweben, Zeiger dreht leicht um den Liegeplatz,
    // Scrollen lässt sie steigen und steiler nach unten blicken.
    const neigung = rig.neigung + p * 16 * GRAD - zustand.glattY * 1.2 * GRAD + Math.sin(zeit * 0.21) * 0.25 * GRAD;
    const dreh = zustand.glattX * 2.5 * GRAD + Math.sin(zeit * 0.13 + 1) * 0.6 * GRAD;
    const abstand = rig.abstand * (1 - 0.18 * p) * (1 + Math.sin(zeit * 0.17) * 0.006);
    stelleKamera(abstand, neigung, dreh);

    // Liegeplatz = Schnitt des Zielpunkts mit dem Wasser; die Szene ist um (0,0,0) gebaut,
    // daher wird das Schiff dorthin gesetzt, wo der Bildschirmpunkt das Wasser trifft.
    aufsWasser(rig.ndcX, rig.ndcY - 0.18 * p, ziel);

    // Schiff liegt fest: kaum merkliches Heben und Rollen um die Wasserlinie.
    const hub = 0.025 * Math.sin(zeit * 0.9) + 0.012 * Math.sin(zeit * 1.7 + 1.3);
    schiff.position.copy(ziel);
    schiff.position.y += hub;
    schiff.quaternion.copy(kamera.quaternion);
    schiff.rotateZ(0.0035 * Math.sin(zeit * 0.7 + 0.4) + 0.0015 * Math.sin(zeit * 1.31));
    schiff.updateMatrixWorld();

    // Wasserlinie auf dem Wasser (für den Kontaktschatten)
    const rumpf = wasserUniforms.uRumpf.value;
    for (let i = 0; i < 6; i++) {
      const u = u0 + ((u1 - u0) * i) / 5;
      fotoAufsWasser(u, linieBei(u), rumpf[i]);
    }


    wasserUniforms.uZeit.value = zeit * 0.9;
    schiffUniforms.uZeit.value = zeit;

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
      schiffTex.dispose();
      renderer.dispose();
    },
  };
}
