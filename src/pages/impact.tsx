import Canvas from '@/components/Canvas'
import { impact } from '@/shaders'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const defaultColor1 = new Vector4(1, 0.1, 0, 1)
const defaultColor2 = new Vector4(1, 0.6, 0, 1)
const defaultDuration = 0.7
const Scene = () => {
  const totalAnimationTime = useRef(0)
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const [{ scale, color1, color2, duration, time, autoplay }, setControls] =
    useControls(() => ({
      scale: { value: 1, min: 0, max: 100, step: 0.1 },
      time: { value: 0, min: 0, max: 1, step: 0.01 },
      color1: {
        value: {
          r: defaultColor1.x * 255,
          g: defaultColor1.y * 255,
          b: defaultColor1.z * 255,
          a: defaultColor1.w,
        },
      },
      color2: {
        value: {
          r: defaultColor2.x * 255,
          g: defaultColor2.y * 255,
          b: defaultColor2.z * 255,
          a: defaultColor2.w,
        },
      },
      duration: { value: defaultDuration, min: 0, max: 3, step: 0.1 },
      autoplay: { value: false },
    }))

  const { uniforms, nodes } = useMemo(
    () =>
      impact({
        scale: 10,
        time: 0,
        duration: defaultDuration,
        color1: defaultColor1,
        color2: defaultColor2,
      }),
    []
  )

  useFrame((_, delta) => {
    if (!autoplay) return

    totalAnimationTime.current += delta
    const normalizedTime = (totalAnimationTime.current % duration) / duration
    uniforms.time.value = normalizedTime
    if (autoplay) {
      setControls({ time: normalizedTime })
    }
  })

  uniforms.time.value = time
  uniforms.scale.value = scale
  uniforms.color1.value.x = color1.r / 255
  uniforms.color1.value.y = color1.g / 255
  uniforms.color1.value.z = color1.b / 255
  uniforms.color1.value.w = color1.a
  uniforms.color2.value.x = color2.r / 255
  uniforms.color2.value.y = color2.g / 255
  uniforms.color2.value.z = color2.b / 255
  uniforms.color2.value.w = color2.a

  return (
    <mesh scale={5}>
      <planeGeometry />
      <meshBasicNodeMaterial ref={materialRef} {...nodes} transparent />
    </mesh>
  )
}

const ImpactPage = () => (
  <Canvas>
    <Scene />
  </Canvas>
)

export default ImpactPage
