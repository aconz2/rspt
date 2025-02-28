import { useState, useMemo } from 'preact/hooks'
import {testingMatrix, Params, validQ, solveMatrix} from './rspt.js';

import './app.css'

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
    const [positivePools, setPositivePools] = useState('');

    let params = new Params(q, k, m, n);
    let matrix = useMemo(
        () => testingMatrix(params),
        [q, k, m, n]
    );
    let disjunctness = params.disjunctness();
    let pools = params.pools();
    let ratio = n / pools;

    const [checked, setChecked] = useState(Array.from({length: params.pools()}, () => false));

    const genPositiveSamples = (checked) => {
        // todo something gets a bit wonky and checked is longer when decreasing eg m
        checked = checked.slice(0, params.pools());
        let ratios = solveMatrix(params, matrix, isChecked(checked))
            .map((x, i) => [i, x])
        ratios.sort(([ia, xa], [ib, xb]) => xb - xa);
        return ratios;
    };

    let positiveSamples = useMemo(
        () => genPositiveSamples(checked),
        [q, k, m, n, checked]
    );

    const checkedChanged = (newChecked) => {
        setChecked(newChecked);
        updatePositivePoolsText(newChecked);
    };

    const onPoolChecked = (pool, checkbox) => {
        let newChecked = checked.slice();
        newChecked[pool] = checkbox.checked;
        checkedChanged(newChecked);
    };

    const onSampleClicked = (sample) => {
        let newChecked = checked.slice();
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][sample] === 1) {
                newChecked[i] = true;
            }
        }
        checkedChanged(newChecked);
    };

    const clearAllPools = () => {
        let newChecked = Array.from({length: params.pools()}, () => false);
        checkedChanged(newChecked);
    };

    const onPositivePoolsTextChanged = (s) => {
        setPositivePools(s);
        let newChecked = Array.from({length: params.pools()}, () => false);
        let pools = s.split(',').map((x) => parseInt(x));
        for (let pool of pools) {
            if (pool >= 0 && pool < newChecked.length) {
                newChecked[pool] = true;
            }
        }
        setChecked(newChecked);
    };

    const updatePositivePoolsText = (checked) => {
        setPositivePools(isChecked(checked).join(','));
    };

    if (checked.length !== params.pools()) {
        let newChecked = Array.from({length: params.pools()}, () => false);
        for (let i of isChecked(checked)) {
            if (i < newChecked.length) {
                newChecked[i] = true;
            }
        }
        checkedChanged(newChecked);
        let pools = positivePools
            .split(',')
            .map(x => parseInt(x))
            .filter(x => x < newChecked.length)
            .join(',');
        setPositivePools(pools);
    }

    return (
    <>
      <div id="dcontrols">
        <h2>Inputs</h2>
        <label for="q">q</label>
        <select value={q} name="q" onInput={e => setQ(parseInt(e.target.value))}>
            {validQ.map(x => <option key={x} value={x}>{x}</option>)}
        </select>

        <label for="k">k</label>
        <input size="3" type="number" name="k" value={k} onInput={e => setK(parseInt(e.target.value))} />

        <label for="m">m</label>
        <input size="3" type="number" name="m" value={m} onInput={e => setM(parseInt(e.target.value))} />

        <label for="n">n</label>
        <input size="4" type="number" name="n" value={n} max={Math.pow(q, k)} onInput={e => {
            let val = Math.min(Math.pow(q, k), parseInt(e.target.value) || 1);
            setN(val);
            e.target.value = val;
        }}
        />

        <label for="positive">positive pools</label>
        <input type="text" name="positive" value={positivePools} onInput={e => onPositivePoolsTextChanged(e.target.value)} />

        <hr />

        <p>
            n_pools &nbsp;
            <math>
                <mi>p</mi>
                <mo>=</mo>
                <mi>q</mi>
                <mi>m</mi>
                <mo>=</mo>
                <mn>{pools}</mn>
            </math>
        </p>
        <p>
            ratio specimens to pools &nbsp;
            <math>
                <mi>r</mi>
                <mo>=</mo>
                <mfrac>
                    <mi>n</mi>
                    <mi>p</mi>
                </mfrac>
                <mo>=</mo>
                <mn>{ratio.toFixed(2)}</mn>
            </math>
        </p>
        <p>
            disjunctness &nbsp;
            <math>
                <mi>d</mi>
                <mo>=</mo>
                <ms>floor</ms>
                <mo>(</mo>
                <mfrac>
                    <mrow><mi>m</mi><mn>-1</mn></mrow>
                    <mrow><mi>k</mi></mrow>
                </mfrac>
                <mo>)</mo>
                <mo>=</mo>
                <mn>{disjunctness}</mn>
            </math>
        </p>
      </div>

      <hr />

      <div id="dsamples">
        <h2>Positive Samples</h2>
        <table>
            <thead>
                {/*<tr><th>Positive Samples</th></tr>*/}
                <tr><th>Sample No</th><th>% Pools Positive</th></tr>
            </thead>
            <tbody>
            {positiveSamples.map(([i, ratio]) =>
                ratio > 0
                ? <tr><td>{i}</td><td>{ratio.toFixed(2)}</td></tr>
                : null
            )
            }
            </tbody>
        </table>

      </div>

      <hr />

      <div id="dmatrix">
        <h2>Testing Matrix</h2>
        <button onClick={() => clearAllPools()}>Clear Selected Pools</button>
        <table id="matrix">
            <thead>
                <tr><th colspan="2"></th><th colspan={matrix[0].length}>Sample</th></tr>
                <tr>
                    <td></td>
                    <td></td>
                    {matrix[0].map((_, i) => <td class="text-vert"><button onClick={e => onSampleClicked(i)}>{i}</button></td>)}
                    <td></td>
                </tr>
            </thead>
            <tbody>
                <tr><th colspan="2">Pool</th><th colspan={matrix[0].length + 1}></th><th>Samples in pool</th></tr>
                {matrix.map((row, i) =>
                    <tr>
                        <td><input type="checkbox" checked={checked[i]} onInput={(e) => onPoolChecked(i, e.target)} /></td>
                        <td>{i}</td>
                        {row.map(x => <td class={x === 1 ? 'filled' : ''}></td>)}
                        <td class="samplelistpad"></td>
                        <td class="samplelist">{row.map((x, i) => x === 1 ? i : null).reduce((acc, i) => i === null ? acc : acc.concat([i]), []).join(',') } </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </>
    );
}
