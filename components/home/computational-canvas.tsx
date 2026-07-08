"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { createNoise3D } from "simplex-noise"

/* ═══════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════ */

const TERRAIN_W = 16
const TERRAIN_D = 14
const SEG_W = 72
const SEG_D = 64

// Noise octaves
const N = { s1: 0.2, s2: 0.5, t1: 0.06, t2: 0.1, a1: 0.5, a2: 0.12 }

// Theme accent - defaults to gold but updates via DOM
const A = { r: 0.831, g: 0.686, b: 0.216 }

// Shared noise seed — all components produce consistent terrain
const noise = createNoise3D()

/* ═══════════════════════════════════════════════════════════════════
   INFRASTRUCTURE NODE GRAPH
   ═══════════════════════════════════════════════════════════════════ */

// Each node stores [x, z]. The y (height) is computed from terrain.
const NODES: [number, number][] = [
  // Row 1 — top
  [-5.5, -5.0], [-3.5, -5.2], [-1.5, -4.5], [0.5, -5.0], [2.5, -4.5], [4.5, -5.2],
  // Row 2
  [-6.0, -2.5], [-4.0, -2.0], [-2.0, -2.8], [0.0, -2.0], [2.0, -2.5], [3.5, -1.8], [5.5, -2.5],
  // Row 3 — centre
  [-5.0, 0.0], [-2.8, 0.5], [-0.5, -0.2], [1.0, 0.3], [3.0, -0.3], [5.0, 0.2],
  // Row 4
  [-6.0, 2.2], [-3.5, 2.8], [-1.2, 2.0], [0.8, 2.5], [2.5, 2.0], [4.5, 2.8], [6.0, 2.0],
  // Row 5 — bottom
  [-5.0, 4.5], [-2.5, 4.2], [0.0, 4.8], [2.0, 4.0], [3.5, 4.5], [5.5, 4.0],
  // Extra scatter for density
  [-1.0, -1.0], [1.2, 1.0], [-3.5, 1.2], [2.5, -0.8], [0.0, 0.8],
]

function buildEdges(maxDist = 2.8): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < NODES.length; i++)
    for (let j = i + 1; j < NODES.length; j++) {
      const dx = NODES[i][0] - NODES[j][0]
      const dz = NODES[i][1] - NODES[j][1]
      if (Math.sqrt(dx * dx + dz * dz) < maxDist) out.push([i, j])
    }
  return out
}
const EDGES = buildEdges()

/* ═══════════════════════════════════════════════════════════════════
   ENGINEERING CONCEPT LABELS
   ═══════════════════════════════════════════════════════════════════ */

const LABELS = [
  { text: "TERRAIN",           x: -4.0, z: -4.0, delay: 0 },
  { text: "TOPOLOGY",          x: 3.5,  z: -3.5, delay: 4 },
  { text: "DIGITAL TWIN",      x: 0.0,  z: -1.0, delay: 8 },
  { text: "INFRASTRUCTURE",    x: -3.0, z: 1.5,  delay: 12 },
  { text: "COMPUTE GRID",      x: 4.0,  z: 1.5,  delay: 16 },
  { text: "SIMULATION",        x: -1.5, z: 3.5,  delay: 20 },
  { text: "SENSOR NETWORK",    x: 2.0,  z: 3.0,  delay: 24 },
  { text: "NODE",              x: -5.0, z: -0.5, delay: 28 },
  { text: "STRUCTURAL DATA",   x: 1.0,  z: -3.0, delay: 32 },
]

/* ═══════════════════════════════════════════════════════════════════
   SHARED TERRAIN HEIGHT
   ═══════════════════════════════════════════════════════════════════ */

