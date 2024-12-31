import { vec4, type ShaderNodeObject } from 'three/tsl'
import type { Node, UniformNode } from 'three/webgpu'

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

export const multiplyRgbByAlpha = (
  color: ShaderNodeObject<Node> | ShaderNodeObject<UniformNode<unknown>>
) => vec4(color.xyz.mul(color.w), color.w)
