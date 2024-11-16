import { addLiquidity, createPool, swap } from './src';

import { refreshWallet, owner } from './src/sui-client';

import BN from 'bn.js';
import { LiquidityConfig, PoolConfig, SwapConfig } from './types';

const poolConfig: PoolConfig = {
    coinAType: '0x751e47b8ad43e1b7b1002432978068d384d41a5f60e603a11225d0ce4c3d2496::suq::SUQ',
    coinBType: '0x2::sui::SUI',
    feeRate: 0.0005,
    initialPrice: 0.00000000000035,
    url: 'http',
};

const liquidityConfig: LiquidityConfig = {
    coinAType: '0x751e47b8ad43e1b7b1002432978068d384d41a5f60e603a11225d0ce4c3d2496::suq::SUQ',
    coinBType: '0x2::sui::SUI',

    // * One of these amounts has to be 0
    amountA: new BN(1_000),
    amountB: new BN(0),

    poolId: '0x1a640428391b056058c116c0597f230ec1838c7f92c5f52e9c577c4cc94d8897',
};

const swapConfig: SwapConfig = {
    poolId: '0xecb287256007499b3df3773a3c3ad5c11d68f15d4496b8fdeca157504abe75f9',
    amountIn: new BN(10_000),
    aToB: false,
};

// * Accounts you want to use
const privateKeys: string[] = [
    'suiprivkey1qr5plcme266jzl2fanfas3zxjfzsh4aljyhx78zwyk4dm59d240qj3d4h0d',
];

// * Positions Ids these accounts might have, if account doesn't have one, put undefined
const positionIds: (string | undefined)[] = [
    '0x7fbe94096a149dcf1a31f28b9f65ac46303f34b1a01380b9b7bf3776e1b8d84e',
];

const main = async () => {
    privateKeys.map(async (pk, index) => {
        refreshWallet(pk);
        liquidityConfig.positionId = positionIds[index];

        console.log(`Using ${owner.toSuiAddress()}`);

        await addLiquidity(liquidityConfig);
        await swap(swapConfig);

        console.log(`Finished ${owner.toSuiAddress()}\n`);
    });
};

main();
