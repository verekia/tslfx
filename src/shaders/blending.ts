import { mix, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export const blend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => mix(acc, node, node.a), firstNode)
}

export const addBlend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => acc.add(node), firstNode)
}

export const subBlend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => acc.sub(node), firstNode)
}

export const mulBlend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => acc.mul(node), firstNode)
}

export const divBlend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => acc.div(node), firstNode)
}

export const maxBlend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => acc.max(node), firstNode)
}

export const minBlend = (
  firstNode: ShaderNodeObject<Node>,
  ...moreNodes: ShaderNodeObject<Node>[]
) => {
  if (!firstNode) throw new Error('No layers provided')
  return moreNodes.reduce((acc, node) => acc.min(node), firstNode)
}
