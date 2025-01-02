import { extend, type ThreeElement } from '@react-three/fiber'
import { MeshBasicNodeMaterial, SpriteNodeMaterial } from 'three/webgpu'

extend({ MeshBasicNodeMaterial, SpriteNodeMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshBasicNodeMaterial: ThreeElement<typeof MeshBasicNodeMaterial>
    spriteNodeMaterial: ThreeElement<typeof SpriteNodeMaterial>
  }
}
