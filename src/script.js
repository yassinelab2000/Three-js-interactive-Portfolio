import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { gsap } from "gsap";
alert(
  "Please note that : this portfolio website is currently in its Beta version and is not optimized for mobile phone usage.\nYassine."
);
/**
 * Debug
 */
const gui = new GUI({
  width: 300,
  title: "Debug Bar :",
});
gui.hide();
window.addEventListener("keydown", (event) => {
  if (event.key == "d") gui.show(gui._hidden);
});

/**
 * Full Screen
 */
window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

/**
 * Base THREE.js
 */
//Music Played
let music = document.getElementById("Music");
music.volume = 0.1;
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
/**
 * sounds
 */
const brickTone1Sound = new Audio("/sounds/brickTone1.mp3");
const brickTone2Sound = new Audio("/sounds/brickTone2.wav");
const hitSound = new Audio("/sounds/hit.mp3");
const carHitSound = new Audio("/sounds/carHit.wav");

const playBrickTone1Sound = (collision) => {
  const imapctStrength = collision.contact.getImpactVelocityAlongNormal();
  if (imapctStrength > 1.5) {
    brickTone1Sound.volume = Math.random();
    brickTone1Sound.currentTime = 0;
    brickTone1Sound.play();
  }
};

const playBrickTone2Sound = (collision) => {
  const imapctStrength = collision.contact.getImpactVelocityAlongNormal();
  if (imapctStrength > 1.5) {
    brickTone2Sound.volume = Math.random();
    brickTone2Sound.currentTime = 0;
    brickTone2Sound.play();
  }
};

const playHitSound = (collision) => {
  const imapctStrength = collision.contact.getImpactVelocityAlongNormal();
  if (imapctStrength > 1.5) {
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
};

const playCarHitSound = (collision) => {
  const imapctStrength = collision.contact.getImpactVelocityAlongNormal();
  if (imapctStrength > 1.5) {
    carHitSound.volume = Math.random();
    carHitSound.currentTime = 0;
    carHitSound.play();
  }
};
/**
 * Fog
 */
const fog = new THREE.Fog("#DAA06D", 50, 100);
scene.fog = fog;
/**
 * All used loaders
 */
// Loading manager :
const loadingBarElement = document.querySelector(".loading-bar");
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = "";
    });
  },
  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);
// For Text
const fontLoader = new FontLoader(loadingManager);
// For OBJ Models
var mtlLoader = new MTLLoader(loadingManager);
// Draco For Blender Models
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("/draco/");
// GLTF For Blender Models
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);
// Textures
const textureLoader = new THREE.TextureLoader(loadingManager);
const matcapTexture = textureLoader.load(`./textures/matcaps/1.png`);
matcapTexture.colorSpace = THREE.SRGBColorSpace;
/**
 * Phisics World General Settings
 */

//Gravity
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});
// Contact Material
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.3,
    restitution: 0.3,
  }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

/**
 * Car Model
 */

let car = null;
mtlLoader.load("models/car/car.mtl", function (materials) {
  materials.preload();
  var objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

  objLoader.load("models/car/car.obj", function (mesh) {
    mesh.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });

    car = new THREE.Group();
    scene.add(car);
    mesh.rotation.y -= Math.PI * 0.5;
    mesh.position.y = 15;
    car.add(mesh);
    car.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    car.scale.set(0.03, 0.03, 0.03);
  });
});

// Car Phisical Shape
const carBody = new CANNON.Body({
  mass: 10,
  position: new CANNON.Vec3(0, 7, 0),
});
const carshape1 = new CANNON.Box(new CANNON.Vec3(2.1, 0.55, 1));
carBody.addShape(carshape1, new CANNON.Vec3(0, 0.7, 0));
const carshape2 = new CANNON.Box(new CANNON.Vec3(1.1, 0.45, 0.8));

carBody.addShape(carshape2, new CANNON.Vec3(0.3, 1.5, 0));
//sound
//if () {
// carBody.body.removeEventListener("collide", playCarHitSound)
//}

//Canon Build in Settings for car

const vehicle = new CANNON.RigidVehicle({
  chassisBody: carBody,
});

//Settings for (car)
const mass = 2;
const axisWidth = 2.2;
const wheelShape = new CANNON.Sphere(0.4);
const wheelMaterial = new CANNON.Material("wheel");
const down = new CANNON.Vec3(0, -0.5, 0);
// The 4 Wheels (from 1 to 4)
const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody1.addShape(wheelShape);
wheelBody1.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody1,
  position: new CANNON.Vec3(-1.35, 0, axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 0.5),
  direction: down,
});

