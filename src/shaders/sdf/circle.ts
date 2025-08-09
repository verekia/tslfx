import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

// https://iquilezles.org/articles/distfunctions2d/

export const sdCircle = (n: ShaderNodeObject<Node>, r: ShaderNodeObject<Node> | number) => n.length().sub(r)
