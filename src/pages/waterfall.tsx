import Page from '@/components/Page'
import { useGLTF } from '@react-three/drei'

// @ts-expect-error
import terrainSrc from '@/shaders/waterfall/waterfall.glb'
import { useMemo } from 'react'
import { AdditiveBlending, Mesh } from 'three'
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
        <mesh geometry={FallTop.geometry} position={[0, 1.5, -2]}>
          <meshBasicNodeMaterial colorNode={fall.colorNode} transparent depthWrite={false} />
        </mesh>
        <mesh geometry={River.geometry}>
          <meshBasicNodeMaterial colorNode={river.colorNode} transparent depthWrite={false} />
        </mesh>
        <mesh geometry={RoundedEdge.geometry} position={[0, -0.07, 2.75]} renderOrder={3}>
          <meshBasicNodeMaterial colorNode={roundedEdge.colorNode} transparent depthWrite={false} />
        </mesh>
        <mesh geometry={ImpactFoam.geometry} renderOrder={2} position={[0, 0.36, -2]}>
          <meshBasicNodeMaterial
            colorNode={impactFoam.colorNode}
            positionNode={impactFoam.positionNode}
            // transparent
            // depthWrite={false}
            // opacity={0.8}
          />
        </mesh>
        <mesh geometry={ImpactWaves.geometry} renderOrder={1} scale={1.2} position={[0, 0.01, -1.76]}>
          <meshBasicNodeMaterial
            colorNode={impactWaves.colorNode}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
        <mesh geometry={FallBottom.geometry} position={[0, -1.7, 2.75]}>
          <meshBasicNodeMaterial colorNode={fall.colorNode} transparent depthWrite={false} />
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
