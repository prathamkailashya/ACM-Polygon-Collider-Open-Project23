function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function support(shape1, shape2, direction) {
    const support1 = shape1.reduce((maxPoint, currentPoint) => {
        const dotProduct = dot(currentPoint, direction);
        if (dotProduct > dot(maxPoint, direction)) {
            return currentPoint;
        }
        return maxPoint;
    }, shape1[0]);

    const support2 = shape2.reduce((maxPoint, currentPoint) => {
        const dotProduct = dot(currentPoint, direction);
        if (dotProduct > dot(maxPoint, direction)) {
            return currentPoint;
        }
        return maxPoint;
    }, shape2[0]);

    return sub(support1, support2);
}

// function support(shape1, shape2, direction) {
//     const support1 = shape1.reduce((maxPoint, currentPoint) => {
//         const dotProduct = dot(currentPoint, direction);
//         if (dotProduct > dot(maxPoint, direction)) {
//             return currentPoint;
//         }
//         return maxPoint;
//     }, shape1[0].clone());

//     const support2 = shape2.reduce((maxPoint, currentPoint) => {
//         const dotProduct = dot(currentPoint, direction);
//         if (dotProduct > dot(maxPoint, direction)) {
//             return currentPoint;
//         }
//         return maxPoint;
//     }, shape2[0].clone());

//     return sub(support1, support2);
// }

function tripleProduct(a, b, c) {
    const crossProduct = {
        x: b.y * c.z - b.z * c.y,
        y: b.z * c.x - b.x * c.z,
        z: b.x * c.y - b.y * c.x
    };

    return {
        x: a.y * crossProduct.z - a.z * crossProduct.y,
        y: a.z * crossProduct.x - a.x * crossProduct.z,
        z: a.x * crossProduct.y - a.y * crossProduct.x
    };
}
function doSimplex(simplex, direction) {
    const a = simplex[simplex.length - 1];
    const ao = sub({ x: 0, y: 0, z: 0 }, a);

    if (simplex.length === 4) {
        const b = simplex[simplex.length - 2];
        const c = simplex[simplex.length - 3];
        const d = simplex[simplex.length - 4];
        const ab = sub(b, a);
        const ac = sub(c, a);
        const ad = sub(d, a);
        const abPerp = tripleProduct(ac, ab, ab);
        const acPerp = tripleProduct(ad, ac, ac);

        if (dot(abPerp, ao) > 0) {
            simplex.splice(simplex.indexOf(c), 1);
            direction.x = abPerp.x;
            direction.y = abPerp.y;
            direction.z = abPerp.z;
        } else if (dot(acPerp, ao) > 0) {
            simplex.splice(simplex.indexOf(b), 1);
            direction.x = acPerp.x;
            direction.y = acPerp.y;
            direction.z = acPerp.z;
        } else {
            const adPerp = tripleProduct(ab, ad, ad);
            simplex.splice(simplex.indexOf(c), 1);
            simplex.splice(simplex.indexOf(b), 1);
            direction.x = adPerp.x;
            direction.y = adPerp.y;
            direction.z = adPerp.z;
        }
    } else if (simplex.length === 3) {
        const b = simplex[simplex.length - 2];
        const c = simplex[simplex.length - 3];
        const ab = sub(b, a);
        const ac = sub(c, a);
        const abPerp = tripleProduct(ac, ab, ab);

        if (dot(abPerp, ao) > 0) {
            direction.x = abPerp.x;
            direction.y = abPerp.y;
            direction.z = abPerp.z;
        } else {
            const acPerp = tripleProduct(ab, ac, ac);
            simplex.splice(simplex.indexOf(b), 1);
            direction.x = acPerp.x;
            direction.y = acPerp.y;
            direction.z = acPerp.z;
        }
    } else {
        const b = simplex[simplex.length - 2];
        const ab = sub(b, a);
        const abPerp = tripleProduct(ab, ao, ab);
        direction.x = abPerp.x;
        direction.y = abPerp.y;
        direction.z = abPerp.z;
    }

    return false; // Continue iteration
}



function gjk(shape1, shape2) {
    const simplex = [support(shape1, shape2, { x: 1, y: 0, z: 0 })];
    const direction = { x: -simplex[0].x, y: -simplex[0].y, z: -simplex[0].z };

    while (true) {
        const newSupport = support(shape1, shape2, direction);

        if (dot(newSupport, direction) < 0) {
            return false; // No collision
        }

        simplex.push(newSupport);

        if (doSimplex(simplex, direction)) {
            return true; // Collision detected
        }
    }
}

