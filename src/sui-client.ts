import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export const client = new SuiClient({
    url: getFullnodeUrl('mainnet'),
});

export let owner: Ed25519Keypair;

export let cetusSDK = initCetusSDK({
    network: 'mainnet',
});

export function refreshWallet(privateKey: string) {
    owner = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(privateKey).secretKey);
    cetusSDK.senderAddress = owner.toSuiAddress();
}
