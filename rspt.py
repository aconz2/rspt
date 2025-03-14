import galois
import numpy as np
from math import floor
from typing import List
from functools import reduce
import operator
import itertools

class Params:
    def __init__(self, q, k, m, n):
        self.gf = galois.GF(q)
        if n > q ** k:
            raise Exception(f'n must be no more than q ** k q={q} k={k} q**k={q**k} n={n}')
        self.q = q
        self.k = k
        self.m = m
        self.n = n

    def disjunctness(self):
        return int(floor((self.m - 1) / self.k))

    def poly(self, i):
        return galois.Poly.Int(i, field=self.gf)

def build_testing_matrix(params: Params):
    # m layers each of q rows by n samples
    ret = np.zeros((params.q * params.m, params.n), dtype=np.uint8)
    pools = np.arange(params.m)
    offsets = pools * params.q
    for sample in range(params.n):
        # each sample is a polynomial and we eval it for each pool number
        p = np.array(params.poly(sample)(pools))
        ret[offsets + p, sample] = 1

    return ret

def solve_testing_matrix(params: Params, mat: np.ndarray, positive: List[int]):
    positive_vec = np.zeros(mat.shape[0], dtype=np.int32)
    positive_vec[positive] = 1
    print(mat.shape, positive_vec.shape)
    return (positive_vec @ mat) / params.m

def params_sweep():
    for q in [3, 4, 7, 8, 9, 11, 13, 16, 17, 19, 23, 25, 27, 32]:
        for k in range(1, 6):
            for m in range(1, 7):
                n = q ** k
                p = Params(q, k, m, n)
                d = p.disjunctness()
                rows = q * m
                ratio = n / rows
                if d > 1 and ratio > 1:
                    print(f'q={q} k={k} m={m} n={n} d={d} ratio={ratio:.2}')

def main(args):
    params = Params(q=args.q, k=args.k, m=args.m, n=args.n)
    d = params.disjunctness()
    matrix = build_testing_matrix(params)
    if args.cmd == 'matrix':
        print(f'# disjunctness = {d}')
        print(f'# q = {params.q}')
        print(f'# k = {params.k}')
        print(f'# m = {params.m}')
        print(f'# n = {params.n}')
        if args.js:
            print('[')
            for row in matrix:
                print('[' + ','.join(map(str, row)) + '],')
            print(']')
        else:
            for row in matrix:
                print(','.join(map(str, row)))
    elif args.cmd == 'by-sample':
        print('# sample: pool(s)')
        for col in range(matrix.shape[1]):
            pools = np.flatnonzero(matrix[:, col])
            pools_s = ',' + ','.join(map(str, pools)) + ','
            print(f'{col:3d}: {pools_s}')
    elif args.cmd == 'by-pool':
        print('# pool: sample(s)')
        for row in range(matrix.shape[0]):
            samples = np.flatnonzero(matrix[row, :])
            samples_s = ',' + ','.join(map(str, samples)) + ','
            print(f'{row:3d}: {samples_s}')
    elif args.cmd == 'solve':
        if args.positive is None or len(args.positive) == 0:
            raise Exception('need to pass --positive=1,5,7 comma sep list of positive pool ids')
        # if len(args.positive) > d:
        #     print(f'# WARNING this sample configuration can only distinguish {d} positives but got {len(args.positive)}')
        params = Params(q=args.q, k=args.k, m=args.m, n=args.n)
        matrix = build_testing_matrix(params)
        ratios = solve_testing_matrix(params, matrix, args.positive)
        result = sorted([(ratio, sample) for sample, ratio in enumerate(ratios) if ratio > 0])
        print('sample,percent-pools-positive')
        for ratio, sample in result:
            print(f'{sample: 3d},{ratio:.2f}')
    elif args.cmd == 'all-outcomes':
        np.set_printoptions(linewidth=1000)
        for combo in itertools.combinations(range(matrix.shape[0]), d):
            samples = solve_testing_matrix(params, matrix, combo)
            if len(samples) == 0:
                continue
            print(combo, samples)
    elif args.cmd == 'params-sweep':
        params_sweep()

    else:
        raise Exception(f'didnt handle {args.cmd}')

def comma_sep_int_list(s):
    return list(map(int, s.split(',')))

def parse_args():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('cmd', choices=['matrix', 'by-sample', 'by-pool', 'solve', 'all-outcomes', 'params-sweep'])
    parser.add_argument('--q', type=int, default=16, help='order of galois field')
    parser.add_argument('--m', type=int, default=6, help='number of layers / number of pools each sample goes in')
    parser.add_argument('--k', type=int, default=2, help='max degree of polynomial; higher k supports more samples but lowers disjunctness')
    parser.add_argument('--n', type=int, default=96 * 2, help='number of specimens')
    parser.add_argument('--positive', type=comma_sep_int_list, default=None, help='comma separated list of positive pool ids')
    parser.add_argument('--js', default=False, action='store_true', help='output matrix in js format')
    return parser.parse_args()

if __name__ == '__main__':
    main(parse_args())

