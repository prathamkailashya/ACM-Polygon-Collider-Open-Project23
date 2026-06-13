# Polygon Collider — Technical Documentation

3D polygon visualisation and collision detection that runs entirely in the
browser. Two rigid shapes (a box and a sphere) are dropped onto a ground plane
and pushed toward each other; the physics engine resolves contacts and the
scene is rendered in real time with WebGL. The project also ships a
from-scratch implementation of the GJK collision-detection algorithm as a
standalone module.

Originally built for ACM Open Projects '23.

---

## 1. Project overview

| | |
|---|---|
| **Type** | Static client-side web app (no backend, no build step) |
| **Rendering** | [three.js](https://threejs.org/) r0.153 (WebGL) |
| **Physics** | [cannon.js](https://github.com/schteppe/cannon.js) 0.6.2 (rigid-body dynamics) |
| **Collision detection** | from-scratch **GJK** (`gjk.js`), run every frame on the live mesh vertices |
| **Physics / movement** | cannon.js rigid bodies (the shapes slide toward each other) |
| **Camera** | `OrbitControls` (orbit / zoom / pan), with damping |
| **HUD** | live status pill (NO COLLISION / CONTACT), elapsed time, centre gap, and an event log |

When the page loads you see a dark, lit scene: a faded grid floor, a red cube on
the left, and a green sphere on the right. The two shapes slide toward each
other; **the GJK algorithm tests them for overlap every frame** and the HUD
shows the result in real time — the status pill flips to **CONTACT**, both
shapes glow amber, and a timestamped line is written to the on-screen event log
(and the console). Once a shape passes the edge of the plane it is removed and
the simulation auto-replays after a short pause, so the collision is always
visible.

---

## 2. Algorithm explanation

### 2.1 GJK collision detection (`gjk.js`) — what the HUD shows

`gjk.js` is a self-contained implementation of the **Gilbert–Johnson–Keerthi**
algorithm. Two convex shapes intersect **iff** their Minkowski difference
`A ⊖ B` contains the origin, so GJK searches for a simplex (point → line →
triangle → tetrahedron) inside that difference that encloses the origin:

- **`support(shape1, shape2, dir)`** — support point of the Minkowski
  difference: farthest point of shape1 along `dir` **minus** farthest point of
  shape2 along **`-dir`**.
- **`doSimplex(simplex)`** — evolves the simplex (line/triangle/tetrahedron
  cases), discarding the features that can't contain the origin and returning
  the next search direction; the tetrahedron case reports when the origin is
  enclosed.
- **`gjk(shape1, shape2)`** — iterates support/`doSimplex` until it either
  encloses the origin (**collision**) or the new support fails to pass the
  origin (**no collision**). A `maxIterations` cap keeps the per-frame call safe.

`index.html` imports `gjk` and calls it every frame on the **world-space
vertices** of the box and sphere (extracted once into a reusable cache and
transformed by each mesh's `matrixWorld`). The boolean result drives the HUD
status pill, the emissive glow, and the event log. This is the collision
detection you see on screen.

> Each shape is an array of `{x, y, z}` points, which is exactly what a
> `THREE.BufferGeometry` position attribute yields after a world transform.

### 2.2 Physics / movement (cannon.js)

cannon.js provides the rigid-body world that moves the shapes:

1. A `CANNON.World` is created with gravity `(0, -9.82, 0)`.
2. Each mesh is paired with a body (`CANNON.Box`, `CANNON.Sphere`) plus a static
   `CANNON.Plane` ground (`mass = 0`).
3. Every frame `world.step(1/60)` runs, the shapes are translated toward each
   other (with a clamped time step to avoid tunnelling), and the bodies are
   synced to the meshes.
4. Shapes that pass the plane bounds are removed; the demo then auto-replays.

---

## 3. Folder structure

```
ACM-Polygon-Collider-Open-Project23/
├── index.html      # The app: scene setup, physics world, render loop (ES module)
├── gjk.js          # Standalone GJK collision-detection implementation
├── package.json    # Metadata + convenience scripts to serve the static site
├── README.md       # Short project description
└── TECHNICAL.md    # This document
```

three.js and cannon.js are loaded from a CDN at runtime (pinned versions, see
`index.html`), so there is no `node_modules` directory and no bundler.

---

## 4. Setup

No build step and no dependency install are required — the project is plain
HTML + JavaScript that loads its libraries from a CDN. You only need a static
file server (browsers block ES-module imports when a page is opened via the
`file://` protocol, so the file must be served over HTTP).

Pick whichever server you already have:

```bash
# Option A — Node (uses the script defined in package.json)
npm start
# equivalent to: npx --yes serve .

# Option B — Python 3 (no extra install)
python3 -m http.server 8000

# Option C — any other static server, e.g. VS Code "Live Server"
```

---

## 5. Run commands

From the project directory:

```bash
# Start a static server (Python)
python3 -m http.server 8000
```

Then open the page in your browser:

- Option A (`npm start` / `serve`): open the URL it prints (usually
  `http://localhost:3000`).
- Option B (Python): open `http://localhost:8000/index.html`.

You should immediately see the animated 3D scene. Open the browser developer
console (`F12` → Console) to watch the `Collision detected …` log messages.

---

## 6. Browser / web rendering

- **Requirements:** any modern browser with WebGL and ES-module / import-map
  support (Chrome, Edge, Firefox, Safari — current versions).
- **Why a server is needed:** `index.html` uses
  `<script type="module">` with an import map. Module scripts are not allowed
  over `file://`, so double-clicking the HTML file will show a blank page and a
  CORS / module error in the console. Always serve it over HTTP (Section 5).
- **Controls:** left-drag to orbit, scroll to zoom, right-drag to pan.
- **Deploying:** because it is fully static, the folder can be dropped onto any
  static host (GitHub Pages, Netlify, Vercel, etc.). For GitHub Pages, enable
  Pages on the repository and the site is served from `index.html`.

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Blank page, console shows a module/CORS error | Opened via `file://` | Serve over HTTP (Section 5) |
| `THREE is not defined` / import fails | Network blocked or CDN unreachable | Confirm internet access; the CDN URLs in `index.html` must be reachable |
| Nothing moves / scene frozen | JS error earlier in the console | Open DevTools → Console and read the first error |
| Shapes vanish then reappear | Expected — shapes are removed once they pass the plane edge, then the demo auto-replays | No action needed |
| HUD never shows CONTACT | Browser blocked the local `gjk.js` module import (opened via `file://`) | Serve over HTTP (Section 5) — the GJK module must load |
| WebGL context errors | GPU/driver or headless environment without WebGL | Use a normal desktop browser with hardware acceleration enabled |

---

## 8. Notes on dependencies

- **three.js r0.153** and **cannon.js 0.6.2** are pinned via CDN in
  `index.html`. The version numbers are fixed so the demo keeps working as the
  libraries evolve (three.js removed the global `BoxBufferGeometry` /
  `SphereBufferGeometry` names and the legacy global build in later releases —
  this project uses the current `BoxGeometry` / `SphereGeometry` names and the
  ES-module build).
- `OrbitControls` is loaded from the official three.js addons via the import map.
