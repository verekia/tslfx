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
  const normalAttribute = options.geometry.getAttribute('normal')
  const points: number[][] = []
  const normals: number[][] = []

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i)
    const y = positionAttribute.getY(i)
    const z = positionAttribute.getZ(i)
    points.push([x, y, z])

    // Extract normal for this vertex
    const nx = normalAttribute.getX(i)
    const ny = normalAttribute.getY(i)
    const nz = normalAttribute.getZ(i)
    normals.push([nx, ny, nz])
  }

  const totalBladeCount = points.length * options.bladesPerPoint
  const vertexCount = totalBladeCount * 3 // 3 vertices per triangle

  // Create vertices for all grass blades with world positions
  const vertices = new Float32Array(vertexCount * 3)
  const normalArray = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  const indices = []

  // Parse colors
  const colorAVec = new Color(options.colorA)
  const colorBVec = new Color(options.colorB)

  let bladeIndex = 0

  for (let i = 0; i < points.length; i++) {
    // Get position for this cluster and convert from Blender to Three.js coordinates
    // Blender: [x, z, y] -> Three.js: [x, y, -z]
    const pos = points[i]!
    const centerX = pos[0]!
    const centerY = pos[1]!
    const centerZ = pos[2]!

    // Get the terrain normal for this point
    const terrainNormal = normals[i]!
    const terrainNormalVec = new Vector3(terrainNormal[0]!, terrainNormal[1]!, terrainNormal[2]!)

    // Generate blades for this cluster
    for (let j = 0; j < options.bladesPerPoint; j++) {
      const vertexOffset = bladeIndex * 9 // 3 vertices * 3 components
      const colorOffset = bladeIndex * 9
      const indexOffset = bladeIndex * 3

      // Generate random color for this blade
      const randomValue = Math.random()
      const bladeColor = colorAVec.clone().lerp(colorBVec, randomValue)

      let worldX, worldY, worldZ

      if (j === 0) {
        // First blade is at the center
        worldX = centerX
        worldY = centerY
        worldZ = centerZ
      } else {
        // For surrounding blades, we need to position them on the terrain's normal plane
        // Generate random offset in the tangent plane of the terrain surface
        const angle = Math.random() * 2 * Math.PI
        const distance = options.clusterRadius

        // Create a local coordinate system from the terrain normal
        const terrainUp = terrainNormalVec
        const reference = Math.abs(terrainUp.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
        const tangent1 = new Vector3().crossVectors(terrainUp, reference).normalize()
        const tangent2 = new Vector3().crossVectors(terrainUp, tangent1).normalize()

        // Generate offset in the tangent plane
        const offsetX = Math.cos(angle) * distance
        const offsetZ = Math.sin(angle) * distance

        // Apply the offset in the terrain's tangent plane
        const offset = tangent1.clone().multiplyScalar(offsetX).add(tangent2.clone().multiplyScalar(offsetZ))

        worldX = centerX + offset.x
        worldY = centerY + offset.y
        worldZ = centerZ + offset.z
      }

      // Store world position for each vertex (all 3 vertices get the same world position)
      for (let k = 0; k < 3; k++) {
        vertices[vertexOffset + k * 3 + 0] = worldX
        vertices[vertexOffset + k * 3 + 1] = worldY
        vertices[vertexOffset + k * 3 + 2] = worldZ
      }

      // Use the terrain normal for all 3 vertices of this blade
      for (let k = 0; k < 3; k++) {
        normalArray[vertexOffset + k * 3 + 0] = terrainNormalVec.x
        normalArray[vertexOffset + k * 3 + 1] = terrainNormalVec.y
        normalArray[vertexOffset + k * 3 + 2] = terrainNormalVec.z
      }

      // Set gradient colors: darker blade color for base vertices (0, 2), full blade color for tip (1)
      for (let k = 0; k < 3; k++) {
        if (k === 1) {
          // Tip vertex gets the full blade color
          colors[colorOffset + k * 3 + 0] = bladeColor.r
          colors[colorOffset + k * 3 + 1] = bladeColor.g
          colors[colorOffset + k * 3 + 2] = bladeColor.b
        } else {
          // Base vertices get darker version of blade color (30% brightness)
          const darknessFactor = 0.3
          colors[colorOffset + k * 3 + 0] = bladeColor.r * darknessFactor
          colors[colorOffset + k * 3 + 1] = bladeColor.g * darknessFactor
          colors[colorOffset + k * 3 + 2] = bladeColor.b * darknessFactor
        }
      }

      // Indices - correct winding order
      indices.push(indexOffset + 0, indexOffset + 2, indexOffset + 1)

      bladeIndex++
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new BufferAttribute(normalArray, 3))
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

  // Calculate billboard direction (from grass to camera) for blade orientation
  const worldPos = positionWorld
  const toCameraDir = normalize(sub(cameraPosition, worldPos))

  // Create billboard right vector (perpendicular to camera direction in XZ plane)
  const up = vec3(0, 1, 0)
  const right = normalize(cross(up, toCameraDir))

  // Define local positions for the triangle vertices (billboarded)
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

  // Use vertex colors from geometry (which now contain the gradient)
  const colorNode = color()

  // Create the full grass geometry using the input geometry as a grid
  const geometry = createFullGrassGeometry({
    geometry: options.geometry,
    colorA: 'red',
    colorB: 'blue',
    bladesPerPoint: 10,
    clusterRadius: 0.2,
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
          <meshLambertNodeMaterial colorNode={colorNode} positionNode={positionNode} vertexColors />
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
