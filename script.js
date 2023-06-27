// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.getElementById('scene-container').appendChild(renderer.domElement);

// const shape1Geometry = new THREE.BoxGeometry(1, 1, 1);
// const shape2Geometry = new THREE.SphereGeometry(0.5, 32, 32);
// const shape1Material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
// const shape2Material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
// const shape1Mesh = new THREE.Mesh(shape1Geometry, shape1Material);
// const shape2Mesh = new THREE.Mesh(shape2Geometry, shape2Material);

// shape1Mesh.position.set(-1, 0, 0);
// shape2Mesh.position.set(1, 0, 0);

// scene.add(shape1Mesh, shape2Mesh);

// const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(0, 0, 5);
// scene.add(light);

// camera.position.z = 5;

// function animate() {
//   requestAnimationFrame(animate);

//   // Update shape positions
//   shape1Mesh.position.x += 0.02;
//   shape2Mesh.position.x -= 0.03;

//   renderer.render(scene, camera);
// }

// animate();
//   // Collision detection
//   const shape1BoundingBox = new THREE.Box3().setFromObject(shape1Mesh);
//   const shape2BoundingSphere = new THREE.Sphere(shape2Mesh.position, 0.5);

//   if (shape1BoundingBox.intersectsBox(shape2BoundingSphere)) {
//     // Collision detected
//     shape1Mesh.material.color.set(0xff0000);
//     shape2Mesh.material.color.set(0xff0000);
//     console.log("Collision detected");
//   } else {
//     // No collision
//     shape1Mesh.material.color.set(0xff0000);
//     shape2Mesh.material.color.set(0x00ff00);
//     console.log("No collision");
//   }

//   renderer.render(scene, camera);








