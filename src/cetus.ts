import {
    AddLiquidityFixTokenParams,
    adjustForSlippage,
    ClmmPoolUtil,
    d,
    Percentage,
    TickMath,
} from '@cetusprotocol/cetus-sui-clmm-sdk';
import { Transaction } from '@mysten/sui/transactions';

import { client, cetusSDK, owner } from './sui-client';

import addresses from './constants/addresses';

import { createPoolParams } from './utils/index';

import BN from 'bn.js';
import { LiquidityConfig, PoolConfig, SwapConfig } from '../types';

export async function createPoolTx(config: PoolConfig): Promise<Transaction> {
    const tx = new Transaction();

    const coinA = await client.getCoinMetadata({ coinType: config.coinAType });
    const coinB = await client.getCoinMetadata({ coinType: config.coinBType });

    if (!coinA || !coinB) throw new Error('No coins were found by these types');

    const poolParams = createPoolParams(config.feeRate, config.initialPrice, [
        coinA.decimals,
        coinB.decimals,
    ]);

    tx.moveCall({
        target: `${addresses.cetus20}::pool_script::create_pool`,
        arguments: [
            tx.object(addresses.globalConfig),
            tx.object(addresses.pools),
            tx.pure.u32(poolParams.tickSpacing),
            tx.pure.u128(poolParams.initializeSqrtPrice),
            tx.pure.string(config.url),
            tx.object(addresses.clock),
        ],
        typeArguments: [config.coinAType, config.coinBType],
    });

    return tx;
}

export async function addLiquidityTx(config: LiquidityConfig): Promise<Transaction> {
    const ownerCoinsA = await client.getCoins({
        owner: owner.toSuiAddress(),
        coinType: config.coinAType,
    });

    const ownerCoinsB = await client.getCoins({
        owner: owner.toSuiAddress(),
        coinType: config.coinBType,
    });

    if (!ownerCoinsA.data || !ownerCoinsB.data) throw new Error('No coins were found');

    const pool = await cetusSDK.Pool.getPool(config.poolId);

    const lowerTick = TickMath.getPrevInitializableTickIndex(
        new BN(pool.current_tick_index).toNumber(),
        new BN(pool.tickSpacing).toNumber()
    );
    const upperTick = TickMath.getNextInitializableTickIndex(
        new BN(pool.current_tick_index).toNumber(),
        new BN(pool.tickSpacing).toNumber()
    );

    const fix_amount_a = !config.amountA.eq(new BN(0));
    const slippage = 0.01;
    const coinAmount = new BN(fix_amount_a ? config.amountA : config.amountB);

    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
        lowerTick,
        upperTick,
        coinAmount,
        fix_amount_a,
        true,
        slippage,
        new BN(pool.current_sqrt_price)
    );

    const amount_a = fix_amount_a ? coinAmount.toNumber() : liquidityInput.tokenMaxA.toNumber();
    const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : coinAmount.toNumber();

    const addLiquidityPayloadParams: AddLiquidityFixTokenParams = {
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        pool_id: pool.poolAddress,
        tick_lower: lowerTick.toString(),
        tick_upper: upperTick.toString(),
        fix_amount_a,
        amount_a,
        amount_b,
        slippage,
        is_open: config.positionId == undefined,
        rewarder_coin_types: [],
        collect_fee: false,
        pos_id: config.positionId ?? '',
    };

    console.log(addLiquidityPayloadParams);

    return await cetusSDK.Position.createAddLiquidityFixTokenPayload(addLiquidityPayloadParams, {
        slippage: slippage,
        curSqrtPrice: new BN(pool.current_sqrt_price),
    });
}

export async function swapTx(swapConfig: SwapConfig): Promise<Transaction> {
    const pool = await cetusSDK.Pool.getPool(swapConfig.poolId);

    const coinA = await client.getCoinMetadata({ coinType: pool.coinTypeA });
    const coinB = await client.getCoinMetadata({ coinType: pool.coinTypeB });

    if (!coinA || !coinB) throw new Error('No coins were found by these types');

    const res: any = await cetusSDK.Swap.preswap({
        pool: pool,
        currentSqrtPrice: pool.current_sqrt_price,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        decimalsA: coinA.decimals,
        decimalsB: coinB.decimals,
        a2b: swapConfig.aToB,
        byAmountIn: true,
        amount: swapConfig.amountIn.toString(),
    });

    const slippage = Percentage.fromDecimal(d(5));
    const toAmount = res.estimatedAmountOut;
    const amountLimit = adjustForSlippage(new BN(toAmount), slippage, false);

    const tx = await cetusSDK.Swap.createSwapTransactionPayload({
        pool_id: pool.poolAddress,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        a2b: swapConfig.aToB,
        by_amount_in: true,
        amount: res.amount.toString(),
        amount_limit: amountLimit.toString(),
    });

    return tx;
}
