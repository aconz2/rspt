import { useState } from 'preact/hooks'
import {testingMatrix, Params, validQ} from './rspt.js';

import './app.css'

function matrixToTable(arr, checked, onChecked) {
    return (
        <>
        <table id="matrix">
            <thead>
                <tr><th colspan="2">Pool</th><th colspan={arr[0].length}>Sample</th></tr>
                <tr id="sampleno"><td></td>{arr[0].map((_, i) => <td>{i}</td>)}</tr>
            </thead>
            <tbody>
                {arr.map((row, i) => <tr>
                         <td><input type="checkbox" checked={checked[i]} onInput={(e) => onChecked(i, e.target)} /></td>
                         <td>{i}</td>
                         {row.map(x => <td className={x === 1 ? 'filled' : ''}></td>)}
                         <td class="samplelistpad"></td>
                         <td class="samplelist">{row.map((x, i) => x === 1 ? i : null).reduce((acc, i) => i === null ? acc : acc.concat([i]), []).join(',') } </td>
                         </tr>)}
            </tbody>
        </table>
        </>
    );
}

function isChecked(arr) {
    let ret = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) ret.push(i);
    }
    return ret;
}

export function App() {

  const [q, setQ] = useState(8);
  const [k, setK] = useState(2);
  const [m, setM] = useState(6);
  const [n, setN] = useState(24);
  const [positive, setPositive] = useState('');

  let form = (
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
        <input type="number" name="n" value={n} max={Math.pow(q, k)} onInput={e => setN(parseInt(e.target.value))} />

        <br />

        <label for="positive">positive pools</label>
        <input type="text" name="positive" value={positive} onInput={e => updatePositiveText(e.target.value)} />
    </>
  );

  let params = null;
  try {
      params = new Params(q, k, m, n);
  } catch (e) {
      console.error(e);
      return (
          <>
          {form}
          <p>error with those params, n must be no more than q ** k</p>
          </>
      )
  }

  const [checked, setChecked] = useState(Array.from({length: params.pools()}, () => false));

  const onChecked = (pool, checkbox) => {
      let newChecked = checked.slice();
      newChecked[pool] = checkbox.checked;
      setChecked(newChecked);
      setPositive(isChecked(newChecked).join(','));
  };

  const updatePositiveText = (s) => {
      setPositive(s);
      let pools = s.split(',').map((x) => parseInt(x));
      let newChecked = Array.from({length: params.pools()}, () => false);
      for (let pool of pools) {
          if (typeof pool === 'number') {
              if (pool >= 0 && pool < newChecked.length) {
                  newChecked[pool] = true;
              } else {
                  console.warn(`pool ${pool} is out of bounds, ignoring`);
              }
          } else {
              console.warn(`pool not a number, ignoring`);
          }
      }
      setChecked(newChecked);
  };

  let disjunctness = params.disjunctness();
  let matrix = testingMatrix(params);
  let matrixTable = matrixToTable(matrix, checked, onChecked);

  let disjunctnessWarning = isChecked(checked).length > disjunctness ? <span>WARNING more positive pools than we can discern</span> : null;

  return (
      <>
      {form}
      <p>n_pools={params.pools()}</p>
      <p>disjunctness={disjunctness}</p>
      {disjunctnessWarning === null ? null : <p>{disjunctnessWarning}</p>}
      {matrixTable}
      </>
  );
}
