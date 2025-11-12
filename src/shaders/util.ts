import { dot, float, mix, uv, vec4 } from 'three/tsl'
import type { Node, UniformNode } from 'three/webgpu'

export const pipe = (
  fn: (firstNode: Node, secondNode: Node) => Node,
  firstNode: Node,
  ...moreNodes: Node[]
) => {
  return moreNodes.reduce((acc, node) => fn(acc, node), firstNode)
}

export const blendAlpha = (a: Node, b: Node) => mix(a, b, b.w)

export const multiplyRgbByAlpha = (color: Node | UniformNode<unknown>) =>
  vec4(color.xyz.mul(color.w), color.w)

export const uvCenter = () => uv().sub(0.5)
export const uvCenterNdc = () => uv().mul(2).sub(1)

export const taylorInvSqrt = (r: Node) => float(1.79284291400159).sub(r.mul(0.85373472095314))

export const dot2 = (p: Node) => dot(p, p)
