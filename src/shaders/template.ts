import { uv, uniform, vec2, rotate, select, type ShaderNodeObject } from 'three/tsl'
import { Vector2 } from 'three'
import { Node, RotateNode } from 'three/webgpu'

type TemplateParams = {
  scale?: number
  time?: number
  aspect?: number
  rotation?: number
  offset?: Vector2
  tileSize?: number
  tiled?: number
  createNodes?: ({ position, time }: { position: ShaderNodeObject<RotateNode>; time: Node }) => {
    colorNode: Node
  }
}

const defaultParams: Required<TemplateParams> = {
  time: 0,
  scale: 1,
  aspect: 1,
  rotation: 0,
  offset: new Vector2(0, 0),
  tileSize: 1,
  tiled: 0,
  createNodes: ({ position }) => ({ colorNode: position }),
}

export const template = (params: TemplateParams) => {
  const { time, scale, aspect, rotation, offset, tileSize, tiled, createNodes } = {
    ...defaultParams,
    ...params,
  }
  const t = uniform(time)
  const s = uniform(scale)
  const a = uniform(aspect)
  const r = uniform(rotation)
  const o = uniform(offset)
  const ts = uniform(tileSize)
  const ti = uniform(tiled)

  const scaled = uv().add(o).sub(0.5).mul(2).mul(s).mul(vec2(a, 1))
  const tile = select(ti.equal(1), scaled.mul(ts).fract().sub(0.5).mul(2), scaled)
  const p = rotate(tile, r)

  const nodes = createNodes({ position: p, time: t })

  return {
    uniforms: {
      scale: s,
      time: t,
      aspect: a,
      rotation: r,
      offset: o,
      tileSize: ts,
      tiled: ti,
    },
    nodes,
  }
}
