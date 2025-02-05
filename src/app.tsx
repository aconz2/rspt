import { useState } from 'preact/hooks'
import './app.css'
import {gen_polynomials,poly_f16} from './reedsolomon';

export function App() {
    let ps = gen_polynomials(16, 3, 100);
    let i = 42;
    console.log(ps[i]);
    let x = poly_f16(ps[i], 14);
    console.log(x)

  const [count, setCount] = useState(0)
  return (
    <>
      <div>hello</div>
    </>
  )
}
