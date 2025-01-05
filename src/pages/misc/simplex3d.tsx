import Page from '@/components/Page'
import { simplexNoise3D } from '@/shaders'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect, useMemo, useRef } from 'react'
import { Vector4 } from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const Simplex3DMaterial = () => {
  const totalAnimationTime = useRef(0)
  const materialRef = useRef<MeshBasicNodeMaterial>(null)

  const { scale, speed, color1, color2, octaves } = useControls({
    scale: { value: 10, min: 0, max: 100, step: 0.1 },
    speed: { value: 1, min: -5, max: 5, step: 0.1 },
    color1: { value: { r: 0, g: 0, b: 0, a: 1 } },
    color2: { value: { r: 255, g: 255, b: 255, a: 1 } },
    octaves: { value: 5, min: 0, max: 7, step: 1 },
  })

  const simplex3DShader = useMemo(
    () =>
      simplexNoise3D({
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
    simplex3DShader.uniforms.time.value = totalAnimationTime.current
  })

  simplex3DShader.uniforms.scale.value = scale
  simplex3DShader.uniforms.color1.value.x = color1.r / 255
  simplex3DShader.uniforms.color1.value.y = color1.g / 255
  simplex3DShader.uniforms.color1.value.z = color1.b / 255
  simplex3DShader.uniforms.color1.value.w = color1.a
  simplex3DShader.uniforms.color2.value.x = color2.r / 255
  simplex3DShader.uniforms.color2.value.y = color2.g / 255
  simplex3DShader.uniforms.color2.value.z = color2.b / 255
  simplex3DShader.uniforms.color2.value.w = color2.a

  return <meshBasicNodeMaterial ref={materialRef} {...simplex3DShader.nodes} transparent />
}

const Simplex3DPage = () => (
  <Page title="Simplex 3D" is2D>
    <Simplex3DMaterial />
  </Page>
)

export default Simplex3DPage
