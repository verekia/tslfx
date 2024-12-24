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
        <Link href="/simplex3d">Simplex 3D (to animate a 2D surface)</Link>
      </li>
      <li>
        <Link href="/water">Water (via MaterialX noise shader)</Link>
      </li>
      <li>
        <Link href="/simplex2d">Simplex 2D (static)</Link>
      </li>
    </ul>
  </div>
)

export default IndexPage
