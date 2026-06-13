# ACM-Polygon-Collider-Open-Project23

3D polygon visualisation and collision detection that runs in the browser,
using **three.js**, **cannon.js**, and a from-scratch **GJK** algorithm.
Built for ACM Open Projects '23.

A box and a sphere are dropped onto a ground plane and pushed toward each
other; collisions are resolved by the physics engine and the scene is rendered
in real time. As an extra feature, each shape is removed from the scene once it
crosses past the edge of the plane.

## Quick start

The app is a static site, but it must be served over HTTP (ES-module imports do
not work from `file://`):

```bash
# Option A — Node
npm start            # then open the printed URL (usually http://localhost:3000)

# Option B — Python 3
python3 -m http.server 8000   # then open http://localhost:8000/index.html
```

Left-drag to orbit, scroll to zoom, right-drag to pan. Open the browser console
to see collision events logged.

## Files

- `index.html` — scene, physics world, and render loop (loads three.js / cannon.js from a CDN)
- `gjk.js` — standalone GJK collision-detection implementation
- `TECHNICAL.md` — full technical documentation (algorithm, setup, troubleshooting)

See **[TECHNICAL.md](TECHNICAL.md)** for details.

![Screenshot 2023-06-28 at 4 12 23 AM](https://github.com/prathamkailashya/ACM-Polygon-Collider-Open-Project23/assets/102645158/ffe0b456-3297-4780-a5b0-e085911b0297)
![Screenshot 2023-06-28 at 4 12 27 AM](https://github.com/prathamkailashya/ACM-Polygon-Collider-Open-Project23/assets/102645158/0f3e0b87-115d-4aa6-82bc-1963f59f1225)
