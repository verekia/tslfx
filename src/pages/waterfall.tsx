import Page from '@/components/Page'
import { useGLTF } from '@react-three/drei'

// @ts-expect-error
import terrainSrc from '@/shaders/waterfall/waterfall.glb'
import { useMemo } from 'react'
import { Mesh } from 'three'
import { waterfall } from '@/shaders/waterfall/waterfall'

const Content = () => {
  const { geometry } = useGLTF(terrainSrc).nodes.waterfall as Mesh

  const { colorNode } = useMemo(() => waterfall({}), [])

  return (
    <>
      <group>
        <mesh geometry={geometry} rotation-y={2.6} position={[1, -0.3, -3]}>
          <meshBasicNodeMaterial colorNode={colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
      </group>
      <directionalLight position={[5, 13, 10]} intensity={3} />
    </>
  )
}

const WaterfallPage = () => (
  <Page title="Waterfall">
    <Content />
  </Page>
)

export default WaterfallPage
