import Canvas from '@/components/Canvas'
import { sdHeart } from '@/shaders'
import { color, mix, uv, vec2 } from 'three/tsl'

const heartColor = color('hotpink')
const bgColor = color('pink')
const scale = 2
const aspectRatio = vec2(1, 1)
const heartVerticalOffset = 0.28

const p = uv()
  .sub(0.5)
  .add(vec2(0, heartVerticalOffset))
  .mul(aspectRatio)
  .mul(scale)

const heart = sdHeart(p).step(0)

const colorNode = mix(bgColor, heartColor, heart)

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
