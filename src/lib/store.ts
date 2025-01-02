import { create } from 'zustand'

const defaultState = {
  dark: true,
  boundsPlane: true,
  env: false,
}

type State = typeof defaultState
type Key = keyof State

const useStore = create<State>(() => structuredClone(defaultState))
export const useStoreValue = <K extends Key>(key: K) => useStore((state) => state[key])
export const getStore = useStore.getState
export const setStoreMulti = useStore.setState
export const setStore = <K extends Key>(key: K, value: State[K]) => setStoreMulti({ [key]: value })
export const resetStore = () => setStoreMulti(structuredClone(defaultState))
