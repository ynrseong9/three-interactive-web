import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

window.addEventListener("load", function () {
  init();
});

async function init() {
  const gui = new GUI();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.shadowMap.enabled = true;

  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    500
  );

  camera.position.set(0, 1, 5);

  // Fonrt
  const fontLoader = new FontLoader();

  const font = await fontLoader.loadAsync(
    "./assets/fonts/The Jamsil 3 Regular_Regular.json"
  );

  // Text
  const textGeometry = new TextGeometry("Three.js Interactive Web", {
    font,
    size: 0.5,
    height: 0.1,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  const textMaterial = new THREE.MeshPhongMaterial();

  const text = new THREE.Mesh(textGeometry, textMaterial);

  text.castShadow = true;

  // textGeometry.computeBoundingBox();
  // textGeometry.translate(
  //   -(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) * 0.5,
  //   -(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y) * 0.5,
  //   -(textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z) * 0.5
  // );
  textGeometry.center();

  const textureLoader = new THREE.TextureLoader().setPath("./assets/textures/");

  const textTexture = textureLoader.load("holographic.jpeg");

  textMaterial.map = textTexture;

  scene.add(text);

  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  plane.position.z = -10;
  plane.receiveShadow = true;

  scene.add(plane);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(
    0xffffff,
    2.5,
    30,
    Math.PI * 0.15,
    0.2,
    0.5
  );

  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.radius = 10;

  spotLight.position.set(0, 0, 3);
  spotLight.target.position.set(0, 0, -3);

  const spotLightTexture = textureLoader.load("gradient.jpg");

  spotLight.map = spotLightTexture;

  scene.add(spotLight, spotLight.target);

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 5;
    const y = -(event.clientY / window.innerHeight - 0.5) * 5;

    spotLight.target.position.set(x, y, -3);
  });

  const spotLightFolder = gui.addFolder("SpotLight");

  spotLightFolder
    .add(spotLight, "angle")
    .min(0)
    .max(Math.PI / 2)
    .step(0.01);

  spotLightFolder
    .add(spotLight.position, "z")
    .min(1)
    .max(10)
    .step(0.01)
    .name("position.z");

  spotLightFolder.add(spotLight, "decay").min(0).max(10).step(0.01);

  spotLightFolder.add(spotLight, "distance").min(1).max(30).step(0.01);

  spotLightFolder.add(spotLight, "penumbra").min(0).max(1).step(0.01);

  spotLightFolder
    .add(spotLight.shadow, "radius")
    .min(1)
    .max(20)
    .step(0.01)
    .name("shadow.radius");

  new OrbitControls(camera, renderer.domElement);

  // Effects
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);

  composer.addPass(renderPass);

  const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,
    1,
    0
  );

  composer.addPass(unrealBloomPass);

  const unrealBloomPassFolder = gui.addFolder("UnrealBloomPass");

  unrealBloomPassFolder
    .add(unrealBloomPass, "strength")
    .min(0)
    .max(3)
    .step(0.01);

  unrealBloomPassFolder.add(unrealBloomPass, "radius").min(0).max(1).step(0.01);

  unrealBloomPassFolder
    .add(unrealBloomPass, "threshold")
    .min(0)
    .max(1)
    .step(0.01);

  render();

  function render() {
    composer.render();

    requestAnimationFrame(render);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", handleResize);
}
