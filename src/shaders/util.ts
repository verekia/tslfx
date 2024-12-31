import { dot, float, mix, uv, vec4, type ShaderNodeObject } from 'three/tsl'
import type { Node, UniformNode } from 'three/webgpu'

export const pipe = (
  fn: (firstNode: ShaderNodeObject<Node>, secondNode: ShaderNodeObject<Node>) => ShaderNodeObject<Node>,
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  return moreNodes.reduce((acc, node) => fn(acc, node), firstNode)
}

export const blendAlpha = (a: ShaderNodeObject<Node>, b: ShaderNodeObject<Node>) => mix(a, b, b.w)

export const multiplyRgbByAlpha = (color: ShaderNodeObject<Node> | ShaderNodeObject<UniformNode<unknown>>) =>
  vec4(color.xyz.mul(color.w), color.w)

export const uvCenter = () => uv().sub(0.5)
export const uvCenterNdc = () => uv().mul(2).sub(1)

export const taylorInvSqrt = (r: ReturnType<typeof vec4>) => float(1.79284291400159).sub(r.mul(0.85373472095314))

export const dot2 = (p: ShaderNodeObject<Node>) => dot(p, p)
