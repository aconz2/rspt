import galois
import numpy as np

def to_plain_array(x):
    def row(row):
        return list(map(int, row))
    return list(map(row, x))

def generate_json(qs):
    print('{')
    for i, q in enumerate(qs):
        GF = galois.GF(q)
        x = GF(np.arange(q))
        add_table = np.add.outer(x, x)
        mul_table = np.multiply.outer(x, x)
        print(f'  "{q}": {{')
        print(f'    "add": \n      ', end='')
        print(str(to_plain_array(add_table)).replace('],', '],\n      '))
        print(',')
        print(f'    "mul": \n      ', end='')
        print(str(to_plain_array(mul_table)).replace('],', '],\n      '))
        if i == len(qs) - 1:
            print('  }')
        else:
            print('  },')
    print('}')

qs = [9, 16, 25, 27, 32]

generate_json(qs)
