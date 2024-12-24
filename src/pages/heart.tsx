import Canvas from '@/components/Canvas'
import { color, distance, mix, select, uv, vec2 } from 'three/tsl'

const heartColor = color('hotpink')
const bgColor = color('pink')
const scale = 2
const aspectRatio = vec2(1, 1)
const lineWidth = 0.01

// Current pixel
const px = uv().sub(0.5).mul(aspectRatio).mul(scale)

// V Shape

const vPos = px.add(vec2(0, 0.7))
const vGradient = vPos.x.mul(1.38).abs().sub(vPos.y).abs()
const limitedVGradient = select(
  distance(vPos, vec2(0)).greaterThan(1.2),
  1,
  vGradient
)
const vLine = limitedVGradient.smoothstep(0, lineWidth).oneMinus()

// Half-circle shapes

const drawHalfCircle = (pos: ReturnType<typeof vec2>) => {
  const gradient = distance(pos, vec2(0)).sub(0.35).abs()
  const limitedGradient = select(pos.y.lessThan(0), 1, gradient)
  const line = limitedGradient.smoothstep(0, lineWidth * 0.8).oneMinus()
  return line
}

const firstHalfCircle = drawHalfCircle(px.add(vec2(-0.35, -0.27)))
const secondHalfCircle = drawHalfCircle(px.add(vec2(0.35, -0.27)))

const combinedShapes = vLine.add(firstHalfCircle).add(secondHalfCircle)
const colorNode = mix(bgColor, heartColor, combinedShapes)

const Scene = () => (
  <mesh scale={7}>
    <planeGeometry />
    <meshBasicNodeMaterial colorNode={colorNode} />
  </mesh>
)

const HeartPage = () => (
  <Canvas>
    <Scene />
  </Canvas>
)

export default HeartPage
