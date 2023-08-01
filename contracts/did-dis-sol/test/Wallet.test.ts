import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;
const { getSigners } = ethers;
const ABI_CODER = new ethers.utils.AbiCoder

describe.only('Wallet', () => {
  // Signers
  let wallet0: SignerWithAddress;
  let wallet1: SignerWithAddress;

  // Contract and ContractFactory
  let Wallet: Contract;
  let WalletFactory: ContractFactory;

  // Constants
  const URL = 'http://localhost:3000/materialized/{sender}';

  // DID Document Object using Wallet0 address
  let DID = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: "did:dis:10:0x5FbDB2315678afecb367f032d93F642f64180aa3:0xF50C7Ce266d8F43cAF73a3307636E36C23090A7d",
  }

  before(async () => {
    [wallet0, wallet1 ] = await getSigners();
    WalletFactory = await ethers.getContractFactory('Wallet');
  });

  beforeEach(async () => {
    Wallet = await WalletFactory.deploy(ethers.constants.AddressZero, [URL], wallet0.address);
  });

  describe('function did() external view', () => {
    it('should SUCCEED to revert and return CCIP compliant object', async () => {
      const data = await provider.call({
        to: Wallet.address,
        data: Wallet.interface.encodeFunctionData('did', []),
        ccipReadEnabled: true,
      })

      const [decoded] = ABI_CODER.decode(['string'], data)
      const DID_OBJECT = JSON.parse(decoded)  
      expect(DID_OBJECT).to.deep.equal(DID)

    });
  });
});
