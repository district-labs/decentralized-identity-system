// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import {Wallet} from "./Wallet.sol";
import {IEntryPoint} from "./interfaces/IEntryPoint.sol";
import {IWalletFactory} from "./interfaces/IWalletFactory.sol";
import {Create2} from "./utils/Create2.sol";
// import "hardhat/console.sol";

contract PKI is IWalletFactory {
    /*//////////////////////////////////////////////////////////////////////////
                                   PUBLIC STORAGE
    //////////////////////////////////////////////////////////////////////////*/
    string public url;

    /*//////////////////////////////////////////////////////////////////////////
                                    ERROR EVENTS
    //////////////////////////////////////////////////////////////////////////*/
    error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData);

    /*//////////////////////////////////////////////////////////////////////////
                                    CONSTRUCTOR
    //////////////////////////////////////////////////////////////////////////*/
    constructor(string memory _url) {
        url = _url;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    READ FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function computeAddress(address entryPoint, address walletOwner, uint256 salt)
        public
        view
        override
        returns (address)
    {
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(abi.encodePacked(type(Wallet).creationCode, abi.encode(entryPoint, url, walletOwner)))
        );
    }

    function walletExists(address target) external view returns (bool) {
        uint256 size;
        assembly { size := extcodesize(target) }
        return size > 0;
    }

    function resolve(address entryPoint, address walletOwner, uint256 salt) external view {
        bytes memory callData = abi.encodePacked(address(this));
        string[] memory urls = new string[](1);
        urls[0] = url;
        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.constructDID.selector,
            abi.encodePacked(entryPoint, walletOwner, salt)
        );
    }

    function constructDID(bytes calldata response, bytes calldata extraData) external view virtual returns (string memory did) {
        // Parse the response
        bytes memory entryPoint = extraData[0:20];
        bytes memory walletOwner = extraData[20:40];
        bytes memory saltBytes = extraData[40:72];
        bytes memory walletSiganture = response[0:65];
        bytes memory didSiganture = response[65:130];
        bytes memory didHex = response[130:];

        // Hash the DID and the counterfactual Smart Wallet
        bytes32 didMsg = keccak256(abi.encodePacked(string(didHex)));
        bytes32 walletMsg = keccak256(abi.encodePacked(entryPoint, walletOwner, saltBytes));

        // Recover the signer of the DID
        address didSigner = _recoverSigner(didMsg, didSiganture);

        // Recover the signer of the counterfactual Smart Wallet
        address walletSigner = _recoverSigner(walletMsg, walletSiganture);

        // Check that the signer of the Smart Wallet is the same as the signer of the DID
        require(walletSigner == didSigner, "INVALID SIGNATURE");
        return string(didHex);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    WRITE FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/
    function deployWallet(address entryPoint, address walletOwner, uint256 salt)
        external
        override
        returns (Wallet)
    {
        address walletAddress = computeAddress(entryPoint, walletOwner, salt);

        // Determine if a wallet is already deployed at this address, if so return that
        uint256 codeSize = walletAddress.code.length;
        if (codeSize > 0) {
            return Wallet(payable(walletAddress));
        } else {
            // Deploy the wallet
            Wallet wallet = new Wallet{salt: bytes32(salt)}(entryPoint, url, walletOwner);
            return wallet;
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function _recoverSigner(bytes32 msgHash, bytes memory msgSignature) internal pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        bytes32 prefixedHash = keccak256(
          abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash)
        );

        //Check the signature length
        if (msgSignature.length != 65) {
            return (address(0));
        }

        // Divide the signature in r, s and v variables
        assembly {
            r := mload(add(msgSignature, 32))
            s := mload(add(msgSignature, 64))
            v := byte(0, mload(add(msgSignature, 96)))
        }

        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }

        // If the version is correct return the signer address
        if (v != 27 && v != 28) {
            return (address(0));
        } else {
            return ecrecover(prefixedHash, v, r, s);
        }
    }
}
