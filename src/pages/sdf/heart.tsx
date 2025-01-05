import Page from '@/components/Page'
import { sdHeart, uvCenter } from '@/shaders'
import { color, mix, vec2 } from 'three/tsl'

const position = uvCenter().mul(1.207).add(vec2(0, 0.57))
const heart = sdHeart(position).step(0)
const colorNode = mix(color('deepskyblue'), color('royalblue'), heart)

const HeartPage = () => (
  <Page title="Heart" is2D>
    <meshBasicNodeMaterial colorNode={colorNode} />
  </Page>
)

export default HeartPage
