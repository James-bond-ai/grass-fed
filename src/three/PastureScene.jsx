// The home page's 3D pasture: rolling hills, wind-blown grass and a floating
// glass dewdrop that refracts the field behind it. Loaded only on capable
// desktops (see mount.jsx); everyone else sees the still poster image.
import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

const HORIZON = new THREE.Color('#f3e7c6');
const SKY_TOP = new THREE.Color('#9cc6dc');
const HAZE = new THREE.Color('#c9d6b4'); // distant hills fade toward this

// Height of the land at (x, z). Gentle swells near the camera, taller hills far away.
export function heightAt(x, z) {
  const far = Math.max(0, -z - 6);
  return (
    0.32 * Math.sin(x * 0.23 + 0.6) +
    0.22 * Math.sin(z * 0.19 + 1.3) +
    0.12 * Math.sin((x + z) * 0.47) +
    far * 0.06 * (1.1 + Math.sin(x * 0.09 + 2.0))
  );
}

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: SKY_TOP }, horizon: { value: HORIZON } },
        vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 horizon; varying vec3 vPos;
          void main(){ float h = normalize(vPos).y; float t = smoothstep(0.0, 0.55, h);
          gl_FragColor = vec4(mix(horizon, top, t), 1.0); }`,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[90, 32, 16]} />
    </mesh>
  );
}

function Sun() {
  return (
    <group position={[-14, 5.5, -85]}>
      <mesh>
        <circleGeometry args={[2.6, 48]} />
        <meshBasicMaterial color="#fffaf0" fog={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[12, 48]} />
        <meshBasicMaterial color="#fde9b8" transparent opacity={0.28} fog={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(140, 120, 220, 180);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const colors = new Float32Array(p.count * 3);
    const a = new THREE.Color('#4f7a32');
    const b = new THREE.Color('#7f9d45');
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i) - 40;
      p.setZ(i, z);
      p.setY(i, heightAt(x, z));
      c.copy(a).lerp(b, 0.5 + 0.5 * Math.sin(x * 0.31 + z * 0.17));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

function Grass({ count }) {
  const ref = useRef();
  const { geometry, material } = useMemo(() => {
    // One blade: a tapered strip, 5 segments tall, bent by the vertex shader.
    const seg = 5;
    const pos = [];
    const uv = [];
    const idx = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const w = 0.022 * (1 - t * 0.95);
      pos.push(-w, t, 0, w, t, 0);
      uv.push(0, t, 1, t);
      if (i < seg) {
        const k = i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);

    const offsets = new Float32Array(count * 3);
    const params = new Float32Array(count * 4); // height, angle, lean, colour seed
    let n = 0;
    while (n < count) {
      // Denser near the camera, thinning toward the hills.
      const z = 5.6 - Math.pow(Math.random(), 1.5) * 26;
      const spread = 5 + (5.6 - z) * 0.8;
      const x = (Math.random() * 2 - 1) * spread;
      offsets.set([x, heightAt(x, z) - 0.02, z], n * 3);
      params.set([0.2 + Math.random() * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5, Math.random()], n * 4);
      n++;
    }
    g.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    g.setAttribute('aParams', new THREE.InstancedBufferAttribute(params, 4));
    g.instanceCount = count;

    const m = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: HAZE },
        uLight: { value: new THREE.Vector3(-0.5, 0.6, -0.4).normalize() },
      },
      vertexShader: `
        attribute vec3 aOffset; attribute vec4 aParams;
        uniform float uTime;
        varying float vT; varying float vSeed; varying float vFog;
        void main(){
          float h = aParams.x; float ang = aParams.y; float lean = aParams.z;
          vec3 p = position; p.y *= h;
          float c = cos(ang), s = sin(ang);
          p = vec3(p.x * c, p.y, p.x * s);
          float t = position.y;
          float gust = sin(uTime * 0.7 + aOffset.x * 0.15 + aOffset.z * 0.1) * 0.5 + 0.5;
          float wind = sin(uTime * 1.9 + aOffset.x * 0.7 + aOffset.z * 0.45) * (0.07 + 0.11 * gust);
          p.x += (wind + lean * 0.25) * t * t * h;
          p.z += (lean * 0.15 + wind * 0.4) * t * t * h;
          vec4 mv = modelViewMatrix * vec4(p + aOffset, 1.0);
          vT = t; vSeed = aParams.w;
          vFog = smoothstep(12.0, 40.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uFogColor;
        varying float vT; varying float vSeed; varying float vFog;
        void main(){
          vec3 base = mix(vec3(0.16,0.30,0.12), vec3(0.22,0.36,0.14), vSeed);
          vec3 tip = mix(vec3(0.56,0.70,0.30), vec3(0.83,0.77,0.42), smoothstep(0.55, 1.0, vSeed));
          vec3 col = mix(base, tip, smoothstep(0.0, 1.0, vT));
          col += vec3(0.10,0.08,0.02) * pow(vT, 3.0);
          gl_FragColor = vec4(mix(col, uFogColor, vFog * 0.6), 1.0);
        }`,
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((_, dt) => {
    material.uniforms.uTime.value += Math.min(dt, 0.05);
  });
  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

function Dewdrop({ low }) {
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6} floatingRange={[-0.08, 0.12]}>
      <mesh position={[1.9, 1.25, 2.6]} scale={[0.42, 0.47, 0.42]}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          samples={low ? 4 : 8}
          resolution={low ? 256 : 512}
          transmission={1}
          thickness={0.45}
          roughness={0}
          ior={1.3}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.25}
          distortionScale={0.35}
          temporalDistortion={0.08}
          backside={false}
          color="#ffffff"
        />
      </mesh>
    </Float>
  );
}

// Slow drift plus a small parallax toward the pointer.
function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.95, -6));
  useFrame((state, dt) => {
    const k = 1 - Math.exp(-dt * 1.8);
    const px = state.pointer.x * 0.35;
    const py = state.pointer.y * 0.12;
    camera.position.x += (px - camera.position.x) * k;
    camera.position.y += (1.15 + py - camera.position.y) * k;
    camera.lookAt(target.current);
  });
  return null;
}

export default function PastureScene({ reducedMotion = false, low = false, onReady }) {
  return (
    <Canvas
      dpr={[1, low ? 1.25 : 1.6]}
      camera={{ position: [0, 1.15, 6.2], fov: 42, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
      aria-hidden="true"
    >
      <fog attach="fog" args={[HAZE, 18, 150]} />
      <hemisphereLight args={['#fff4d6', '#3d5a2a', 1.1]} />
      <directionalLight position={[-6, 5, -8]} intensity={1.6} color="#ffe2a8" />
      <Sky />
      <Sun />
      <Ground />
      <Grass count={low ? 11000 : 22000} />
      <Dewdrop low={low} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff1cf" position={[-4, 3, -6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#bfe0f0" position={[3, 6, 2]} scale={[8, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.8} color="#5d8a3a" position={[0, -3, 0]} scale={[20, 20, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
      {!reducedMotion && <CameraRig />}
    </Canvas>
  );
}
