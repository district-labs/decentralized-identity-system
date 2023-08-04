# Decentralized Identity System

The Decentralized Identity System DID (`did:dis`) standard, proposed by [District Labs](http://districtlabs.com/) and [Disco](https://disco.xyz/), is a blockchain based DID (decentralized identifier) standard that embodies [progressive commitment threshold engineering principles](https://hackmd.io/@kames/progressive-commitment-thresholds).

Decentralized Identity System Overview: https://hackmd.io/@kames/decentralized-identity-system

**DISCLAIMER:** **Smart Wallet (Account Abstraction) features are missing from the current implementation .** For simplicities sake an existing EIP-4337 implementation will be forked and the DID standard will be integrated when the time is right.

## Introduction
The proposed `did:dis` standard gives users a low-friction (and extremely low-cost) method for bootstrapping a blockchain based Smart Wallet, with built-in support for the W3C [decentralized identifier](https://www.w3.org/TR/did-core/) and [verifiable credential](https://www.w3.org/TR/vc-data-model/) standards.

The `did:dis` standard relies on a combination of **counterfactual statements**, **offchain data storage** and **onchain public key infrastructure**.

Giving people all over the world the ability to bootstrap a new decentralized identifier using only **2 private key signatures**, while maintaining the ability to progressively strengthen the security, as they reach new distributed systems commitment thresholds.

The proposed `did:dis` standard uses the following concepts, standards and technologies:

- Decentralized Identifier Documents (DID)
- Counterfactual Statements
- Offchain Data Storage for Cryptographically Signed Messages
- Cross-Chain Interoperability Protocol (EIP-3668)
- Account Abstraction (EIP-4337 i.e. Smart Wallets)
- Onchain Public Key Infrastructure
- Intents, Authorization and Object Capabilities (Delegatable)

## Contribute

The Decentralized Identity System monorepo includes several implementation references:

- Offchain Identity Hub
- Onchain Public Key Infrastructure & Smart Wallet

If you want to contribute, we recommend reviewing the PKI & Wallet smart contracts.