import { float, vec2 } from 'three/tsl'

// https://iquilezles.org/articles/distfunctions2d/

export const sdCircle = (
  n: ReturnType<typeof vec2>,
  r: ReturnType<typeof float> | number
) => {
  return n.length().sub(r)
}
