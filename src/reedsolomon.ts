// q is the field size
// k is the order of polynomials
export function gen_polynomials(q, k, n=undefined) {
    if (q !== 16) { throw new Error('only handling q=16 right now'); }
    let coeffs = gen_q16_lexi_coefficients(k, n);
    return coeffs;
}

// specialized for q=16, we can just count up and break into groups of 4 bits
// in general we are counting in base q
function gen_q16_lexi_coefficients(k, n=undefined) {
    if (k > 8) { throw new Error('k too big for 32 bit'); }
    n = n ?? Math.pow(16, k);
    let ret = [];
    for (let i = 0; i < n; i++) {
        ret.push(decompose_q16(k, i))
    }
    return ret;
}

function decompose_q16(k, x) {
    let ret = [];
    for (let i = 0; i < k; i++) {
        ret.push(x & 15);
        x >>= 4;
    }
    return ret;
}

export function poly_f16(p, x) {
    let ret = p[0]; // p[0] * x**0
    let xpower = x;
    for (let i = 1; i < p.length; i++) {
        ret = add_f16(ret, mul_f16(p[i], xpower));
        xpower = mul_f16(xpower, x);
    }
    return ret;
}

function pow_f16(a, b) {
    let ret = a;
    for (let i = 0; i < b - 1; i++) {
        ret = mul_f16(ret, a);
    }
    return ret;
}

function mul_f16(a, b) {
    return table_mul_f16[a][b];
}

function add_f16(a, b) {
    return a ^ b;
}

const table_small_primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
    31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
];

const table_mul_f16 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [0, 2, 4, 6, 8, 10, 12, 14, 3, 1, 7, 5, 11, 9, 15, 13],
    [0, 3, 6, 5, 12, 15, 10, 9, 11, 8, 13, 14, 7, 4, 1, 2],
    [0, 4, 8, 12, 3, 7, 11, 15, 6, 2, 14, 10, 5, 1, 13, 9],
    [0, 5, 10, 15, 7, 2, 13, 8, 14, 11, 4, 1, 9, 12, 3, 6],
    [0, 6, 12, 10, 11, 13, 7, 1, 5, 3, 9, 15, 14, 8, 2, 4],
    [0, 7, 14, 9, 15, 8, 1, 6, 13, 10, 3, 4, 2, 5, 12, 11],
    [0, 8, 3, 11, 6, 14, 5, 13, 12, 4, 15, 7, 10, 2, 9, 1],
    [0, 9, 1, 8, 2, 11, 3, 10, 4, 13, 5, 12, 6, 15, 7, 14],
    [0, 10, 7, 13, 14, 4, 9, 3, 15, 5, 8, 2, 1, 11, 6, 12],
    [0, 11, 5, 14, 10, 1, 15, 4, 7, 12, 2, 9, 13, 6, 8, 3],
    [0, 12, 11, 7, 5, 9, 14, 2, 10, 6, 1, 13, 15, 3, 4, 8],
    [0, 13, 9, 4, 1, 12, 8, 5, 2, 15, 11, 6, 3, 14, 10, 7],
    [0, 14, 15, 1, 13, 3, 2, 12, 9, 7, 6, 8, 4, 10, 11, 5],
    [0, 15, 13, 2, 9, 6, 4, 11, 1, 14, 12, 3, 8, 7, 5, 10],
];
