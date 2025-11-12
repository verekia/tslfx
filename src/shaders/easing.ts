import { float, pow, select } from 'three/tsl'
import type { Node, UniformNode } from 'three/webgpu'

export const linear = (x: Node | UniformNode<number>) => x

export const easeInCubic = (x: Node | UniformNode<number>) => x.mul(x).mul(x)

export const easeOutCubic = (x: Node | UniformNode<number>) =>
  float(1).sub(pow(float(1).sub(x), 3))

export const easeInOutCubic = (x: Node | UniformNode<number>) =>
  select(x.lessThan(0.5), x.mul(4).mul(x).mul(x), float(1).sub(pow(x.mul(-2).add(2), 3).div(2)))
