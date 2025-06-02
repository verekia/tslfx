import { color, positionLocal } from 'three/tsl'

const createRiver = () => {
  const colorNode = color('#07e')
  return { colorNode }
}

const createFall = () => {
  const colorNode = color('#08f')
  return { colorNode }
}

const createRoundedEdge = () => {
  const colorNode = color('#39f')
  const positionNode = positionLocal
  return { colorNode, positionNode }
}

const createImpactFoam = () => {
  const colorNode = color('#39f')
  const positionNode = positionLocal
  return { colorNode, positionNode }
}

const createImpactWaves = () => {
  const colorNode = color('#39f')
  return { colorNode }
}

export const waterfall = () => ({
  river: createRiver(),
  fall: createFall(),
  roundedEdge: createRoundedEdge(),
  impactFoam: createImpactFoam(),
  impactWaves: createImpactWaves(),
})
