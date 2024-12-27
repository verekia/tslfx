import Canvas from '@/components/Canvas'
import { impact } from '@/shaders'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const defaultColor1 = new Vector4(1, 0.1, 0, 1)
const defaultColor2 = new Vector4(1, 0.6, 0, 1)

const Scene = () => {
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const [
    {
      scale,
      circleColor,
      vesicaColor,
      duration,
      time,
      autoplay,
      vesicaCount,
      circleSizeStart,
      circleSizeEnd,
      circleThickness,
    },
    setControls,
  ] = useControls(() => ({
    circleColor: {
      value: {
        r: defaultColor1.x * 255,
        g: defaultColor1.y * 255,
        b: defaultColor1.z * 255,
        a: defaultColor1.w,
      },
    },
    vesicaColor: {
      value: {
        r: defaultColor2.x * 255,
        g: defaultColor2.y * 255,
        b: defaultColor2.z * 255,
        a: defaultColor2.w,
      },
    },
    vesicaCount: { value: 6, min: 1, max: 15, step: 1 },
    circleSizeStart: { value: 0, min: 0, max: 1, step: 0.01 },
    circleSizeEnd: { value: 0.5, min: 0, max: 1, step: 0.01 },
    circleThickness: { value: 0.07, min: 0, max: 1, step: 0.01 },
    scale: { value: 1, min: 0, max: 100, step: 0.1 },
    time: { value: 0, min: 0, max: 1, step: 0.01 },
    duration: { value: 0.5, min: 0, max: 3, step: 0.1 },
    autoplay: { value: false },
  }))

  const { uniforms, nodes } = useMemo(
    () =>
      impact({
        scale: 10,
        time: 0,
        duration,
        circleColor: defaultColor1,
        vesicaColor: defaultColor2,
        vesicaCount,
        circleSizeStart,
        circleSizeEnd,
        circleThickness,
      }),
    [vesicaCount]
  )

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true
    }
  }, [vesicaCount])

  useFrame((_, delta) => {
    if (!autoplay) return

    uniforms.time.value += delta / duration

    if (uniforms.time.value > 1) {
      uniforms.seed.value = Math.round(Math.random() * 1000)
      uniforms.time.value = 0
    }

    if (autoplay) {
      setControls({ time: uniforms.time.value })
    }
  })

  uniforms.time.value = time
  uniforms.scale.value = scale
  uniforms.circleColor.value.x = circleColor.r / 255
  uniforms.circleColor.value.y = circleColor.g / 255
  uniforms.circleColor.value.z = circleColor.b / 255
  uniforms.circleColor.value.w = circleColor.a
  uniforms.vesicaColor.value.x = vesicaColor.r / 255
  uniforms.vesicaColor.value.y = vesicaColor.g / 255
  uniforms.vesicaColor.value.z = vesicaColor.b / 255
  uniforms.vesicaColor.value.w = vesicaColor.a
  uniforms.circleSizeStart.value = circleSizeStart
  uniforms.circleSizeEnd.value = circleSizeEnd
  uniforms.circleThickness.value = circleThickness

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
