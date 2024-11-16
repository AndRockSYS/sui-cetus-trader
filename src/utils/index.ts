import { TickMath, d } from '@cetusprotocol/cetus-sui-clmm-sdk';

import feeRates from '../constants/fee-rates';

import { PoolParams, Ticks } from '../../types';

export function createPoolParams(
    feeRate: number,
    initialPrice: number,
    decimals: number[]
): PoolParams {
    const tickSpacing = (feeRates as any)[feeRate];
    const price = d(initialPrice);

    const initializeSqrtPrice = TickMath.priceToSqrtPriceX64(
        price,
        decimals[0],
        decimals[1]
    ).toString();

    return {
        tickSpacing,
        initializeSqrtPrice,
    };
}

export function getTicks(feeRate: number, desiredPrice: number, decimals: number[]): Ticks {
    const tickSpacing = (feeRates as any)[feeRate];
    const price = d(desiredPrice);

    const priceTickIndex = TickMath.priceToTickIndex(price, decimals[0], decimals[1]);

    const baseTick = Math.abs(priceTickIndex);
    const lowerTick = Math.floor(baseTick / tickSpacing) * tickSpacing;
    const upperTick = lowerTick + tickSpacing;

    return {
        priceTickIndex,
        baseTick,
        lowerTick,
        upperTick,
    };
}
