import Canvas from '@/components/Canvas'
import { simplexNoise2D } from '@/shaders/simplex2d'
import { useControls } from 'leva'
import { useMemo } from 'react'

const Scene = () => {
  const simplex2DShader = useMemo(() => simplexNoise2D({ scale: 20 }), [])

  const { scale } = useControls({
    scale: { value: 20, min: 0, max: 40, step: 0.1 },
  })

  simplex2DShader.uniforms.scale.value = scale

  return (
    <mesh scale={5}>
      <planeGeometry />
      <meshBasicNodeMaterial {...simplex2DShader.nodes} />
    </mesh>
  )
}

const SimplexPage = () => (
  <Canvas>
    <Scene />
  </Canvas>
)

export default SimplexPage
