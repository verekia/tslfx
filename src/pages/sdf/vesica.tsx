import Page from '@/components/Page'
import { uvCenter } from '@/shaders'
import { sdVesica } from '@/shaders/sdf/vesica'
import { color, mix } from 'three/tsl'

const vesica = sdVesica(uvCenter().mul(0.8), 0.5, 0.3).step(0)
const colorNode = mix(color('deepskyblue'), color('royalblue'), vesica)

const VesicaPage = () => (
  <Page title="Vesica" is2D>
    <meshBasicNodeMaterial colorNode={colorNode} />
  </Page>
)

export default VesicaPage