function th(x: number, z: number, t: number): number {
  return (
    noise(x * N.s1, z * N.s1, t * N.t1) * N.a1 +
    noise(x * N.s2, z * N.s2, t * N.t2) * N.a2
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CAMERA RIG — scroll-driven parallax & ambient drift
   ═══════════════════════════════════════════════════════════════════ */

function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(-1, 0, 0), [])
  const scrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      // Normalize scroll (0 at top, ~1 at bottom depending on page height)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollY.current = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // init
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useFrame(({ camera, clock }) => {
    if (typeof document !== "undefined" && document.hidden) return
    const isOutOfView = typeof window !== "undefined" && window.scrollY > (window.innerHeight * 0.95)
    if (isOutOfView) return

    const t = clock.getElapsedTime()
    const s = scrollY.current // 0 to 1

    // Base position (Hero)
    const baseX = Math.sin(t * 0.035) * 0.4
    const baseY = 5.5 + Math.sin(t * 0.025) * 0.2
    const baseZ = 9 + Math.cos(t * 0.02) * 0.3

    // Scroll modifiers
    // As we scroll down (s -> 1), fly forward (Z decreases) and drop slightly (Y decreases), 
    // and shift right (X increases) to fly *through* the node cluster.
    const scrollZOffset = s * -6.0 
    const scrollYOffset = s * -1.5
    const scrollXOffset = s * 2.5

    camera.position.x = baseX + scrollXOffset
    camera.position.y = baseY + scrollYOffset
    camera.position.z = baseZ + scrollZOffset

    // Target shifts slightly as we fly forward to keep interesting nodes in view
    target.set(-1 + s * 2, 0, s * -2)
    camera.lookAt(target)
  })

  return null
}

/* ═══════════════════════════════════════════════════════════════════
   MOUSE → WORLD-SPACE TRACKER
   ═══════════════════════════════════════════════════════════════════ */

