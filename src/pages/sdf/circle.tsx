import Page from '@/components/Page'
import { sdCircle, uvCenter } from '@/shaders'
import { color, mix } from 'three/tsl'

const circle = sdCircle(uvCenter(), 0.5).step(0)
const colorNode = mix(color('deepskyblue'), color('royalblue'), circle)

const CirclePage = () => (
  <Page title="Circle" is2D>
    <meshBasicNodeMaterial colorNode={colorNode} />
  </Page>
)

export default CirclePage
