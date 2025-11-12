import type { Node } from 'three/webgpu'

// https://iquilezles.org/articles/distfunctions2d/

export const sdCircle = (n: Node, r: Node | number) => n.length().sub(r)