const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody2.addShape(wheelShape);
wheelBody2.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody2,
  position: new CANNON.Vec3(-1.35, 0, -axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 0.5),
  direction: down,
});

const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody3.addShape(wheelShape);
wheelBody3.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody3,
  position: new CANNON.Vec3(1.35, 0, axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 0.5),
  direction: down,
});

const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody4.addShape(wheelShape);
wheelBody4.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody4,
  position: new CANNON.Vec3(1.35, 0, -axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 0.5),
  direction: down,
});

vehicle.addToWorld(world);

/**
 * Controls over vehicle
 */
document.addEventListener("keydown", (event) => {
  const maxSteerVal = Math.PI / 8;
  const maxForce = 30;

  switch (event.key) {
    case "ArrowUp":
      vehicle.setWheelForce(maxForce, 0);
      vehicle.setWheelForce(maxForce, 1);
      break;

    case "ArrowDown":
      vehicle.setWheelForce(-maxForce / 2, 0);
      vehicle.setWheelForce(-maxForce / 2, 1);
      break;

    case "ArrowLeft":
      vehicle.setSteeringValue(maxSteerVal, 0);
      vehicle.setSteeringValue(maxSteerVal, 1);
      break;

    case "ArrowRight":
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 1);
      break;
  }
});

// reset car force to zero when key is released
document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowUp":
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
      break;

    case "ArrowDown":
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
      break;

    case "ArrowLeft":
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;

    case "ArrowRight":
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;
  }
});

/**
 * THREE JS World
 */
