import { mix, type ShaderNodeObject, vec4 } from 'three/tsl'
import type { Node } from 'three/webgpu'

type Layer = { colorNode: ShaderNodeObject<Node> }

export const blend = (layers: Layer[]) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) => mix(acc, layer.colorNode, layer.colorNode.a),
    firstLayer.colorNode
  )
}

export const addBlend = (
  layers: Layer[],
  options: { alpha: boolean } = { alpha: false }
) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) =>
      options.alpha
        ? acc.add(layer.colorNode)
        : acc.add(vec4(layer.colorNode.xyz, 0)),
    firstLayer.colorNode
  )
}

export const subBlend = (
  layers: Layer[],
  options: { alpha: boolean } = { alpha: false }
) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) =>
      options.alpha
        ? acc.sub(layer.colorNode)
        : acc.sub(vec4(layer.colorNode.xyz, 0)),
    firstLayer.colorNode
  )
}

export const mulBlend = (
  layers: Layer[],
  options: { alpha: boolean } = { alpha: false }
) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) =>
      options.alpha
        ? acc.mul(layer.colorNode)
        : acc.mul(vec4(layer.colorNode.xyz, 1)),
    firstLayer.colorNode
  )
}

export const divBlend = (
  layers: Layer[],
  options: { alpha: boolean } = { alpha: false }
) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) =>
      options.alpha
        ? acc.div(layer.colorNode)
        : acc.div(vec4(layer.colorNode.xyz, 1)),
    firstLayer.colorNode
  )
}

export const maxBlend = (
  layers: Layer[],
  options: { alpha: boolean } = { alpha: false }
) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) =>
      options.alpha
        ? acc.max(layer.colorNode)
        : acc.max(vec4(layer.colorNode.xyz, 0)),
    firstLayer.colorNode
  )
}

export const minBlend = (
  layers: Layer[],
  options: { alpha: boolean } = { alpha: false }
) => {
  const [firstLayer, ...moreLayers] = layers

  if (!firstLayer) {
    console.error('No layers provided')
    return null
  }

  return moreLayers.reduce(
    (acc, layer) =>
      options.alpha
        ? acc.min(layer.colorNode)
        : acc.min(vec4(layer.colorNode.xyz, 1)),
    firstLayer.colorNode
  )
}
