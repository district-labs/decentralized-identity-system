// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

contract Wallet {
    
    error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData);

    mapping(address => bool) public owner;

    /*//////////////////////////////////////////////////////////////////////////
                                   PUBLIC STORAGE
    //////////////////////////////////////////////////////////////////////////*/
    string public url;

    address internal constant ENTRYPOINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    
    /*//////////////////////////////////////////////////////////////////////////
                                    CONSTRUCTOR
    //////////////////////////////////////////////////////////////////////////*/

    constructor(string memory _url, address[] memory _owners) {
        url = _url;
        for (uint256 i = 0; i < _owners.length; i++) {
            owner[_owners[i]] = true;
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
                           EXTERNAL CONSTANT FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _isOwnerOrEntryPoint();
        _call(dest, value, func);
    }

    function resolve() external view {
        bytes memory callData = abi.encodePacked(address(this));
        string[] memory urls = new string[](1);
        urls[0] = url;
        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.constructDID.selector,
            abi.encodePacked(address(this))
        );
    }

    function constructDID(bytes calldata response, bytes calldata) external view virtual returns (string memory did) {
        bytes32 msgHash = bytes32(response[0:32]);
        bytes memory msgSignature = bytes(response[32:97]);
        bytes memory didHex = bytes(response[97:]);
        address signer = _recoverSigner(msgHash, msgSignature);
        require(owner[signer], "INVALID SIGNATURE");
        return string(didHex);
    }

    /*//////////////////////////////////////////////////////////////////////////
                           INTERNAL CONSTANT FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    function _call(address target, uint256 value, bytes memory data) internal {
        assembly {
            let success := call(
                gas(),
                target,
                value,
                add(data, 0x20),
                mload(data),
                0,
                0
            )
            if iszero(success) {
                mstore(0x00, 0x3204506f) // `CallFailed()`.
                revert(0x1c, 0x04)
            }
        }
    }

    function _isOwnerOrEntryPoint() internal view {
        assembly {
            let owner_ := sload(not(0x8b78c6d8))
            if iszero(or(eq(caller(), owner_), eq(caller(), ENTRYPOINT))) {
                mstore(0x00, 0x82b42900) // `Unauthorized()`.
                revert(0x1c, 0x04)
            }
        }
    }

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