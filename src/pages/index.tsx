import Page from '@/components/Page'
import { useStoreValue } from '@/lib/store'
import Head from 'next/head'
import Link from 'next/link'

const IndexPage = () => {
  const dark = useStoreValue('dark')

  return (
    <>
      <Head>
        <title>TSLFX | TSL VFX library</title>
      </Head>
      <Page />
      <div
        className={`fixed left-0 top-0 flex h-screen w-screen flex-col items-center justify-center gap-1 ${dark ? 'text-white' : 'text-black'}`}
      >
        <h1 className="mb-3 text-center text-5xl font-bold">✨ TSLFX ✨</h1>
        <p className="text-center text-xl">
          <Link
            className="mb-3 underline"
            href="https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language"
            target="_blank"
          >
            TSL
          </Link>{' '}
          VFX library
        </p>
        <p>
          <Link className="text-xl underline" href="https://github.com/verekia/tslfx" target="_blank">
            GitHub
          </Link>
        </p>
      </div>
    </>
  )
}

export default IndexPage
