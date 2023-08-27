import { resolve } from 'node:path';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

import { loadData } from '@common/load';

import { pexp } from '..';

describe('pexp', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    it('x=[-0.5, 3], rates= 1, 2, 16, (5 and tail=F)', async () => {
        const [p, y1, y2, y3, y4] = await loadData(
            resolve(__dirname, 'fixture-generation', 'pexp.R'),
            /\s+/,
            1,
            2,
            3,
            4,
            5
        );

        const a1 = p.map((_p) => pexp(_p, 1));
        expect(a1).toEqualFloatingPointBinary(y1, 49);

        const a2 = p.map((_p) => pexp(_p, 2));
        expect(a2).toEqualFloatingPointBinary(y2, 49);

        const a3 = p.map((_p) => pexp(_p, 16));
        expect(a3).toEqualFloatingPointBinary(y3, 50);

        const a4 = p.map((_p) => pexp(_p, 5, false));
        expect(a4).toEqualFloatingPointBinary(y4, 50);
    });

    it('rate = NaN', () => {
        const nan = pexp(0, NaN);
        expect(nan).toBeNaN();
    });
    it('rate = -3 (<0)', () => {
        const nan = pexp(0, -3);
        expect(nan).toBeNaN();
        expect(logs).toEqual([
            {
                prefix: '',
                namespace: 'pexp',
                formatter: "argument out of domain in '%s'",
                args: ['pexp']
            }
        ]);
    });
    it('asLog = true, rate = 5, x=2', () => {
        const z = pexp(2, 5, undefined, true);
        expect(z).toEqualFloatingPointBinary(-4.5400960370489214e-5, 51);
    });
    it('defaults', () => {
        const z = pexp(2);
        expect(z).toEqualFloatingPointBinary(0.8646647167633873);
    });
});
