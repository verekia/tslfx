import { mix, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export const blend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => mix(acc, node, node.a), firstNode)
}
