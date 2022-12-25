/* This is a conversion from LIB-R-MATH to Typescript/Javascript
Copyright (C) 2018  Jacob K.F. Bogers  info@mail.jacob-bogers.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { debug } from '@mangos/debug';

import { ML_ERR_return_NAN2, lineInfo4 } from '@common/logger';
import { R_DT_0, R_DT_1 } from '@lib/r-func';
import { R_DT_Clog } from '@dist/exp/expm1';

const printer = debug('pgeom');

export function pgeom(q: number, p: number, lowerTail = true, logP = false): number {
    if (isNaN(q) || isNaN(p)) return NaN;

    if (p <= 0 || p > 1) {
        return ML_ERR_return_NAN2(printer, lineInfo4);
    }

    if (q < 0) return R_DT_0(lowerTail, logP);
    if (!isFinite(q)) return R_DT_1(lowerTail, logP);
    q = Math.floor(q + 1e-7);

    if (p === 1) {
        /* we cannot assume IEEE */
        q = lowerTail ? 1 : 0;
        return logP ? Math.log(q) : q;
    }
    q = Math.log1p(-p) * (q + 1);
    if (logP) return R_DT_Clog(lowerTail, logP, q);
    else return lowerTail ? -Math.expm1(q) : Math.exp(q);
}
