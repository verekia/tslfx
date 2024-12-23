import Link from 'next/link'

const IndexPage = () => (
  <div>
    <h1>TSLFX</h1>
    <ul>
      <li>
        <Link href="/pulsing-ring">Pulsing Ring</Link>
      </li>
      <li>
        <Link href="/gradient">Gradient</Link>
      </li>
      <li>
        <Link href="/simplex3d">
          WIP - Simplex 3D (for an animated 2D surface)
        </Link>
      </li>
    </ul>
  </div>
)

export default IndexPage
