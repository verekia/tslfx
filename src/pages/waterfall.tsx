import Page from '@/components/Page'
import { useGLTF } from '@react-three/drei'

// @ts-expect-error
import terrainSrc from '@/shaders/waterfall/waterfall.glb'
import { useMemo } from 'react'
import { Mesh } from 'three'
import { waterfall } from '@/shaders/waterfall/waterfall'

type Nodes = {
  FallTop: Mesh
  FallBottom: Mesh
  River: Mesh
  ImpactFoam: Mesh
  ImpactWaves: Mesh
  RoundedEdge: Mesh
  Terrain: Mesh
}

const Content = () => {
  const { FallBottom, FallTop, River, ImpactFoam, ImpactWaves, RoundedEdge, Terrain } = useGLTF(terrainSrc)
    .nodes as Nodes

  const { river, fall, roundedEdge, impactFoam, impactWaves } = useMemo(() => waterfall(), [])

  return (
    <>
      <group rotation-y={-0.4}>
        <mesh geometry={FallTop.geometry}>
          <meshBasicNodeMaterial colorNode={fall.colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <mesh geometry={River.geometry}>
          <meshBasicNodeMaterial colorNode={river.colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <mesh geometry={RoundedEdge.geometry}>
          <meshBasicNodeMaterial colorNode={roundedEdge.colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <mesh geometry={ImpactFoam.geometry}>
          <meshBasicNodeMaterial colorNode={impactFoam.colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <mesh geometry={ImpactWaves.geometry}>
          <meshBasicNodeMaterial colorNode={impactWaves.colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <mesh geometry={FallBottom.geometry}>
          <meshBasicNodeMaterial colorNode={fall.colorNode} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <mesh geometry={Terrain.geometry}>
          <meshLambertMaterial color="#3b0" />
        </mesh>
      </group>
      <directionalLight position={[5, 13, 10]} intensity={3} />
    </>
  )
}

const WaterfallPage = () => (
  <Page title="Waterfall" cameraPosition={[0, 2, 7]}>
    <Content />
  </Page>
)

export default WaterfallPage
