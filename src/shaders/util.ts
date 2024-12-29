import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export const pipe = (
  fn: (
    firstNode: ShaderNodeObject<Node>,
    secondNode: ShaderNodeObject<Node>
  ) => ShaderNodeObject<Node>,
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  return moreNodes.reduce((acc, node) => fn(acc, node), firstNode)
}
