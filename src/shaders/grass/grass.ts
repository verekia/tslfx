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
  widthVariation: { min: number; max: number }
  baseDarkness: number
  colorSamples: number
}) => {
  const positionAttribute = options.geometry.getAttribute('position')
  const normalAttribute = options.geometry.getAttribute('normal')
  const points: number[][] = []
  const normals: number[][] = []

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i)
    const y = positionAttribute.getY(i)
    const z = positionAttribute.getZ(i)
    points.push([x, y, z])

    const nx = normalAttribute.getX(i)
    const ny = normalAttribute.getY(i)
    const nz = normalAttribute.getZ(i)
    normals.push([nx, ny, nz])
  }

  const totalBladeCount = points.length * options.bladesPerPoint
  const vertexCount = totalBladeCount * 3

  const vertices = new Float32Array(vertexCount * 3)
  const normalArray = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  const heights = new Float32Array(vertexCount)
  const bladeWidths = new Float32Array(vertexCount)
  const indices = []

  const colorAVec = new Color(options.colorA)
  const colorBVec = new Color(options.colorB)

  const colorSamples: Color[] = []
  for (let i = 0; i < options.colorSamples; i++) {
    const lerpValue = i / (options.colorSamples - 1)
    const sampleColor = colorAVec.clone().lerp(colorBVec, lerpValue)
    colorSamples.push(sampleColor)
  }

  const tmpTerrainNormal = new Vector3()
  const tmpReference = new Vector3()
  const tmpTangent1 = new Vector3()
  const tmpTangent2 = new Vector3()
  const tmpOffset = new Vector3()
  const tmpOffsetComponent1 = new Vector3()
  const tmpOffsetComponent2 = new Vector3()

  // Minor perf optimizations
  const { min: minHeight, max: maxHeight } = options.heightVariation
  const { min: minWidth, max: maxWidth } = options.widthVariation
  const heightRange = maxHeight - minHeight
  const widthRange = maxWidth - minWidth
  const twoPi = 2 * Math.PI

  let bladeIndex = 0

  for (let i = 0; i < points.length; i++) {
    const centerX = points[i]![0]!
    const centerY = points[i]![1]!
    const centerZ = points[i]![2]!

    tmpTerrainNormal.set(normals[i]![0]!, normals[i]![1]!, normals[i]![2]!)

    for (let j = 0; j < options.bladesPerPoint; j++) {
      const vertexOffset = bladeIndex * 9 // 3 vertices * 3 components
      const colorOffset = bladeIndex * 9
      const indexOffset = bladeIndex * 3
      const heightOffset = bladeIndex * 3

      // Generate random height for this blade - use cached values
      const randomHeight = minHeight + Math.random() * heightRange

      // Generate random width for this blade - use cached values
      const randomWidth = minWidth + Math.random() * widthRange

      // Randomly select one of the pre-calculated color samples - cache the color object
      const colorSampleIndex = Math.floor(Math.random() * options.colorSamples)
      const bladeColor = colorSamples[colorSampleIndex]!
      const bladeColorR = bladeColor.r
      const bladeColorG = bladeColor.g
      const bladeColorB = bladeColor.b

      let worldX, worldY, worldZ

      if (j === 0) {
        // First blade is at the center
        worldX = centerX
        worldY = centerY
        worldZ = centerZ
      } else {
        // For surrounding blades, we need to position them on the terrain's normal plane
        // Generate random offset in the tangent plane of the terrain surface
        const angle = Math.random() * twoPi
        // Use square root for uniform distribution in a disk (accounts for area increase with radius)
        const distance = Math.sqrt(Math.random()) * options.clusterRadius

        // Create a local coordinate system from the terrain normal
        const terrainUp = tmpTerrainNormal
        tmpReference.set(Math.abs(terrainUp.y) < 0.9 ? 0 : 1, Math.abs(terrainUp.y) < 0.9 ? 1 : 0, 0)
        tmpTangent1.crossVectors(terrainUp, tmpReference).normalize()
        tmpTangent2.crossVectors(terrainUp, tmpTangent1).normalize()

        // Generate offset in the tangent plane
        const offsetX = Math.cos(angle) * distance
        const offsetZ = Math.sin(angle) * distance

        // Apply the offset in the terrain's tangent plane - reuse temporary vectors
        tmpOffsetComponent1.copy(tmpTangent1).multiplyScalar(offsetX)
        tmpOffsetComponent2.copy(tmpTangent2).multiplyScalar(offsetZ)
        tmpOffset.copy(tmpOffsetComponent1).add(tmpOffsetComponent2)

        worldX = centerX + tmpOffset.x
        worldY = centerY + tmpOffset.y
        worldZ = centerZ + tmpOffset.z
      }

      // Store world position for each vertex (all 3 vertices get the same world position)
      for (let k = 0; k < 3; k++) {
        vertices[vertexOffset + k * 3 + 0] = worldX
        vertices[vertexOffset + k * 3 + 1] = worldY
        vertices[vertexOffset + k * 3 + 2] = worldZ
      }

      // Use the terrain normal for all 3 vertices of this blade
      for (let k = 0; k < 3; k++) {
        normalArray[vertexOffset + k * 3 + 0] = tmpTerrainNormal.x
        normalArray[vertexOffset + k * 3 + 1] = tmpTerrainNormal.y
        normalArray[vertexOffset + k * 3 + 2] = tmpTerrainNormal.z
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
      // Pre-calculate brightness values to avoid repeated calculations
      const tipBrightness = 1 - options.baseDarkness + (randomHeight / maxHeight) * options.baseDarkness
      const baseBrightness = 1 - options.baseDarkness

      for (let k = 0; k < 3; k++) {
        // Use pre-calculated brightness based on vertex type
        const brightness = k === 1 ? tipBrightness : baseBrightness

        colors[colorOffset + k * 3 + 0] = bladeColorR * brightness
        colors[colorOffset + k * 3 + 1] = bladeColorG * brightness
        colors[colorOffset + k * 3 + 2] = bladeColorB * brightness
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
  const bladeHeight = attribute('bladeHeight')
  const bladeWidth = attribute('bladeWidth')

  // Vertex 0: left base, Vertex 1: top center, Vertex 2: right base
  // This is a workaround because mod(int(vertexIndex), 3) doesn't work
  const vertIdx = vertexIndex.sub(mul(vertexIndex.div(3).toInt(), 3))

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
  widthVariation?: { min: number; max: number }
  windSpeed?: number
  windSize?: number
  windDisplacement?: number
  upBias?: number
  bladesPerPoint?: number
  clusterRadius?: number
  heightVariation?: { min: number; max: number }
  colorA?: string
  colorB?: string
  baseDarkness?: number
  colorSamples?: number
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
    colorSamples: options.colorSamples ?? 4,
    bladesPerPoint: options.bladesPerPoint ?? 30,
    clusterRadius: options.clusterRadius ?? 0.5,
    heightVariation: options.heightVariation ?? { min: 0.3, max: 0.7 },
    widthVariation: options.widthVariation ?? { min: 0.1, max: 0.2 },
    baseDarkness: options.baseDarkness ?? 0.7,
  })

  return { positionNode, geometry }
}