// Axes helper
const axesHelper = new THREE.AxesHelper(40);
//scene.add(axesHelper);
/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
      void main()
      {
          gl_Position = vec4(position, 1.0);
      }
  `,
  fragmentShader: `
    uniform float uAlpha;
      void main()
      {
          gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
      }
  `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);
/**
 * Floor
 */
const floorGeometry = new THREE.PlaneGeometry(400, 400);
const floorMaterial = new THREE.MeshMatcapMaterial();
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;
floorMaterial.matcap = matcapTexture;
scene.add(floor);

// Phisical Floor
const floorBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});
floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(floorBody);
/**
 * Duplicated items
 */

// Use it To Create trees
const creatTree = (x, y, z, r) => {
  gltfLoader.load("/models/tree/tree.glb", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(x, y, z);
    gltf.scene.rotation.y = r;
  });
  const treeBody = new CANNON.Body({
    mass: 0,
  });
  const treeShape = new CANNON.Box(new CANNON.Vec3(0.8, 2.2, 1));
  treeBody.addShape(treeShape, new CANNON.Vec3(x, 2.2, z));
  world.addBody(treeBody);
  treeBody.addEventListener("collide", playCarHitSound);
};
// Trees in our map
creatTree(3, 0, 10, Math.PI * 0.5);
creatTree(0, 0, -12, Math.PI);
creatTree(3, 0, -10, -Math.PI * 0.5);
creatTree(0, 0, 12, Math.PI);
creatTree(-10, 0, -12, -Math.PI * 0.5);
creatTree(-25, 0, 76, Math.PI * 0.5);
creatTree(-30, 0, 78, Math.PI);
creatTree(-20, 0, -35, Math.PI * 1.5);
creatTree(-37, 0, -35, Math.PI * 1.5);
creatTree(-57, 0, -19, Math.PI * 1.5);
creatTree(-59, 0, -21, -Math.PI * 1.5);

// Use it To Creat Rocks
const creatTeeRocksModel = (x, y, z, r) => {
  gltfLoader.load("/models/rocks/treeRocks.glb", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(x, y, z);
    gltf.scene.rotation.y = r;
  });
  const teeRocksModelBody = new CANNON.Body({
    mass: 0,
  });
  const teeRocksModelShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4));
  teeRocksModelBody.addShape(teeRocksModelShape, new CANNON.Vec3(x, 0.4, z));
  world.addBody(teeRocksModelBody);
  teeRocksModelBody.addEventListener("collide", playCarHitSound);
};
creatTeeRocksModel(1, 0, 10, Math.PI / 2);
creatTeeRocksModel(1, 0, -10, Math.PI / 2);
creatTeeRocksModel(-27, 0, 77, Math.PI / 2);
creatTeeRocksModel(-30, 0, 14, Math.PI / 2);

// Use it To creat two rocks
const creatTwoRocksModel = (x, y, z, r) => {
  gltfLoader.load("/models/rocks/twoRocks.glb", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(x, y, z);
    gltf.scene.rotation.y = r;
  });
  const twoRocksModelBody = new CANNON.Body({
    mass: 0,
  });
  const twoRocksModelShape = new CANNON.Box(new CANNON.Vec3(0.45, 0.45, 0.45));
  twoRocksModelBody.addShape(twoRocksModelShape, new CANNON.Vec3(x, 0.45, z));
  world.addBody(twoRocksModelBody);
  twoRocksModelBody.addEventListener("collide", playCarHitSound);
};
creatTwoRocksModel(-10, 0, -10, Math.PI);
creatTwoRocksModel(-29.5, 0, -13.9, Math.PI);
// Use it To creat one rocks
const creatOneRockModel = (x, y, z, r) => {
  gltfLoader.load("/models/rocks/oneRock.glb", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(x, y, z - 0.1);
    gltf.scene.rotation.y = r;
  });
  const oneRockModelBody = new CANNON.Body({
    mass: 0,
  });
  const oneRockModelShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.3));
  oneRockModelBody.addShape(oneRockModelShape, new CANNON.Vec3(x, 0.4, z));
  world.addBody(oneRockModelBody);
  oneRockModelBody.addEventListener("collide", playCarHitSound);
};
creatOneRockModel(-43.5, 0, 2.5, Math.PI);
creatOneRockModel(-59, 0, -19, -Math.PI);

//Use it To creat  walls
const objectsToUpdate = [];
const objectsToUpdate2 = [];
const creatCornerWallPart1 = (x, z) => {
  const brickGeometry = new THREE.BoxGeometry(2, 0.8, 1);
  const brickMaterial = new THREE.MeshStandardMaterial({
    color: "rgb(255, 253, 208)",
  });
  const brick = new THREE.Mesh(brickGeometry, brickMaterial);
  brick.position.set(x, 0.4, z);
  //
  const brick2 = new THREE.Mesh(brickGeometry, brickMaterial);
  brick2.position.set(x - 2 - 0.5, 0.4, z);
  //
  const brick3 = new THREE.Mesh(brickGeometry, brickMaterial);
  brick3.position.set(x - 4 - 1, 0.4, z);

  const brick1L2 = new THREE.Mesh(brickGeometry, brickMaterial);
  brick1L2.position.set(x + 0.5 + 1, 0.4 + 0.8, z);
  //
  const brick2L2 = new THREE.Mesh(brickGeometry, brickMaterial);
  brick2L2.position.set(x - 1, 0.4 + 0.8, z);
  //
  const brick3L2 = new THREE.Mesh(brickGeometry, brickMaterial);
  brick3L2.position.set(x - 1 - 2.5, 0.4 + 0.8, z);
  //
  // phisics
  //
  const brickShape = new CANNON.Box(
    new CANNON.Vec3(2 * 0.5, 0.8 * 0.5, 1 * 0.5)
  );
  const brickBody = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x, 0.4, z),
    shape: brickShape,
  });
  world.addBody(brickBody);
  brickBody.allowSleep = true;
  //brick2.position.set(x - 2 - 0.5, 0.4, z);
  const brick2Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x - 2 - 0.5, 0.4, z),
    shape: brickShape,
  });
  world.addBody(brick2Body);
  brick2Body.allowSleep = true;
  // brick3.position.set(x - 4 - 1, 0.4, z);
  const brick3Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x - 4 - 1, 0.4, z),
    shape: brickShape,
  });
  world.addBody(brick3Body);
  brick3Body.allowSleep = true;
  // brick1L2.position.set(x + 0.5 + 1, 0.4 + 0.8, z);
  const brick1L2Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x + 0.5 + 1, 0.4 + 0.8, z),
    shape: brickShape,
  });
  //here
  world.addBody(brick1L2Body);
  brick1L2Body.allowSleep = true;
  //brick2L2.position.set(x - 1, 0.4 + 0.8, z);
  const brick2L2Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x - 1, 0.4 + 0.8, z),
    shape: brickShape,
  });
  world.addBody(brick2L2Body);
  brick2L2Body.allowSleep = true;
  //brick3L2.position.set(x - 1 - 2.5, 0.4 + 0.8, z);
  const brick3L2Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x - 1 - 2.5, 0.4 + 0.8, z),
    shape: brickShape,
  });
  world.addBody(brick3L2Body);
  brick3L2Body.allowSleep = true;

  scene.add(brick, brick2, brick3, brick1L2, brick2L2, brick3L2);
  //sound
  brickBody.addEventListener("collide", playBrickTone1Sound);
  brick2Body.addEventListener("collide", playBrickTone1Sound);
  brick3Body.addEventListener("collide", playBrickTone1Sound);
  brick1L2Body.addEventListener("collide", playBrickTone1Sound);
  brick2L2Body.addEventListener("collide", playBrickTone1Sound);
  brick3L2Body.addEventListener("collide", playBrickTone1Sound);
  // Save in Objects to update
  objectsToUpdate2.push({
    brick: brick,
    brickBody: brickBody,
    brick2: brick2,
    brick2Body: brick2Body,
    brick3: brick3,
    brick3Body: brick3Body,
    brick1L2: brick1L2,
    brick1L2Body: brick1L2Body,
    brick2L2: brick2L2,
    brick2L2Body: brick2L2Body,
    brick3L2: brick3L2,
    brick3L2Body: brick3L2Body,
  });
};

creatCornerWallPart1(2, -20);
creatCornerWallPart1(2, 21);

const creatCornerWallPart2 = (x, z) => {
  const brickOGeometry = new THREE.BoxGeometry(1, 0.8, 2);
  const brickOMaterial = new THREE.MeshStandardMaterial({
    color: "rgb(255, 253, 208)",
  });
  const brick4 = new THREE.Mesh(brickOGeometry, brickOMaterial);
  brick4.position.set(x + 1 + 0.5 + 0.5, 0.4, z + 0.5);

  const brick5 = new THREE.Mesh(brickOGeometry, brickOMaterial);
  brick5.position.set(x + 1 + 0.5 + 0.5, 0.4, z + 0.5 + 0.5 + 2);
  //
  const brick5L2 = new THREE.Mesh(brickOGeometry, brickOMaterial);
  brick5L2.position.set(x + 1 + 0.5 + 0.5, 0.4 + 0.8, z + 0.5 + 0.5 + 2 - 1);
  scene.add(brick4, brick5, brick5L2);
  //
  //phisics
  const brickPart2Shape = new CANNON.Box(
    new CANNON.Vec3(1 * 0.5, 0.8 * 0.5, 2 * 0.5)
  );
  //brick4.position.set(x + 1 + 0.5 + 0.5, 0.4, z + 0.5);
  const brick4Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x + 1 + 0.5 + 0.5, 0.4, z + 0.5),
    shape: brickPart2Shape,
  });
  world.addBody(brick4Body);
  brick4Body.allowSleep = true;
  //brick5.position.set(x + 1 + 0.5 + 0.5, 0.4, z + 0.5 + 0.5 + 2);
  const brick5Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(x + 1 + 0.5 + 0.5, 0.4, z + 0.5 + 0.5 + 2),
    shape: brickPart2Shape,
  });
  world.addBody(brick5Body);
  brick5Body.allowSleep = true;
  //brick5L2.position.set(x + 1 + 0.5 + 0.5, 0.4 + 0.8, z + 0.5 + 0.5 + 2 - 1);
  const brick5L2Body = new CANNON.Body({
    mass: 0.1,
    position: new CANNON.Vec3(
      x + 1 + 0.5 + 0.5,
      0.4 + 0.8,
      z + 0.5 + 0.5 + 2 - 1
    ),
    shape: brickPart2Shape,
  });
  world.addBody(brick5L2Body);
  brick5L2Body.allowSleep = true;
  brick4Body.addEventListener("collide", playBrickTone2Sound);
  brick5Body.addEventListener("collide", playBrickTone2Sound);
  brick5L2Body.addEventListener("collide", playBrickTone2Sound);
  // Save in Objects to update
  objectsToUpdate.push({
    brick4: brick4,
    brick4Body: brick4Body,
    brick5: brick5,
    brick5Body: brick5Body,
    brick5L2: brick5L2,
    brick5L2Body: brick5L2Body,
  });
};

creatCornerWallPart2(2, -20);
creatCornerWallPart2(2, 17);
/**
 * texts Yassine (use it to creat alphabets: Y A S S I N E )
 */
const objectsToUpdate3 = [];
const creatAlphabets = (x, z, path) => {
  gltfLoader.load(path, (gltf) => {
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.rotation.y = -Math.PI * 0.5;
    gltf.scene.position.y = -1;
    //scene.add(gltf.scene);
    let alphabet = new THREE.Group();
    scene.add(alphabet);
    alphabet.add(gltf.scene);
    alphabet.position.x = x;
    alphabet.position.z = z;

    //
    const textShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.9, 0.7));
    const textBody = new CANNON.Body({
      mass: 0.1,
      position: new CANNON.Vec3(x, 0.9, z),
      shape: textShape,
    });
    world.addBody(textBody);
    textBody.addEventListener("collide", playHitSound);
    textBody.allowSleep = true;
    objectsToUpdate3.push({
      alphabet: alphabet,
      textBody: textBody,
    });
    //let alphabet = null
  });
};
creatAlphabets(-10, -6, "/models/alphabets/textY.glb");
creatAlphabets(-10, -4, "/models/alphabets/textA.glb");
creatAlphabets(-10, -2, "/models/alphabets/textS.glb");
creatAlphabets(-10, 0, "/models/alphabets/textS.glb");
creatAlphabets(-10, 2, "/models/alphabets/textI.glb");
creatAlphabets(-10, 4, "/models/alphabets/textN.glb");
creatAlphabets(-10, 6, "/models/alphabets/textE.glb");
/**
 * Keys
 */
gltfLoader.load("/models/keys/keys.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.6, 0.6, 0.6);
  gltf.scene.position.set(-6, 0, 13);
  gltf.scene.rotation.y = Math.PI * 0.5;
});
const keyBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, 0, 0),
});
const keyshape1 = new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1.8));
keyBody.addShape(keyshape1, new CANNON.Vec3(-6, 0.25, 13));
const keyshape2 = new CANNON.Box(new CANNON.Vec3(0.6, 0.25, 0.6));
keyBody.addShape(keyshape2, new CANNON.Vec3(-4.8, 0.25, 13));
world.addBody(keyBody);
keyBody.addEventListener("collide", playCarHitSound);
/**
 * Zone 2
 */

gltfLoader.load("/models/ads/treeAds.glb", (gltf) => {
  scene.add(gltf.scene);
  //gltf.scene.scale.set(1, 0.6, 0.6);
  gltf.scene.position.set(-22, 0, 47);
  gltf.scene.rotation.y = Math.PI * 0.5;
});
const tabsShape = new CANNON.Box(new CANNON.Vec3(0.1, 2.3, 3.7));
const tab1Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-22, 2.3, 33.3),
  shape: tabsShape,
});
world.addBody(tab1Body);
tab1Body.addEventListener("collide", playCarHitSound);
//
const tab2Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-22, 2.3, 47),
  shape: tabsShape,
});
world.addBody(tab2Body);
tab2Body.addEventListener("collide", playCarHitSound);
//
const tab3Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-22, 2.3, 60.8),
  shape: tabsShape,
});
world.addBody(tab3Body);
tab3Body.addEventListener("collide", playCarHitSound);
// fox
let mixer = null;
gltfLoader.load("/models/Fox/glTF/Fox.gltf", (gltf) => {
  gltf.scene.scale.set(0.03, 0.03, 0.03);
  gltf.scene.position.set(-25, 0, 72);
  gltf.scene.rotation.y = -Math.PI * 0.5;
  scene.add(gltf.scene);

  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[2]);
  action.play();
});
const FoxShape = new CANNON.Box(new CANNON.Vec3(1.7, 1, 0.5));
const FoxBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-25, 1, 72),
  shape: FoxShape,
});

world.addBody(FoxBody);
FoxBody.addEventListener("collide", playCarHitSound);

/**
 * Mid Zone
 */

// show my Hobbies

gltfLoader.load("/models/show/show3.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.7, 0.7, 0.7);
  gltf.scene.position.set(-29, 0, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
});
const showShape = new CANNON.Box(new CANNON.Vec3(3.85, 0.6, 3.9));
const showBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-29 + 0.3, 0.6, 1.5),
  shape: showShape,
});
world.addBody(showBody);
showBody.addEventListener("collide", playCarHitSound);
// basketball
let basketBallMesh = null;
gltfLoader.load("/models/baske/basketball.glb", (gltf) => {
  scene.add(gltf.scene);
  //gltf.scene.scale.set(0.7, 0.7, 0.7);
  gltf.scene.position.set(-25.5, 1, -1.2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  basketBallMesh = gltf.scene;
});
// signs
gltfLoader.load("/models/signs/skills.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(-28, -0.3, 15);
  gltf.scene.rotation.y = -Math.PI;
});
const signShape = new CANNON.Box(new CANNON.Vec3(0.25, 3, 0.2));
const skillsBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-28, 3, 15),
  shape: signShape,
});
world.addBody(skillsBody);
skillsBody.addEventListener("collide", playCarHitSound);

//
gltfLoader.load("/models/signs/playground.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(-28, -0.3, -13.2);
  gltf.scene.rotation.y = -Math.PI;
});
const PGBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-28, 3, -13.2),
  shape: signShape,
});
world.addBody(PGBody);
PGBody.addEventListener("collide", playCarHitSound);

//
gltfLoader.load("/models/signs/contacts.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(-43, -0.3, 1.8);
  gltf.scene.rotation.y = -Math.PI;
});
const contactsBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-43, 3, 1.8),
  shape: signShape,
});
world.addBody(contactsBody);
contactsBody.addEventListener("collide", playCarHitSound);

/**
 * Zone 3
 */
//bariers
gltfLoader.load("/models/barier/barierszone.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(-22.5, 0, -47);
  gltf.scene.rotation.y = Math.PI * 0.5;
});
const barierShape = new CANNON.Box(new CANNON.Vec3(0.3, 0.7, 15));
const barier1Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-22.5 - 0.2, 0.7, -47.5),
  shape: barierShape,
});
world.addBody(barier1Body);
barier1Body.addEventListener("collide", playCarHitSound);
const barier2Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-34.5 - 0.2, 0.7, -47.5),
  shape: barierShape,
});
world.addBody(barier2Body);
barier2Body.addEventListener("collide", playCarHitSound);

// Domino 1
let domino1Mesh = null;

gltfLoader.load("/models/domino/domino1.glb", (gltf) => {
  //scene.add(gltf.scene);
  gltf.scene.scale.set(0.8, 0.8, 0.8);
  gltf.scene.position.set(0, -2, 0);
  gltf.scene.rotation.y = -Math.PI;

  domino1Mesh = new THREE.Group();
  scene.add(domino1Mesh);
  domino1Mesh.add(gltf.scene);
  domino1Mesh.position.x = -28.5;
  domino1Mesh.position.z = -40;
  // domino1Mesh.position.y = -2;
});

const domino1Shape = new CANNON.Box(new CANNON.Vec3(1.1, 1.85, 0.25));
const domino1Body = new CANNON.Body({
  mass: 2.1,
  position: new CANNON.Vec3(-28.5 - 0.1, 1.85, -40 - 0.1),
  shape: domino1Shape,
});
world.addBody(domino1Body);
domino1Body.addEventListener("collide", playHitSound);
domino1Body.allowSleep = true;

// Domino 2
let domino2Mesh = null;
gltfLoader.load("/models/domino/domino2.glb", (gltf) => {
  //scene.add(gltf.scene);
  gltf.scene.scale.set(0.8, 0.8, 0.8);
  gltf.scene.position.set(0, -2.5, 0);
  gltf.scene.rotation.y = -Math.PI;
  domino2Mesh = new THREE.Group();
  scene.add(domino2Mesh);
  domino2Mesh.add(gltf.scene);
  domino2Mesh.position.x = -28.5;
  domino2Mesh.position.z = -42;
});
const domino2Shape = new CANNON.Box(new CANNON.Vec3(1.35, 2.35, 0.35));
const domino2Body = new CANNON.Body({
  mass: 2.2,
  position: new CANNON.Vec3(-28.5 - 0.2, 2.35, -42),
  shape: domino2Shape,
});
world.addBody(domino2Body);
domino2Body.allowSleep = true;
domino2Body.addEventListener("collide", playHitSound);

// Domino3
let domino3Mesh = null;
gltfLoader.load("/models/domino/domino3.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.8, 0.8, 0.8);
  gltf.scene.position.set(0, -3, 0);
  gltf.scene.rotation.y = -Math.PI;
  domino3Mesh = new THREE.Group();
  scene.add(domino3Mesh);
  domino3Mesh.add(gltf.scene);
  domino3Mesh.position.x = -28.5;
  domino3Mesh.position.z = -44.5;
});
const domino3Shape = new CANNON.Box(new CANNON.Vec3(1.75, 2.85, 0.45));
const domino3Body = new CANNON.Body({
  mass: 2.3,
  position: new CANNON.Vec3(-28.5 - 0.3, 2.85, -44.5 - 0.05),
  shape: domino3Shape,
});
world.addBody(domino3Body);
domino3Body.allowSleep = true;
domino3Body.addEventListener("collide", playHitSound);

// Domino 4
let domino4Mesh = null;
gltfLoader.load("/models/domino/domino4.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.8, 0.8, 0.8);
  gltf.scene.position.set(0, -3.8, 0);
  gltf.scene.rotation.y = -Math.PI;
  domino4Mesh = new THREE.Group();
  scene.add(domino4Mesh);
  domino4Mesh.add(gltf.scene);
  domino4Mesh.position.x = -28.5;
  domino4Mesh.position.z = -47.5;
});
const domino4Shape = new CANNON.Box(new CANNON.Vec3(2.1, 3.65, 0.55));
const domino4Body = new CANNON.Body({
  mass: 2.2,
  position: new CANNON.Vec3(-28.5, 3.65, -47.5 - 0.1),
  shape: domino4Shape,
});
world.addBody(domino4Body);
domino4Body.allowSleep = true;
domino4Body.addEventListener("collide", playHitSound);

// Domino 5
let domino5Mesh = null;
gltfLoader.load("/models/domino/domino5.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.8, 0.8, 0.8);
  gltf.scene.position.set(0, -4.6, 0);
  gltf.scene.rotation.y = -Math.PI;
  domino5Mesh = new THREE.Group();
  scene.add(domino5Mesh);
  domino5Mesh.add(gltf.scene);
  domino5Mesh.position.x = -28.5;
  domino5Mesh.position.z = -51;
});
const domino5Shape = new CANNON.Box(new CANNON.Vec3(2.75, 4.5, 0.7));
const domino5Body = new CANNON.Body({
  mass: 2.3,
  position: new CANNON.Vec3(-28.5 - 0.2, 4.5, -51 - 0.15),
  shape: domino5Shape,
});
world.addBody(domino5Body);
domino5Body.allowSleep = true;
domino5Body.addEventListener("collide", playHitSound);
//diff
gltfLoader.load("/models/jump/diff.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.5, 0.5, 0.5);
  gltf.scene.position.set(-47, 0, -34);
  gltf.scene.rotation.y = -Math.PI * 0.5;
});
const diffShape = new CANNON.Box(new CANNON.Vec3(2, 1, 2.5));
const diffBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-43.5, -0.2, -33.6),
  shape: diffShape,
});
diffBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.1);
world.addBody(diffBody);
diffBody.addEventListener("collide", playCarHitSound);
//
const diff2Body = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-51, -0.2, -33.6),
  shape: diffShape,
});
diff2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI * 0.1);
world.addBody(diff2Body);
diff2Body.addEventListener("collide", playCarHitSound);

/**
 * zone 4
 */
gltfLoader.load("/models/location/position.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(-60, 0, -5);
  gltf.scene.rotation.y = Math.PI * 0.5;
});
const positionShape = new CANNON.Box(new CANNON.Vec3(0.9, 1.5, 0.15));
const positionBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-57.8, 1.5, -5.6),
  shape: positionShape,
});
positionBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(0, 1, 0),
  Math.PI * 0.4
);
world.addBody(positionBody);
positionBody.addEventListener("collide", playCarHitSound);
//flag
const flagShape = new CANNON.Box(new CANNON.Vec3(0.1, 3, 0.1));
const flagBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-60, 3, -5),
  shape: flagShape,
});
world.addBody(flagBody);
flagBody.addEventListener("collide", playCarHitSound);
//
gltfLoader.load("/models/hamburg/church.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(0.4, 0.4, 0.4);
  gltf.scene.position.set(-62, -0.3, -9);
  gltf.scene.rotation.y = Math.PI * 0.5;
});
const churchShape = new CANNON.Box(new CANNON.Vec3(1.3, 1.2, 2));
const churchBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-62, 1.2, -8.8),
  shape: churchShape,
});
world.addBody(churchBody);
churchBody.addEventListener("collide", playCarHitSound);
//
let hamburgMesh = null;
gltfLoader.load("/models/hamburg/hamburg.glb", (gltf) => {
  //scene.add(gltf.scene);
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.position.set(0, -0.5, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  hamburgMesh = new THREE.Group();
  scene.add(hamburgMesh);
  hamburgMesh.add(gltf.scene);
  domino5Mesh.position.x = -62;
  domino5Mesh.position.z = -4;
});
const hamburgShape = new CANNON.Box(new CANNON.Vec3(4.37, 0.8, 0.45));
const hamburgBody = new CANNON.Body({
  mass: 0.1,
  position: new CANNON.Vec3(-62, 0.8, -4),
  shape: hamburgShape,
});
world.addBody(hamburgBody);
hamburgBody.addEventListener("collide", playHitSound);

//
gltfLoader.load("/models/hamburg/pc.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.scale.set(1.2, 1.2, 1.2);
  gltf.scene.position.set(-70, 0, 3);
  gltf.scene.rotation.y = Math.PI * 0.25;
});
const pcShape = new CANNON.Box(new CANNON.Vec3(3.3, 2, 2.5));
const pcBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(-70.1, 2, 2.8),
  shape: pcShape,
});
pcBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI * 0.25);
world.addBody(pcBody);
pcBody.addEventListener("collide", playCarHitSound);
//
const pointLight = new THREE.PointLight("white", 8.5, 11.7, 0);
pointLight.position.set(-70, 0, 3);
scene.add(pointLight);
gui
  .add(pointLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("pointLight light intensity :");
gui
  .add(pointLight, "distance")
  .min(0)
  .max(30)
  .step(0.1)
  .name("pointLight light distance :");

gui
  .add(pointLight, "decay")
  .min(0)
  .max(3)
  .step(0.001)
  .name("pointLight light decay :");
const pointLight2 = new THREE.PointLight("white", 8.5, 11.7, 0);
pointLight2.position.set(-74, 0.3, 2.8);
scene.add(pointLight2);

/**
 * Lights
 */
// Ambiant light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
scene.add(ambientLight);
gui
  .add(ambientLight, "intensity")
  .min(0)
  .max(3)
  .step(0.001)
  .name("Ambient light intensity :");

//Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);

directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(3)
  .step(0.001)
  .name("Directional light intensity :");

// Helpers

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
//scene.add(directionalLightHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  600
);
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#DAA06D");

//

/**
 * Animate
 */

const cannonDebugger = new CannonDebugger(scene, world);
const clock = new THREE.Clock();
let lastElapsedTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;
  world.step(1 / 60, deltaTime, 3);
  // in case : settings
  //Update world of phisics
  //world.fixedStep();

  if (car) {
    car.position.copy(carBody.position);
    car.quaternion.copy(carBody.quaternion);
  }
  //Update the denugger for Cannon ( to see phisics world )
  //cannonDebugger.update();

  // sign
  if (mixer) {
    mixer.update(deltaTime);
  }

  //loop
  for (const object of objectsToUpdate) {
    object.brick4.position.copy(object.brick4Body.position);
    object.brick4.quaternion.copy(object.brick4Body.quaternion);
    object.brick5.position.copy(object.brick5Body.position);
    object.brick5.quaternion.copy(object.brick5Body.quaternion);
    object.brick5L2.position.copy(object.brick5L2Body.position);
    object.brick5L2.quaternion.copy(object.brick5L2Body.quaternion);
  }
  for (const object of objectsToUpdate2) {
    //part1
    object.brick.position.copy(object.brickBody.position);
    object.brick.quaternion.copy(object.brickBody.quaternion);
    object.brick2.position.copy(object.brick2Body.position);
    object.brick2.quaternion.copy(object.brick2Body.quaternion);
    object.brick3.position.copy(object.brick3Body.position);
    object.brick3.quaternion.copy(object.brick3Body.quaternion);

    object.brick1L2.position.copy(object.brick1L2Body.position);
    object.brick1L2.quaternion.copy(object.brick1L2Body.quaternion);

    object.brick2L2.position.copy(object.brick2L2Body.position);
    object.brick2L2.quaternion.copy(object.brick2L2Body.quaternion);

    object.brick3L2.position.copy(object.brick3L2Body.position);
    object.brick3L2.quaternion.copy(object.brick3L2Body.quaternion);
  }
  for (const object of objectsToUpdate3) {
    object.alphabet.position.copy(object.textBody.position);
    object.alphabet.quaternion.copy(object.textBody.quaternion);
  }
  if (basketBallMesh) {
    basketBallMesh.position.y = 3.05 + Math.sin(elapsedTime * 2) * 2;
  }
  if (domino1Mesh) {
    domino1Mesh.position.copy(domino1Body.position);
    domino1Mesh.quaternion.copy(domino1Body.quaternion);
  }
  if (domino2Mesh) {
    domino2Mesh.position.copy(domino2Body.position);
    domino2Mesh.quaternion.copy(domino2Body.quaternion);
  }
  if (domino3Mesh) {
    domino3Mesh.position.copy(domino3Body.position);
    domino3Mesh.quaternion.copy(domino3Body.quaternion);
  }
  if (domino4Mesh) {
    domino4Mesh.position.copy(domino4Body.position);
    domino4Mesh.quaternion.copy(domino4Body.quaternion);
  }
  if (domino5Mesh) {
    domino5Mesh.position.copy(domino5Body.position);
    domino5Mesh.quaternion.copy(domino5Body.quaternion);
  }
  if (hamburgMesh) {
    hamburgMesh.position.copy(hamburgBody.position);
    hamburgMesh.quaternion.copy(hamburgBody.quaternion);
  }
  // camera
  if (car) {
    camera.position.z = car.position.z + 5;
    camera.position.x = car.position.x - 14;
    camera.position.y = car.position.y + 10;
    camera.lookAt(car.position);
  }

  // Update controls
  //controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
