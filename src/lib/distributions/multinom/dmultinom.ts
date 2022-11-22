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
/*

This function is implemented in R not in C like the others of nmath

This is to show that the "size" argument is nonsense, if it is not exactly the sum(x) then there will be an error
Not sure why it is still in here

// remove "size" argument
function (x, size = NULL , prob, log = FALSE) 
{
    K <- length(prob)
    if (length(x) != K) 
        stop("x[] and prob[] must be equal length vectors.")
    if (
        any(!is.finite(prob)) 
        || 
        any(prob < 0) 
        || 
        (s <- sum(prob)) == 0
       ) 
        stop("probabilities must be finite, non-negative and not all 0")
    prob <- prob/s
    x <- as.integer(x + 0.5)
    if (any(x < 0)) 
        stop("'x' must be non-negative")
    N <- sum(x)
    
    // remove size
    if (is.null(size)) 
        size <- N
    else if (size != N) 
        stop("size != sum(x), i.e. one is wrong")
    

    i0 <- prob == 0
    if (any(i0)) {
        if (any(x[i0] != 0)) 
            return(if (log) -Inf else 0)
        if (all(i0)) 
            return(if (log) 0 else 1)
        x <- x[!i0]
        prob <- prob[!i0]
    }
    // remove size, use calculated N
    r <- lgamma(size + 1) 
       + 
       sum(x * log(prob) - lgamma(x + 1))
    if (log) 
        r
    else exp(r)
}
<bytecode: 0x0000023af74d4ee8>
<environment: namespace:stats>
*/
import { debug } from 'debug';
import { lgammafn_sign } from '@special/gamma/lgammafn_sign.js';
import { sumfp } from '@lib/r-func.js';

const printer = debug('dmultinom');

function isZeroOrPositiveAndFinite(x: number) {
    return x >= 0;
}

export function dmultinomLikeR(x: Float32Array, prob: Float32Array, asLog = false): number | never {
    const rc = dmultinom(x, prob, asLog);
    if (isNaN(rc)) {
        throw new Error(`Error in dmultinom`);
    }
    return rc;
}

export function dmultinom(x: Float32Array, prob: Float32Array, asLog = false): number {
   
    // prob and x must be the same length
    if (x.length !== prob.length) {
        printer("x[] and prob[] must be equal length vectors.");
        return NaN;
    }
    const s = sumfp(prob);
    if (
        prob.every(isFinite) === false
        ||
        prob.every(_p => _p >= 0) === false
        ||
        s === 0
    ) {
        printer("probabilities must be finite, non-negative and not all 0");
        return NaN;
    }
    //modify in place

    prob.forEach((v, i, arr) => {
        arr[i] = v / s;
    });
    // this is not the same as round,
    // must do because of R fidelity
    x.forEach((v, i, arr) => {
        arr[i] = Math.trunc(v + 0.5);
    });

    if (x.every(isZeroOrPositiveAndFinite) === false) {
        printer("'x' must be non-negative (and finite)");
        return NaN;
    }

    const N = sumfp(x);

    // if for any of the probabilities of null the bin is non zero 
    let rc = lgammafn_sign(N + 1);
    for (let i = 0; i < prob.length; i++) {
        if (prob[i] === 0) {
            if (x[i] !== 0) {
                return asLog ? -Infinity : 0;
            }
            continue;
        }
        rc += x[i] * Math.log(prob[i]) - lgammafn_sign(x[i] + 1)
    }
    /*if (N === 0) {
        return asLog ? 0 : 1;
    }*/
    return asLog ? rc : Math.exp(rc);
}
