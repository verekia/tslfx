import { float, length, select, type ShaderNodeObject, sqrt, vec2 } from 'three/tsl'
import type { Node } from 'three/webgpu'

// https://iquilezles.org/articles/distfunctions2d/

export const sdVesica = (
  p: ShaderNodeObject<Node>,
  r: ShaderNodeObject<Node> | number,
  d: ShaderNodeObject<Node> | number
) => {
  const pAbs = p.abs()
  const b = sqrt(
    float(r as number)
      .mul(r)
      .sub(float(d as number).mul(d))
  )

  const condition = pAbs.y.sub(b).mul(d).greaterThan(pAbs.x.mul(b))

  return select(condition, length(pAbs.sub(vec2(0, b))), length(pAbs.sub(vec2(float(-1).mul(d), 0))).sub(r))
}
