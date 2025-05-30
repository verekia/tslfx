import Page from '@/components/Page'
import { useGLTF } from '@react-three/drei'

// @ts-expect-error
import terrainSrc from '@/shaders/grass/terrain.glb'
import { useMemo } from 'react'
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, Vector3 } from 'three'
import {
  color,
  positionLocal,
  mul,
  add,
  vec3,
  vertexIndex,
  time,
  mx_noise_vec3,
  cameraPosition,
  positionWorld,
  sub,
  normalize,
  cross,
} from 'three/tsl'

const createFullGrassGeometry = (options: {
  geometry: BufferGeometry
  colorA: string
  colorB: string
  bladesPerPoint: number
  clusterRadius: number
}) => {
  // Extract points from the input geometry's position attribute
  const positionAttribute = options.geometry.getAttribute('position')
  const points: number[][] = []

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i)
    const y = positionAttribute.getY(i)
    const z = positionAttribute.getZ(i)
    points.push([x, y, z])
  }

  const totalBladeCount = points.length * options.bladesPerPoint
  const vertexCount = totalBladeCount * 3 // 3 vertices per triangle

  // Create vertices for all grass blades with world positions
  const vertices = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  const indices = []

  // Parse colors
  const colorAVec = new Color(options.colorA)
  const colorBVec = new Color(options.colorB)

  // Calculate normal for grass blades
  const v0 = new Vector3(-0.3, 0, 0)
  const v1 = new Vector3(0, 1, 0)
  const v2 = new Vector3(0.3, 0, 0)
  const edge1 = v1.clone().sub(v0)
  const edge2 = v2.clone().sub(v0)
  const normal = edge1.cross(edge2).normalize()

  let bladeIndex = 0

  for (let i = 0; i < points.length; i++) {
    // Get position for this cluster and convert from Blender to Three.js coordinates
    // Blender: [x, z, y] -> Three.js: [x, y, -z]
    const pos = points[i]!
    const centerX = pos[0]!
    const centerY = pos[1]!
    const centerZ = pos[2]!

    // Generate blades for this cluster
    for (let j = 0; j < options.bladesPerPoint; j++) {
      const vertexOffset = bladeIndex * 9 // 3 vertices * 3 components
      const colorOffset = bladeIndex * 9
      const indexOffset = bladeIndex * 3

      // Generate random color for this blade
      const randomValue = Math.random()
      const bladeColor = colorAVec.clone().lerp(colorBVec, randomValue)

      let worldX, worldZ

      if (j === 0) {
        // First blade is at the center
        worldX = centerX
        worldZ = centerZ
      } else {
        // Surrounding blades are positioned in a circle with random angles
        const angle = Math.random() * 2 * Math.PI // Random angle
        worldX = centerX + Math.cos(angle) * options.clusterRadius
        worldZ = centerZ + Math.sin(angle) * options.clusterRadius
      }

      const worldY = centerY

      // Store world position for each vertex (all 3 vertices get the same world position)
      for (let k = 0; k < 3; k++) {
        vertices[vertexOffset + k * 3 + 0] = worldX
        vertices[vertexOffset + k * 3 + 1] = worldY
        vertices[vertexOffset + k * 3 + 2] = worldZ
      }

      // Normals for all 3 vertices
      for (let k = 0; k < 3; k++) {
        normals[vertexOffset + k * 3 + 0] = normal.x
        normals[vertexOffset + k * 3 + 1] = normal.y
        normals[vertexOffset + k * 3 + 2] = normal.z
      }

      // Set the same color for all 3 vertices of this blade
      for (let k = 0; k < 3; k++) {
        colors[colorOffset + k * 3 + 0] = bladeColor.r
        colors[colorOffset + k * 3 + 1] = bladeColor.g
        colors[colorOffset + k * 3 + 2] = bladeColor.b
      }

      // Indices - correct winding order
      indices.push(indexOffset + 0, indexOffset + 2, indexOffset + 1)

      bladeIndex++
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  geometry.setIndex(indices)

  return geometry
}

const createPositionNode = (options: {
  bladeWidth: number
  bladeHeight: number
  windSpeed: number
  instanceScales: { x: number; y: number; z: number }
}) => {
  // Create grass blade shape based on vertex index
  // Vertex 0: left base, Vertex 1: top center, Vertex 2: right base
  const vertIdx = vertexIndex.modInt(3)

  // Calculate billboard direction (from grass to camera)
  const worldPos = positionWorld
  const toCameraDir = normalize(sub(cameraPosition, worldPos))

  // Create billboard right vector (perpendicular to camera direction in XZ plane)
  const up = vec3(0, 1, 0)
  const right = normalize(cross(up, toCameraDir))

  // Define local positions for the triangle vertices
  const leftBase = mul(right, -options.bladeWidth * 0.5)
  const rightBase = mul(right, options.bladeWidth * 0.5)
  const topCenter = vec3(0, options.bladeHeight, 0)

  // Wind animation applied to the top vertex
  const windOffset = mul(mx_noise_vec3(add(worldPos, mul(time, options.windSpeed))), vec3(0.1, 0, 0.1))

  // Select position based on vertex index with billboard transformation
  const localOffset = vertIdx.equal(0).select(leftBase, vertIdx.equal(1).select(add(topCenter, windOffset), rightBase))

  return add(positionLocal, localOffset)
}

const grass = (options: { geometry: BufferGeometry }) => {
  const positionNode = createPositionNode({
    bladeWidth: 0.05,
    bladeHeight: 0.5,
    windSpeed: 2,
    instanceScales: { x: 1, y: 1, z: 1 },
  })

  const colorNode = color('#3a0')

  // Create the full grass geometry using the input geometry as a grid
  const geometry = createFullGrassGeometry({
    geometry: options.geometry,
    colorA: '#2a5a1a',
    colorB: '#4a8a2a',
    bladesPerPoint: 5,
    clusterRadius: 0.3,
  })

  return { positionNode, colorNode, geometry }
}

type Nodes = {
  grass: Mesh
  terrain: Mesh
}

const Content = () => {
  const { grass: grassGrid, terrain } = useGLTF(terrainSrc).nodes as Nodes

  const {
    geometry: fullGrassGeometry,
    positionNode,
    colorNode,
  } = useMemo(() => grass({ geometry: grassGrid.geometry }), [grassGrid.geometry])

  return (
    <>
      <group scale={0.3}>
        <mesh geometry={terrain.geometry}>
          <meshLambertMaterial color="#290" side={DoubleSide} />
        </mesh>
        <mesh geometry={fullGrassGeometry}>
          <meshLambertNodeMaterial colorNode={colorNode} positionNode={positionNode} />
        </mesh>
        <mesh geometry={grassGrid.geometry} position-y={-0.1}>
          <meshLambertMaterial color="red" wireframe />
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
