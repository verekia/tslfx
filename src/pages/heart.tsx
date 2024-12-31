import Page from '@/components/Page'
import { sdHeart, uvCenter } from '@/shaders'
import { color, mix, vec2 } from 'three/tsl'

const heartColor = color('hotpink')
const bgColor = color('pink')
const scale = 2
const aspectRatio = vec2(1, 1)
const heartVerticalOffset = 0.28

const p = uvCenter().add(vec2(0, heartVerticalOffset)).mul(aspectRatio).mul(scale)

const heart = sdHeart(p).step(0)

const colorNode = mix(bgColor, heartColor, heart)

const HeartMaterial = () => <meshBasicNodeMaterial colorNode={colorNode} />

const HeartPage = () => (
  <Page title="Heart">
    <HeartMaterial />
  </Page>
)

export default HeartPage