function useMouseWorld() {
  const world = useRef(new THREE.Vector3(0, 0, 3))
  const hovering = useRef(true)
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const rc = useMemo(() => new THREE.Raycaster(), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const idle = useMemo(() => new THREE.Vector3(), [])
  const { gl } = useThree()

  useEffect(() => {
    const el = gl.domElement
    const onEnter = () => { hovering.current = true }
    const onLeave = () => { hovering.current = false }
    el.addEventListener("pointerenter", onEnter)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointerenter", onEnter)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [gl])

  useFrame(({ camera, pointer, clock }) => {
    if (typeof document !== "undefined" && document.hidden) return
    const isOutOfView = typeof window !== "undefined" && window.scrollY > (window.innerHeight * 0.95)
    if (isOutOfView) return

    rc.setFromCamera(pointer, camera)
    if (hovering.current && rc.ray.intersectPlane(plane, hit)) {
      world.current.lerp(hit, 0.06)
    } else {
      const t = clock.getElapsedTime()
      idle.set(Math.sin(t * 0.12) * 3, 0, Math.cos(t * 0.08) * 3)
      world.current.lerp(idle, 0.015)
    }
  })

  return world
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE CONTENT — hooks live inside <Canvas>
   ═══════════════════════════════════════════════════════════════════ */

function SceneContent() {
  const mouseWorld = useMouseWorld()

  return (
    <>
      <CameraRig />
      <TerrainMesh mouseWorld={mouseWorld} />
      <InfrastructureNetwork mouseWorld={mouseWorld} />
      <FloatingLabels />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TERRAIN MESH — breathing wireframe topography
   ═══════════════════════════════════════════════════════════════════ */

function TerrainMesh({ mouseWorld }: { mouseWorld: React.RefObject<THREE.Vector3> }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_W, TERRAIN_D, SEG_W, SEG_D)
    geo.rotateX(-Math.PI / 2)
    const count = geo.attributes.position.count
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    if (typeof document !== "undefined" && document.hidden) return
    const isOutOfView = typeof window !== "undefined" && window.scrollY > (window.innerHeight * 0.95)
    if (isOutOfView) return

    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const pos = geometry.attributes.position as THREE.BufferAttribute
    const col = geometry.attributes.color as THREE.BufferAttribute
    const mx = mouseWorld.current!.x
    const mz = mouseWorld.current!.z

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      // Terrain deformation
      const h = th(x, z, t)

      // Mouse magnetic attraction
      const dx = x - mx
      const dz = z - mz
      const d2 = dx * dx + dz * dz
      const mh = Math.exp(-d2 / 2.8) * 0.35

      pos.setY(i, h + mh)

      // Vertex colour — dim amber base, brighter near cursor
      const prox = Math.max(0, 1 - Math.sqrt(d2) / 2.8)
      const b = 0.035 + prox * 0.45
      col.setXYZ(i, A.r * b, A.g * b, A.b * b)
    }

    pos.needsUpdate = true
    col.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial wireframe vertexColors transparent opacity={0.85} />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   INFRASTRUCTURE NETWORK — nodes, connections, flow pulses
   ═══════════════════════════════════════════════════════════════════ */

function InfrastructureNetwork({ mouseWorld }: { mouseWorld: React.RefObject<THREE.Vector3> }) {
  const instRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])

  // Line-segment buffers
  const lPos = useMemo(() => new Float32Array(EDGES.length * 6), [])
  const lCol = useMemo(() => new Float32Array(EDGES.length * 6), [])
  const lGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(lPos, 3))
    g.setAttribute("color", new THREE.BufferAttribute(lCol, 3))
    return g
  }, [lPos, lCol])

  // Flow-particle buffers (one particle per edge)
  const fPos = useMemo(() => new Float32Array(EDGES.length * 3), [])
  const fCol = useMemo(() => new Float32Array(EDGES.length * 3), [])
  const fProg = useMemo(() => {
    const a = new Float32Array(EDGES.length)
    for (let i = 0; i < a.length; i++) a[i] = Math.random()
    return a
  }, [])
  const fGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(fPos, 3))
    g.setAttribute("color", new THREE.BufferAttribute(fCol, 3))
    return g
  }, [fPos, fCol])

  useFrame(({ clock }) => {
    if (typeof document !== "undefined" && document.hidden) return
    const isOutOfView = typeof window !== "undefined" && window.scrollY > (window.innerHeight * 0.95)
    if (isOutOfView) return

    const t = clock.getElapsedTime()
    const mx = mouseWorld.current!.x
    const mz = mouseWorld.current!.z

    // ── Compute world-space node positions ──
    const wy: number[] = []

    NODES.forEach(([nx, nz], i) => {
      const h = th(nx, nz, t)
      const ddx = nx - mx
      const ddz = nz - mz
      const d2 = ddx * ddx + ddz * ddz
      const mh = Math.exp(-d2 / 2.8) * 0.35
      const y = h + mh + 0.05
      wy.push(y)

      if (instRef.current) {
        const prox = Math.max(0, 1 - Math.sqrt(d2) / 2.8)
        const pulse = 1 + Math.sin(t * 0.5 + i * 0.8) * 0.1
        const s = (0.04 + prox * 0.06) * pulse

        dummy.position.set(nx, y, nz)
        dummy.scale.setScalar(s / 0.05) // normalise by geometry radius
        dummy.updateMatrix()
        instRef.current.setMatrixAt(i, dummy.matrix)

        const bri = 0.15 + prox * 0.85
        col.setRGB(A.r * bri, A.g * bri, A.b * bri)
        instRef.current.setColorAt(i, col)
      }
    })

    if (instRef.current) {
      instRef.current.instanceMatrix.needsUpdate = true
      if (instRef.current.instanceColor) instRef.current.instanceColor.needsUpdate = true
    }

    // ── Update connection lines & flow particles ──
    EDGES.forEach(([a, b], i) => {
      const ax = NODES[a][0], az = NODES[a][1], ay = wy[a]
      const bx = NODES[b][0], bz = NODES[b][1], by = wy[b]

      // Lines
      const li = i * 6
      lPos[li] = ax; lPos[li + 1] = ay; lPos[li + 2] = az
      lPos[li + 3] = bx; lPos[li + 4] = by; lPos[li + 5] = bz

      const midDist = Math.sqrt(((ax + bx) / 2 - mx) ** 2 + ((az + bz) / 2 - mz) ** 2)
      const prox = Math.max(0, 1 - midDist / 2.8)
      const bri = 0.02 + prox * 0.3
      for (let k = 0; k < 6; k += 3) {
        lCol[li + k]     = A.r * bri
        lCol[li + k + 1] = A.g * bri
        lCol[li + k + 2] = A.b * bri
      }

      // Flow pulses — slow, like optical fibre
      fProg[i] = (fProg[i] + 0.001 * (0.6 + Math.sin(i * 1.7) * 0.4)) % 1
      const ft = fProg[i]
      const fx = ax + (bx - ax) * ft
      const fy = ay + (by - ay) * ft + 0.03
      const fz = az + (bz - az) * ft

      const fi = i * 3
      fPos[fi] = fx; fPos[fi + 1] = fy; fPos[fi + 2] = fz

      const fd = Math.sqrt((fx - mx) ** 2 + (fz - mz) ** 2)
      const fp = Math.max(0, 1 - fd / 2.8)
      const fb = 0.1 + fp * 0.9
      fCol[fi]     = A.r * fb
      fCol[fi + 1] = A.g * fb
      fCol[fi + 2] = A.b * fb
    })

    lGeo.attributes.position.needsUpdate = true
    lGeo.attributes.color.needsUpdate = true
    fGeo.attributes.position.needsUpdate = true
    fGeo.attributes.color.needsUpdate = true
  })

  return (
    <group>
      {/* Nodes (instanced for performance) */}
      <instancedMesh ref={instRef} args={[undefined, undefined, NODES.length]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.9} />
      </instancedMesh>

      {/* Connection lines */}
      <lineSegments geometry={lGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </lineSegments>

      {/* Data-flow particles */}
      <points geometry={fGeo}>
        <pointsMaterial vertexColors transparent size={0.07} sizeAttenuation opacity={0.9} />
      </points>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING LABELS — engineering concept annotations
   ═══════════════════════════════════════════════════════════════════ */

function FloatingLabels() {
  const groupRef = useRef<THREE.Group>(null)

  // Create canvas-texture sprites (crisp on HiDPI)
  const textures = useMemo(() => {
    if (typeof document === "undefined") return []
    const dpr = window.devicePixelRatio || 1

    return LABELS.map(({ text }) => {
      const canvas = document.createElement("canvas")
      canvas.width = 512 * dpr
      canvas.height = 48 * dpr
      const ctx = canvas.getContext("2d")!
      ctx.scale(dpr, dpr)

      ctx.clearRect(0, 0, 512, 48)
      ctx.font = "500 13px 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace"
      ctx.fillStyle = "#64748b" // slate-500
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.letterSpacing = "2px"
      ctx.fillText(text, 256, 24)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    })
  }, [])

  useFrame(({ clock }) => {
    if (typeof document !== "undefined" && document.hidden) return
    const isOutOfView = typeof window !== "undefined" && window.scrollY > (window.innerHeight * 0.95)
    if (isOutOfView) return

    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    groupRef.current.children.forEach((child, i) => {
      if (i >= LABELS.length) return
      const label = LABELS[i]

      // Staggered fade cycle (each label visible ~30% of its cycle)
      const cycle = 36
      const raw = (((t - label.delay) % cycle) + cycle) % cycle
      const phase = raw / cycle
      let opacity = 0
      if (phase < 0.08)      opacity = phase / 0.08          // fade in
      else if (phase < 0.25) opacity = 1                     // hold
      else if (phase < 0.35) opacity = 1 - (phase - 0.25) / 0.1 // fade out
      opacity *= 0.3 // max 30% — just barely visible

      // Gentle bob above terrain
      child.position.x = label.x
      child.position.y = th(label.x, label.z, t) + 1.1 + Math.sin(t * 0.2 + i * 2.5) * 0.04
      child.position.z = label.z

      const mat = (child as THREE.Sprite).material as THREE.SpriteMaterial
      if (mat) mat.opacity = opacity
    })
  })

  if (textures.length === 0) return null

  return (
    <group ref={groupRef}>
      {LABELS.map((label, i) => (
        <sprite
          key={i}
          position={[label.x, 1.1, label.z]}
          scale={[2.8, 0.3, 1]}
        >
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORTED CANVAS WRAPPER
   ═══════════════════════════════════════════════════════════════════ */

export function ComputationalCanvas() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Attempt to read global theme variable
    const el = document.documentElement;
    const style = getComputedStyle(el);
    let rgbString = style.getPropertyValue('--theme-accent').trim();
    
    // Fallback to checking body if not found on root element
    if (!rgbString) {
      rgbString = getComputedStyle(document.body).getPropertyValue('--theme-accent').trim();
    }
    
    if (rgbString) {
      // Handles both space-separated and comma-separated RGB values
      const parts = rgbString.split(/[\s,]+/).filter(Boolean).map(s => parseInt(s, 10));
      if (parts.length >= 3 && !isNaN(parts[0])) {
        A.r = parts[0] / 255;
        A.g = parts[1] / 255;
        A.b = parts[2] / 255;
      }
    }
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 5.5, 9], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.setClearColor("#08090b", 1)
      }}

      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <SceneContent />
    </Canvas>
  )
}
