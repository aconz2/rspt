import {table} from './galoistable.js';

const smallPrimes = [3, 7, 11, 13, 17, 19, 23];

export class Params {
    constructor(q, k, m, n) {
        if (n > Math.pow(q, k)) {
            throw new Error('n must be no more than q ** k');
        }
        if (table[q] === undefined && smallPrimes.indexOf(q) === -1) {
            throw new Error('q is unhandled');
        }
        this.q = q;
        this.k = k;
        this.m = m;
        this.n = n;
    }

    samples() { return this.n; }
    pools() { return this.q * this.m; }

    disjunctness() {
        return Math.floor((this.m - 1) / this.k);
    }
}

export const validQ = Array.from(Object.keys(table)).map(x => parseInt(x)).concat(smallPrimes).toSorted((a, b) => a - b);

export function testingMatrix(params) {
    let rows = params.pools();;
    let cols = params.n;
    let ret = Array.from({length: rows}, () => Array.from({length: cols}, () => 0));
    let xs = Array.from({length: params.m}, (_, i) => i);
    //let offsets = Array.from({length: params.m}, (_, i) => i * params.q);
    for (let i = 0; i < params.n; i++) {
        let pools = evalPolynomial(params.q, i, xs);
        for (let j = 0; j < xs.length; j++) {
            ret[j * params.q + pools[j]][i] = 1;
        }
    }
    return ret;
}

function setNonzeroIndices(row) {
    let ret = new Set();
    row.forEach((x, i) => {
        if (x === 1) {
            ret.add(i);
        }
    });
    return ret;
}

export function solveMatrix(matrix, positives) {
    if (positives.length === 0) return [];
    let wholeSet = new Set(Array.from({length: matrix[0].length}, (_, i) => i));
    return Array.from(
        positives
        .map(i => setNonzeroIndices(matrix[i]))
        .reduce((a, b) => a.intersection(b), wholeSet)
    );
}

export function polynomialCoeffs(q, i) {
    let ret = [];
    while (i !== 0) {
        ret.push(i % q);
        i = Math.floor(i / q);
    }
    return ret;
}

function evalTablePolynomial_(mul, add, coeffs, x) {
    if (coeffs.length === 0) return 0;
    let ret = coeffs[0];
    let xpow = x;
    for (let i = 1; i < coeffs.length; i++) {
        ret = add[ret][mul[xpow][coeffs[i]]];
        xpow = mul[xpow][x];
    }
    return ret;
}

function evalPrimePolynomial_(q, coeffs, x) {
    if (coeffs.length === 0) return 0;
    let ret = coeffs[0];
    let xpow = x;
    for (let i = 1; i < coeffs.length; i++) {
        ret += xpow * coeffs[i];
        xpow *= x;
        // avoid too much overflow
        if (ret > 1000000) { ret %= q; }
        if (x >   1000000) { x   %= q; }
    }
    return ret % q;
}

function evalPolynomialPrime(q, i, x) {
    if (smallPrimes.indexOf(q) === -1) {
        throw new Error(`${q} is not a small prime we handle`);
    }
    const coeffs = polynomialCoeffs(q, i);
    if (typeof x === 'number') {
        return evalPrimePolynomial_(q, coeffs, x);
    }
    return Array.from(x, (x) => evalPrimePolynomial_(q, coeffs, x));
}

export function evalPolynomial(q, i, x) {
    if (table[q] === undefined) {
        return evalPolynomialPrime(q, i, x);
    }
    const mul = table[q].mul;
    const add = table[q].add;
    const coeffs = polynomialCoeffs(q, i);
    if (typeof x === 'number') {
        return evalTablePolynomial_(mul, add, coeffs, x);
    }
    return Array.from(x, (x) => evalTablePolynomial_(mul, add, coeffs, x));
}
