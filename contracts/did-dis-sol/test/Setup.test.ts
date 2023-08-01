import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;
const { getSigners, utils } = ethers;

describe.skip('Wallet', () => {
  // Signers
  let wallet0: SignerWithAddress;
  let wallet1: SignerWithAddress;

  // Contract and ContractFactory
  let Wallet: Contract;
  let WalletFactory: ContractFactory;

  // Constants
  const URL = 'http://localhost:3000/{sender}';

  // DID
  let DID: any;

  const ABI_CODER = new ethers.utils.AbiCoder

  before(async () => {
    [wallet0, wallet1 ] = await getSigners();
    WalletFactory = await ethers.getContractFactory('Wallet');

    DID = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: wallet0.address,
    }
    
    const hash = ethers.utils.solidityKeccak256(["string"], [JSON.stringify(DID)])
    const signature = await wallet0.signMessage(ethers.utils.arrayify(hash))
  });

  beforeEach(async () => {
    Wallet = await WalletFactory.deploy(URL, [wallet0.address]);
  });

  describe('function resolve() external view', () => {
    it('should SUCCEED to revert and return CCIP compliant object', async () => {
      const data = await provider.call({
        to: Wallet.address,
        data: "0x2810e1d6", // resolve()
        ccipReadEnabled: true,
      })

      const [decoded] = ABI_CODER.decode(['string'], data)
      const DID_OBJECT = JSON.parse(decoded)  
      expect(DID_OBJECT).to.deep.equal(DID)

    });
  });
});
