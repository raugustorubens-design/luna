import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function LunaOrbCore({ state = "idle" }) {
  const mountRef = useRef(null)

  // refs persistentes (evita recriar tudo)
  const rendererRef = useRef(null)
  const materialRef = useRef(null)
  const animationRef = useRef(null)
  const stateRef = useRef(state)

  // mantém estado atualizado sem recriar useEffect
  stateRef.current = state

  useEffect(() => {
    if (!mountRef.current) return

    // SCENE
    const scene = new THREE.Scene()

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 2.5

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(400, 400)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    rendererRef.current = renderer

    // GEOMETRY
    const geometry = new THREE.SphereGeometry(1, 64, 64)

    // MATERIAL
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 1.0 },
        colorShift: { value: new THREE.Color(0x2266ff) },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;

        uniform float time;
        uniform float intensity;
        uniform vec3 colorShift;

        void main() {
          vec2 uv = vUv - 0.5;

          float r = length(uv);
          float a = atan(uv.y, uv.x);

          // swirl base (seu estilo)
          float swirl = sin(10.0 * r - time * 2.0 + a * 2.0);

          // glow controlado
          float glow = 0.15 / (r + 0.1);

          // leve profundidade
          float depth = sin(r * 20.0 - time) * 0.1;

          float energy = swirl + glow + depth;

          vec3 color = colorShift * energy * intensity;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    })

    materialRef.current = material

    const orb = new THREE.Mesh(geometry, material)
    scene.add(orb)

    let speed = 0.01

    // ANIMAÇÃO
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      const currentState = stateRef.current

      // comportamento por estado
      if (currentState === "thinking") {
        speed = 0.02
        material.uniforms.intensity.value = 1.2
        material.uniforms.colorShift.value.set(0x3399ff)
      } else if (currentState === "responding") {
        speed = 0.04
        material.uniforms.intensity.value = 1.8
        material.uniforms.colorShift.value.set(0x00ccff)
      } else if (currentState === "alert") {
        speed = 0.08
        material.uniforms.intensity.value = 2.2
        material.uniforms.colorShift.value.set(0xff3355)
      } else {
        speed = 0.01
        material.uniforms.intensity.value = 1.0
        material.uniforms.colorShift.value.set(0x2266ff)
      }

      material.uniforms.time.value += speed

      // leve rotação (vida)
      orb.rotation.y += 0.002

      renderer.render(scene, camera)
    }

    animate()

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationRef.current)

      geometry.dispose()
      material.dispose()
      renderer.dispose()

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: "400px",
        height: "400px",
        margin: "0 auto",
      }}
    />
  )
}