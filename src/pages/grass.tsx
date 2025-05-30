import Page from '@/components/Page'
import { useGLTF } from '@react-three/drei'

// @ts-expect-error
import terrainSrc from '@/shaders/grass/terrain.glb'
import { useMemo } from 'react'
import { DoubleSide, Mesh } from 'three'
import { grass } from '@/shaders/grass/grass'

type Nodes = {
  grass: Mesh
  terrain: Mesh
}

const Content = () => {
  const { grass: grassGrid, terrain } = useGLTF(terrainSrc).nodes as Nodes

  const { geometry: fullGrassGeometry, positionNode } = useMemo(
    () => grass({ geometry: grassGrid.geometry }),
    [grassGrid.geometry]
  )

  return (
    <>
      <group scale={0.3}>
        <mesh geometry={terrain.geometry}>
          <meshLambertMaterial color="#290" side={DoubleSide} />
        </mesh>
        <mesh geometry={fullGrassGeometry}>
          <meshLambertNodeMaterial positionNode={positionNode} vertexColors />
        </mesh>
        <mesh geometry={terrain.geometry} position-y={0}>
          <meshLambertMaterial color="#69f" wireframe />
        </mesh>
        <mesh geometry={grassGrid.geometry} position-y={-0.05}>
          <meshLambertMaterial color="#f33" wireframe />
        </mesh>
      </group>
      <directionalLight position={[0, 10, -3]} intensity={3} />
    </>
  )
}

const GrassPage = () => (
  <Page title="Grass">
    <Content />
  </Page>
)

export default GrassPage
