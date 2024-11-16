import BN from 'bn.js';

export interface PoolConfig {
    coinAType: `${string}::${string}::${string}`;
    coinBType: `${string}::${string}::${string}`;
    feeRate: 0.0001 | 0.0005 | 0.0025 | 0.01;
    initialPrice: number;
    url: string;
}

export interface LiquidityConfig {
    coinAType: `${string}::${string}::${string}`;
    coinBType: `${string}::${string}::${string}`;
    poolId: string;
    amountA: BN;
    amountB: BN;
    positionId?: string;
}

export interface SwapConfig {
    poolId: string;
    amountIn: BN;
    aToB: boolean;
}

export interface PoolParams {
    tickSpacing: number;
    initializeSqrtPrice: string;
}

export interface Ticks {
    priceTickIndex: number;
    baseTick: number;
    lowerTick: number;
    upperTick: number;
}
