import { loadData } from '@common/load';
import { resolve } from 'path';

import { qnorm } from '..';

import { register, unRegister } from '@mangos/debug-frontend';
import createBackEndMock from '@common/debug-backend';
import type { MockLogs } from '@common/debug-backend';

describe('qnorm', function () {
    const logs: MockLogs[] = [];
    beforeEach(() => {
        const backend = createBackEndMock(logs);
        register(backend);
    });
    afterEach(() => {
        unRegister();
        logs.splice(0);
    });
    describe('invalid input check and edge cases', () => {
        it('p = NaN or mu = Nan, or sigma = NaN', () => {
            const nan1 = qnorm(NaN);
            expect(nan1).toBeNaN();
            const nan2 = qnorm(0, NaN);
            expect(nan2).toBeNaN();
            const nan3 = qnorm(0, 1, NaN);
            expect(nan3).toBeNaN();
        });
        it('p = 1 | p = 0 with all combinations of lower.tail and p.AsLog', () => {
            expect(qnorm(0, 0, 1, true, false)).toBe(-Infinity);
            expect(qnorm(0, 0, 1, false, false)).toBe(Infinity);
            expect(qnorm(-Infinity, 0, 1, true, true)).toBe(-Infinity);
            expect(qnorm(-Infinity, 0, 1, false, true)).toBe(Infinity);
            //
            expect(qnorm(1, 0, 1, true, false)).toBe(Infinity);
            expect(qnorm(1, 0, 1, false, false)).toBe(-Infinity);
            expect(qnorm(0, 0, 1, true, true)).toBe(Infinity); // fidelity with R, but this is a bug
            expect(qnorm(0, 0, 1, false, true)).toBe(-Infinity); // fidelity with R, but it is a bug
        });
        it('p > 0 and logp = TRUE, gives boundary error', () => {
            const nan = qnorm(0.1, 0, 1, true, true);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_boundaries',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_boundaries']
                }
            ]);
        });
        it('p < 0 and logp = FALSE, gives boundary error', () => {
            const nan = qnorm(-5, 0, 1, true, false);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_boundaries',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_boundaries']
                }
            ]);
        });
        it('p > 1 and logp = FALSE, gives boundary error', () => {
            const nan = qnorm(5, 0, 1, true, false);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_boundaries',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_boundaries']
                }
            ]);
        });

        it('p > 0 and logp = FALSE, gives boundary error', () => {
            const nan = qnorm(5, 0, 1, true, false);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'R_Q_P01_boundaries',
                    formatter: "argument out of domain in '%s'",
                    args: ['R_Q_P01_boundaries']
                }
            ]);
        });

        it('sigma < 0', () => {
            const nan = qnorm(0.5, 0, -1, true, false);
            expect(nan).toBeNaN();
            expect(logs).toEqual([
                {
                    prefix: '',
                    namespace: 'qnorm',
                    formatter: "argument out of domain in '%s'",
                    args: ['qnorm']
                }
            ]);
        });

        it('sigma == 0', () => {
            const r = qnorm(0.5, 9, 0, true, false);
            expect(r).toBe(9);
        });
    });
    describe('fidelity', () => {
        it('p =(0,1) mhu=0, sd=1, lower=T, aslog=F', async () => {
            const [x, y] = await loadData(resolve(__dirname, 'fixture-generation', 'qnorm2.R'), /\s+/, 1, 2);
            const result = x.map((_x) => qnorm(_x, 0, 1, true, false));
            expect(result).toEqualFloatingPointBinary(y);
        });
        it('p is very close to zero or 1, p=1-EPSILON and p = EPSILON mhu=0, sd=1, lower=F, aslog=F', () => {
            const d1 = qnorm(1 - Number.EPSILON, 0, 1);
            expect(d1).toEqualFloatingPointBinary(8.125890664701906);
            const d2 = qnorm(Number.EPSILON, 0, 1);
            expect(d2).toEqualFloatingPointBinary(-8.125890664701906);
        });
    });
});
