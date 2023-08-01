import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { toUtf8String } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { encodeFunctionData, createPublicClient, http, offchainLookup, Hex } from 'viem'
import { hardhat } from 'viem/chains'
// @ts-ignore
import WalletABI from '../../artifacts/contracts/Wallet.sol/Wallet.json';

const client = createPublicClient({ 
  chain: hardhat,
  transport: http()
})


const { provider } = ethers;
const { getSigners, utils } = ethers;


describe.skip('Wallet', () => {
  // Signers
  let wallet0: SignerWithAddress;
  let wallet1: SignerWithAddress;
  let wallet2: SignerWithAddress;
  ``
  // Contract and ContractFactory
  let Wallet: Contract;
  let WalletFactory: ContractFactory;

  // Constants
  const URL = 'http://localhost:3000/{sender}';

  // DID
  let DID: any;

  before(async () => {
    [wallet0, wallet1, wallet2] = await getSigners();
    WalletFactory = await ethers.getContractFactory('Wallet');

    DID = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: wallet0.address,
    }

    // const DID_HASH = utils.id(JSON.stringify(DID))
    // const signature = await wallet0.signMessage(DID_HASH)
  });

  beforeEach(async () => {
    Wallet = await WalletFactory.deploy(URL);
  });

  describe('function resolve() external view', () => {
    it('should SUCCEED to revert and return CCIP compliant object', async () => {
      const hash = await Wallet.resolveFunctionHash()

      // const dataOffchain = await new Promise<Hex>(async (resolve) => {
      //   try {
      //     const data = encodeFunctionData({
      //       abi: WalletABI.abi,
      //       functionName: 'resolve',
      //       args: [],
      //     })
      //     await client.request({
      //       method: 'eth_call',
      //       params: [{ data, to: Wallet.address as `0x${string}`  }, 'latest'],
      //     })
      //   } catch (err) {
      //     console.log(err, 'err')
      //     resolve((err as any).cause.data)
      //   }
      // })


      // const result = await offchainLookup(client, {
      //   data: dataOffchain,
      //   to: Wallet.address as `0x${string}`,
      // })

      // console.log(result, 'resultVIEM')

    });
  });
});
