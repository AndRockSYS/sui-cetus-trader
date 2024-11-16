import { addLiquidityTx, createPoolTx, swapTx } from './cetus';

import { client, owner } from './sui-client';

import { LiquidityConfig, PoolConfig, SwapConfig } from '../types';

export async function createPool(config: PoolConfig) {
    const transaction = await createPoolTx(config);
    const result = await client.signAndExecuteTransaction({ transaction, signer: owner });

    const receipt = await client.waitForTransaction({
        digest: result.digest,
        options: { showObjectChanges: true },
    });
    const pool = receipt.objectChanges?.filter((obj) => obj.type == 'created')[0];
    if (!pool) throw new Error('Pool was not created');

    console.log(`Created Pool Successfully at address ${pool.objectId}`);
    console.log(`Tx Digest ${result.digest}`);
}

export async function addLiquidity(config: LiquidityConfig) {
    const transaction = await addLiquidityTx(config);
    const result = await client.signAndExecuteTransaction({ transaction, signer: owner });

    const receipt = await client.waitForTransaction({
        digest: result.digest,
    });

    if (receipt.errors) throw new Error('Liquidity was not added');

    console.log(`Added Liquidity Successfully`);
    console.log(`Tx Digest ${result.digest}`);
}

export async function swap(config: SwapConfig) {
    const transaction = await swapTx(config);
    const result = await client.signAndExecuteTransaction({ transaction, signer: owner });

    const receipt = await client.waitForTransaction({
        digest: result.digest,
    });

    if (receipt.errors) throw new Error('Swapped was not executed');

    console.log(`Swapped Successfully`);
    console.log(`Tx Digest ${result.digest}`);
}
