import { useState } from 'preact/hooks'
import {testingMatrix, Params, validQ} from './rspt.js';

import './app.css'

function matrixToTable(arr) {
    return (
        <>
        <table id="matrix">
            <thead>
                <tr><td colspan="1">Pool</td><td colspan="1000">Sample</td></tr>
                <tr id="sampleno"><td></td>{arr[0].map((_, i) => <td>{i}</td>)}</tr>
            </thead>
            <tbody>
                {arr.map((row, i) => <tr><td>{i}</td>{row.map(x => <td className={x === 1 ? 'filled' : ''}></td>)}</tr>)}
            </tbody>
        </table>
        </>
    );
}

export function App() {

  const [q, setQ] = useState(8);
  const [k, setK] = useState(3);
  const [m, setM] = useState(6);
  const [n, setN] = useState(48);

  let params = null;
  try {
      params = new Params(q, k, m, n);
  } catch (e) {
      alert(`error with those params ${e}`);
  }

  let disjunctness = params === null ? null : params.disjunctness();
  let matrix = params === null ? null : testingMatrix(params);
  let matrixTable = matrix === null ? null : matrixToTable(matrix);

        //<input type="number" name="q" value={q} onInput={e => setQ(e.target.value)} />
  return (
    <>
        <label for="q">q</label>
        <select value={q} name="q" onInput={e => setQ(parseInt(e.target.value))}>
            {validQ.map(x => <option key={x} value={x}>{x}</option>)}
        </select>

        <label for="k">k</label>
        <input type="number" name="k" value={k} onInput={e => setK(parseInt(e.target.value))} />

        <label for="m">m</label>
        <input type="number" name="m" value={m} onInput={e => setM(parseInt(e.target.value))} />

        <label for="n">n</label>
        <input type="number" name="n" value={n} onInput={e => setN(parseInt(e.target.value))} />

        <span>disjunctness</span>
        <span>{disjunctness}</span>

        {matrixTable}
    </>
  )
}
