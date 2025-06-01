import Canvas from '@/components/Canvas'
import { Leva, levaStore } from 'leva'
import { LevaRootProps } from 'leva/dist/declarations/src/components/Leva/LevaRoot'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { setStore, useStoreValue } from '@/lib/store'
import PlaneScene from './PlaneScene'

const Item = ({ href, children }: { href: string; children: ReactNode }) => (
  <div className="relative group">
    <Link href={href} className="text-sm">
      <li className="pl-2">{children}</li>
    </Link>
    <Link
      href={`https://github.com/verekia/tslfx/blob/main/src/pages${href}.tsx`}
      className="absolute top-0 right-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      target="_blank"
    >
      <div className="flex items-center gap-1">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="size-4">
          <path fill="none" d="M0 0h24v24H0V0z" />
          <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
        </svg>
        <div>code</div>
      </div>
    </Link>
  </div>
)

const Page = ({
  title,
  levaProps,
  children,
  is2D = false,
}: {
  title?: string
  levaProps?: LevaRootProps
  children?: ReactNode
  is2D?: boolean
}) => {
  const dark = useStoreValue('dark')
  const boundsPlane = useStoreValue('boundsPlane')
  const env = useStoreValue('env')

  useEffect(() => {
    return () => {
      levaStore.dispose()
    }
  }, [])

  return (
    <>
      <Head>
        <title>{title ? `${title} | TSLFX` : 'TSLFX | TSL VFX Library'}</title>
      </Head>
      <div className={`h-screen ${dark ? 'bg-[#333]' : 'bg-[#f0f0f0]'}`}>
        <div className="fixed top-3 left-3 z-50 flex flex-col gap-2 p-2 px-3 py-2 text-white rounded-md bg-black/50">
          <header className="flex items-center gap-1">
            <Link href="/">
              <h1 className="text-2xl font-bold">✨ TSLFX ✨</h1>
            </Link>
            <Link href="https://github.com/verekia/tslfx" target="_blank" className="!px-1.5">
              <div>
                <svg className="size-6" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512">
                  <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9 1.4.3 2.6.4 3.8.4 8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1-8.4 1.9-15.9 2.7-22.6 2.7-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1 10.5 0 20-3.4 25.6-6 2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8 0 0 1.6-.5 5-.5 8.1 0 26.4 3.1 56.6 24.1 17.9-5.1 37-7.6 56.1-7.7 19 .1 38.2 2.6 56.1 7.7 30.2-21 48.5-24.1 56.6-24.1 3.4 0 5 .5 5 .5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5 1.2 0 2.6-.1 4-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z" />
                </svg>
              </div>
            </Link>
          </header>
          <section>
            <h2 className="font-semibold">Compositions</h2>
            <ul>
              <Item href="/composition/particles">Particles</Item>
              <Item href="/composition/timing">Timing</Item>
              <Item href="/composition/impact">Impact</Item>
              {/* <Link href="/composition/new-impact">
                <li>Impact (primitives)</li>
              </Link> */}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">Primitives</h2>
            <ul>
              <Item href="/primitive/shape">Shape</Item>
              <Item href="/primitive/scatter">Scatter</Item>
              <Item href="/primitive/gradient">Gradient</Item>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">SDFs</h2>
            <ul>
              <Item href="/sdf/circle">Circle</Item>
              <Item href="/sdf/vesica">Vesica</Item>
              <Item href="/sdf/heart">Heart</Item>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">Misc</h2>
            <ul>
              <Item href="/grass">Grass</Item>
              <Item href="/waterfall">Waterfall</Item>
              <Item href="/misc/water">Water</Item>
              <Item href="/misc/blending">Blending</Item>
              <Item href="/misc/template">Template</Item>
            </ul>
          </section>
        </div>
        {children && (
          <>
            <Canvas>
              {env && <Environment preset="park" background />}
              <OrbitControls>
                <PerspectiveCamera makeDefault position={is2D ? [0, 0, 7] : [0, 3, 5]} />
              </OrbitControls>
              {is2D ? <PlaneScene>{children}</PlaneScene> : children}
            </Canvas>
            <Leva titleBar={{ title, filter: false }} {...levaProps} />
          </>
        )}
        <div className="fixed bottom-0 left-0 z-50 flex gap-3 p-2 [&>*]:bg-black [&>*]:rounded-md [&>*]:px-2 [&>*]:py-1 text-white">
          <button onClick={() => setStore('dark', !dark)}>{dark ? 'Dark' : 'Light'} mode</button>
          {is2D && (
            <button onClick={() => setStore('boundsPlane', !boundsPlane)}>
              {boundsPlane ? 'Hide' : 'Show'} Bounds
            </button>
          )}
          {children && <button onClick={() => setStore('env', !env)}>{env ? 'Hide' : 'Show'} Env</button>}
        </div>
      </div>
    </>
  )
}

export default Page
