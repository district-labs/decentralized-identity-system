import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';

const { provider } = ethers;
const { getSigners } = ethers;
const ABI_CODER = new ethers.utils.AbiCoder

describe.only('PublicKeyInfrastructure', () => {
  // Signers
  let wallet0: SignerWithAddress;
  let wallet1: SignerWithAddress;

  // Contract and ContractFactory
  let PKI: Contract;
  let PKIFactory: ContractFactory;

  // Constants
  const URL = 'http://localhost:3000/counterfactual/{sender}';

  // DID Document Object using Wallet0 address
  let DID = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  }

  before(async () => {
    [wallet0, wallet1 ] = await getSigners();
    PKIFactory = await ethers.getContractFactory('PKI');
    // const walletSignature = await wallet0.signMessage(ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "address", "uint256"], [ethers.constants.AddressZero, wallet0.address, 1])));
    // console.log(walletSignature, 'walletSignature')
  });

  beforeEach(async () => {
    PKI = await PKIFactory.deploy(URL);
  });

  describe('function resolve() external view', () => {
    it('should SUCCEED to revert and return CCIP compliant object', async () => {
      const data = await provider.call({
        to: PKI.address,
        data: PKI.interface.encodeFunctionData('resolve', [ethers.constants.AddressZero, wallet0.address, 1]),
        ccipReadEnabled: true,
      })

      const [decoded] = ABI_CODER.decode(['string'], data)
      const DID_OBJECT = JSON.parse(decoded)  
      expect(DID_OBJECT).to.deep.equal(DID)

    });
  });

  describe('computeAddress(address entryPoint, address walletOwner, uint256 salt)', () => {
    it('should SUCCEED to get compute a future Smart Wallet address', async () => {
      const address = await PKI.computeAddress(ethers.constants.AddressZero, wallet0.address, 1);
      expect(address).to.equal('0xA8aa000c7bd850965C35b616835cBAdEB14B3a8E');
    });
  });
  
  describe('deployWallet(address entryPoint, address walletOwner, uint256 salt)', () => {
    it('should SUCCEED to get deploy a future Smart Wallet address matching the computed address', async () => {
      const tx = await PKI.deployWallet(ethers.constants.AddressZero, wallet0.address, 1);
      const address = await PKI.computeAddress(ethers.constants.AddressZero, wallet0.address, 1);
      const exists = await PKI.walletExists(address);
      expect(exists).to.equal(true);
    });
  });
});
