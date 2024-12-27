import Page from '@/components/Page'
import { simplexNoise2D } from '@/shaders/simplex2d'
import { useControls } from 'leva'
import { useMemo } from 'react'

const Simplex2DMaterial = () => {
  const simplex2DShader = useMemo(() => simplexNoise2D({ scale: 20 }), [])

  const { scale } = useControls({
    scale: { value: 20, min: 0, max: 40, step: 0.1 },
  })

  simplex2DShader.uniforms.scale.value = scale

  return <meshBasicNodeMaterial {...simplex2DShader.nodes} />
}

const Simplex2DPage = () => (
  <Page levaProps={{ titleBar: { title: 'TSLFX: Simplex 2D', filter: false } }}>
    <Simplex2DMaterial />
  </Page>
)

export default Simplex2DPage
