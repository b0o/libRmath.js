'use strict';
/* This is a conversion from libRmath.so to Typescript/Javascript
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

export { dunif } from './dunif';
export { punif } from './punif';
export { qunif } from './qunif';
import { runifOne } from './runif';
import { repeatedCall64 } from '@lib/r-func';

export function runif(n: number, min = 0, max = 1): Float64Array {
    return repeatedCall64(n, runifOne, min, max);
}

export { runifOne };

// function dunif(x: number, min = 0, max = 1, log = false): number
// function punif(q: number, min = 0, max = 1, lowerTail = true, logP = false): number
// function qunif(p: number, min = 0, max = 1, lowerTail = true, logP = false): number
// function runif(n: number, min = 0, max = 1): Float64Array
// function runifOne(min: number, max: number): number