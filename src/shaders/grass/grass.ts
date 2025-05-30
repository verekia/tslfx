import { BufferAttribute, BufferGeometry, Color, Vector3 } from 'three'
import {
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
  attribute,
  div,
} from 'three/tsl'

const createFullGrassGeometry = (options: {
  geometry: BufferGeometry
  colorA: string
  colorB: string
  bladesPerPoint: number
  clusterRadius: number
  heightVariation: { min: number; max: number }
  bladeWidthVariation: { min: number; max: number }
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
  const heights = new Float32Array(vertexCount) // Store random height per vertex
  const bladeWidths = new Float32Array(vertexCount) // Store random width per vertex
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
      const heightOffset = bladeIndex * 3

      // Generate random height for this blade
      const { min, max } = options.heightVariation
      const randomHeight = min + Math.random() * (max - min)

      // Generate random width for this blade
      const { min: minWidth, max: maxWidth } = options.bladeWidthVariation
      const randomWidth = minWidth + Math.random() * (maxWidth - minWidth)

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
        // Use square root for uniform distribution in a disk (accounts for area increase with radius)
        const distance = Math.sqrt(Math.random()) * options.clusterRadius

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

      // Store the same random height for all 3 vertices of this blade
      for (let k = 0; k < 3; k++) {
        heights[heightOffset + k] = randomHeight
      }

      // Store the same random width for all 3 vertices of this blade
      for (let k = 0; k < 3; k++) {
        bladeWidths[heightOffset + k] = randomWidth
      }

      // Set gradient colors: darker blade color for base vertices (0, 2), full blade color for tip (1)
      for (let k = 0; k < 3; k++) {
        // Calculate brightness based on absolute height from ground
        let absoluteHeight
        if (k === 1) {
          // Tip vertex is at the blade's full height
          absoluteHeight = randomHeight
        } else {
          // Base vertices are at ground level (height = 0)
          absoluteHeight = 0
        }

        // Map absolute height to brightness (0 = darkest, max = brightest)
        const heightRatio = absoluteHeight / options.heightVariation.max
        const brightness = 0.3 + heightRatio * 0.7 // Range from 0.3 to 1.0

        colors[colorOffset + k * 3 + 0] = bladeColor.r * brightness
        colors[colorOffset + k * 3 + 1] = bladeColor.g * brightness
        colors[colorOffset + k * 3 + 2] = bladeColor.b * brightness
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
  geometry.setAttribute('bladeHeight', new BufferAttribute(heights, 1))
  geometry.setAttribute('bladeWidth', new BufferAttribute(bladeWidths, 1))
  geometry.setIndex(indices)

  return geometry
}

const createPositionNode = (options: {
  windSpeed: number
  windSize: number
  windDisplacement: number
  upBias?: number
}) => {
  // Get the blade height and width from the geometry attributes
  const bladeHeight = attribute('bladeHeight')
  const bladeWidth = attribute('bladeWidth')

  // Create grass blade shape based on vertex index
  // Vertex 0: left base, Vertex 1: top center, Vertex 2: right base
  const vertIdx = vertexIndex.modInt(3)

  // Calculate billboard direction (from grass to camera) for blade orientation
  const worldPos = positionWorld
  const toCameraDir = normalize(sub(cameraPosition, worldPos))

  // Create billboard right vector (perpendicular to camera direction in XZ plane)
  const up = vec3(0, 1, 0)
  const right = normalize(cross(up, toCameraDir))

  // Pure 3D billboarding for top-down views
  const billboardUp = normalize(cross(toCameraDir, right))
  // Add a small upward bias to prevent edge-on blades at mid-height angles
  const biasedUp = normalize(add(billboardUp, mul(vec3(0, 1, 0), options.upBias ?? 0.6)))
  const topCenter = mul(biasedUp, bladeHeight)

  // Define local positions for the triangle vertices (billboarded)
  const leftBase = mul(right, mul(bladeWidth, -0.5))
  const rightBase = mul(right, mul(bladeWidth, 0.5))

  // Wind animation applied to the top vertex
  const windNoise = mx_noise_vec3(add(div(worldPos, options.windSize), mul(time, options.windSpeed)))
  const finalWindOffset = mul(windNoise, vec3(options.windDisplacement, 0, options.windDisplacement))

  // Select position based on vertex index with billboard transformation
  const localOffset = vertIdx
    .equal(0)
    .select(leftBase, vertIdx.equal(1).select(add(topCenter, finalWindOffset), rightBase))

  return add(positionLocal, localOffset)
}

export const grass = (options: {
  geometry: BufferGeometry
  bladeWidthVariation?: { min: number; max: number }
  windSpeed?: number
  windSize?: number
  windDisplacement?: number
  upBias?: number
  bladesPerPoint?: number
  clusterRadius?: number
  heightVariation?: { min: number; max: number }
  colorA?: string
  colorB?: string
}) => {
  const positionNode = createPositionNode({
    windSpeed: options.windSpeed ?? 0.8,
    windSize: options.windSize ?? 1.5,
    windDisplacement: options.windDisplacement ?? 0.4,
    upBias: options.upBias ?? 1.5,
  })

  // Create the full grass geometry using the input geometry as a grid
  const geometry = createFullGrassGeometry({
    geometry: options.geometry,
    colorA: options.colorA ?? '#3a0',
    colorB: options.colorB ?? '#180',
    bladesPerPoint: options.bladesPerPoint ?? 30,
    clusterRadius: options.clusterRadius ?? 0.5,
    heightVariation: options.heightVariation ?? { min: 0.3, max: 0.7 },
    bladeWidthVariation: options.bladeWidthVariation ?? { min: 0.1, max: 0.2 },
  })

  return { positionNode, geometry }
}
