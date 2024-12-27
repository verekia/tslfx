import Page from '@/components/Page'
import { water } from '@/shaders/water'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const WaterMaterial = () => {
  const totalAnimationTime = useRef(0)
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const { scale, speed, color1, color2, octaves } = useControls({
    scale: { value: 8, min: 0, max: 100, step: 0.1 },
    speed: { value: 2, min: -5, max: 5, step: 0.1 },
    color1: { value: { r: 56, g: 149, b: 255, a: 1 } },
    color2: { value: { r: 0, g: 73, b: 255, a: 1 } },
    octaves: { value: 0, min: 0, max: 7, step: 1 },
  })

  const waterShader = useMemo(
    () =>
      water({
        scale: 10,
        time: 0,
        color1: new Vector4(0, 0, 0, 1),
        color2: new Vector4(1, 1, 1, 1),
        octaves,
      }),
    [octaves]
  )

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true
    }
  }, [octaves])

  useFrame((_, delta) => {
    totalAnimationTime.current += delta * speed
    waterShader.uniforms.time.value = totalAnimationTime.current
  })

  waterShader.uniforms.scale.value = scale
  waterShader.uniforms.color1.value.x = color1.r / 255
  waterShader.uniforms.color1.value.y = color1.g / 255
  waterShader.uniforms.color1.value.z = color1.b / 255
  waterShader.uniforms.color1.value.w = color1.a
  waterShader.uniforms.color2.value.x = color2.r / 255
  waterShader.uniforms.color2.value.y = color2.g / 255
  waterShader.uniforms.color2.value.z = color2.b / 255
  waterShader.uniforms.color2.value.w = color2.a

  return (
    <meshBasicNodeMaterial
      ref={materialRef}
      {...waterShader.nodes}
      transparent
    />
  )
}

const WaterPage = () => (
  <Page title="Water">
    <WaterMaterial />
  </Page>
)

export default WaterPage
