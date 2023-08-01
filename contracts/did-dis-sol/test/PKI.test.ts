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
  
  // DID Document Object
  const DID_ID = "did:dis:10:0x5FbDB2315678afecb367f032d93F642f64180aa3:0xF50C7Ce266d8F43cAF73a3307636E36C23090A7d"
  const DID = {
   '@context': 'https://www.w3.org/ns/did/v1',
   id: DID_ID
  }
  before(async () => {
    [wallet0, wallet1 ] = await getSigners();
    PKIFactory = await ethers.getContractFactory('PKI');    
    PKI = await PKIFactory.deploy([URL]);
    
    /** 
     * HACK WAY TO GENERATE INPUTS for the DID document 
     * Uncomment the lines below to get the values needed for the `did-dis-server` module.
     */
    // const did_hash = ethers.utils.solidityKeccak256(["string"], [JSON.stringify(DID)])
    // const did_signature = await wallet0.signMessage(ethers.utils.arrayify(did_hash))
    // const walletSignature = await wallet0.signMessage(ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "address", "uint256"], [PKI.address, wallet0.address, BigNumber.from("1")])));
    // console.log(PKI.address, 'PKI.address')
    // console.log(did_signature, 'did_signature')
    // console.log(walletSignature, 'walletSignature')
  });

  describe('function did(string calldata id) external view', () => {
    it('should SUCCEED to resolve a did:dis DID document', async () => {
      const data = await provider.call({
        to: PKI.address,
        data: PKI.interface.encodeFunctionData('did', [DID_ID]),
        ccipReadEnabled: true,
      })
      const [decoded] = ABI_CODER.decode(['string'], data)
      const DID_OBJECT = JSON.parse(decoded)  
      expect(DID_OBJECT).to.deep.equal(DID)
    });
  });

  describe('computeAddress(address entryPoint, address walletOwner, uint256 salt)', () => {
    it('should SUCCEED to get compute a future Smart Wallet address', async () => {
      const address = await PKI.computeAddress(PKI.address, wallet0.address, 1);
      expect(address).to.equal('0xF50C7Ce266d8F43cAF73a3307636E36C23090A7d');
    });
  });
  
  describe('deployWallet(address entryPoint, address walletOwner, uint256 salt)', () => {
    it('should SUCCEED to get deploy a future Smart Wallet address matching the computed address', async () => {
      await PKI.deployWallet(PKI.address, wallet0.address, 1);
      const address = await PKI.computeAddress(PKI.address, wallet0.address, 1);
      const exists = await PKI.walletExists(address);
      expect(exists).to.equal(true);
    });
  });
});
