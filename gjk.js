// Standalone GJK (Gilbert–Johnson–Keerthi) collision test for two convex point
// sets in 3D. `gjk(shape1, shape2)` returns true if the two vertex sets overlap.
// Each shape is an array of {x, y, z} points (e.g. world-space mesh vertices).
//
// index.html imports this module and runs it every frame on the world-space
// vertices of the two meshes to drive the on-screen collision read-out, while
// cannon.js handles the physics.
//
// The algorithm works on the Minkowski difference A ⊖ B: the two shapes
// intersect iff that difference contains the origin. GJK searches for a simplex
// (point → line → triangle → tetrahedron) inside the difference that encloses
// the origin. The simplex evolution below is the standard 3D formulation.

function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function negate(a) {
    return { x: -a.x, y: -a.y, z: -a.z };
}

function lengthSq(a) {
    return a.x * a.x + a.y * a.y + a.z * a.z;
}

// Vector triple product (a × b) × c — used to aim the next search direction
// toward the origin while staying in the plane of the current simplex.
function tripleProduct(a, b, c) {
    return cross(cross(a, b), c);
}

function sameDirection(dir, ao) {
    return dot(dir, ao) > 0;
}

function anyPerpendicular(v) {
    let p = cross(v, { x: 1, y: 0, z: 0 });
    if (lengthSq(p) < 1e-12) p = cross(v, { x: 0, y: 1, z: 0 });
    return p;
}

// Farthest point of a single shape along a direction.
function farthestPoint(shape, dir) {
    let best = shape[0];
    let bestDot = dot(best, dir);
    for (let i = 1; i < shape.length; i++) {
        const d = dot(shape[i], dir);
        if (d > bestDot) {
            bestDot = d;
            best = shape[i];
        }
    }
    return best;
}

// Support point of the Minkowski difference: farthest point of A along dir minus
// farthest point of B along -dir.
function support(shape1, shape2, dir) {
    return sub(farthestPoint(shape1, dir), farthestPoint(shape2, negate(dir)));
}

// simplex is ordered newest-first: simplex[0] is the most recently added point.
// Each handler trims the simplex toward the feature closest to the origin and
// returns the next search direction, or signals that the origin is enclosed.
function lineCase(simplex) {
    const a = simplex[0];
    const b = simplex[1];
    const ab = sub(b, a);
    const ao = negate(a);

    if (sameDirection(ab, ao)) {
        let dir = tripleProduct(ab, ao, ab);
        if (lengthSq(dir) < 1e-12) dir = anyPerpendicular(ab); // origin on the line
        return { enclosed: false, dir };
    }
    simplex.length = 0;
    simplex.push(a);
    return { enclosed: false, dir: ao };
}

function triangleCase(simplex) {
    const a = simplex[0];
    const b = simplex[1];
    const c = simplex[2];
    const ab = sub(b, a);
    const ac = sub(c, a);
    const ao = negate(a);
    const abc = cross(ab, ac);

    if (sameDirection(cross(abc, ac), ao)) {
        if (sameDirection(ac, ao)) {
            simplex.length = 0;
            simplex.push(a, c);
            return { enclosed: false, dir: tripleProduct(ac, ao, ac) };
        }
        simplex.length = 0;
        simplex.push(a, b);
        return lineCase(simplex);
    }

    if (sameDirection(cross(ab, abc), ao)) {
        simplex.length = 0;
        simplex.push(a, b);
        return lineCase(simplex);
    }

    if (sameDirection(abc, ao)) {
        return { enclosed: false, dir: abc };
    }
    simplex.length = 0;
    simplex.push(a, c, b);
    return { enclosed: false, dir: negate(abc) };
}

function tetrahedronCase(simplex) {
    const a = simplex[0];
    const b = simplex[1];
    const c = simplex[2];
    const d = simplex[3];
    const ab = sub(b, a);
    const ac = sub(c, a);
    const ad = sub(d, a);
    const ao = negate(a);
    const abc = cross(ab, ac);
    const acd = cross(ac, ad);
    const adb = cross(ad, ab);

    if (sameDirection(abc, ao)) {
        simplex.length = 0;
        simplex.push(a, b, c);
        return triangleCase(simplex);
    }
    if (sameDirection(acd, ao)) {
        simplex.length = 0;
        simplex.push(a, c, d);
        return triangleCase(simplex);
    }
    if (sameDirection(adb, ao)) {
        simplex.length = 0;
        simplex.push(a, d, b);
        return triangleCase(simplex);
    }
    return { enclosed: true, dir: null }; // origin is inside the tetrahedron
}

function doSimplex(simplex) {
    if (simplex.length === 2) return lineCase(simplex);
    if (simplex.length === 3) return triangleCase(simplex);
    return tetrahedronCase(simplex);
}

function gjk(shape1, shape2, maxIterations = 64) {
    if (!shape1.length || !shape2.length) return false;

    let initial = support(shape1, shape2, { x: 1, y: 0, z: 0 });
    if (lengthSq(initial) < 1e-12) return true; // support straddles the origin

    const simplex = [initial];
    let direction = negate(initial);

    for (let iter = 0; iter < maxIterations; iter++) {
        if (lengthSq(direction) < 1e-18) direction = { x: 1, y: 0, z: 0 };

        const a = support(shape1, shape2, direction);
        if (dot(a, direction) < 0) return false; // origin is unreachable: no overlap

        simplex.unshift(a); // newest point first
        const result = doSimplex(simplex);
        if (result.enclosed) return true;
        direction = result.dir;
    }

    return false; // inconclusive within the iteration budget
}

export { gjk, support, farthestPoint, tripleProduct, cross, dot, sub };
