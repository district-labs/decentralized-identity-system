# Public Key Infrastructure & Smart Wallet Smart Contracts

The `did-dis-sol` module contains the public key infrastructure (PKI) and Smart Wallet smart contract reference implementations.

**DISCLAIMER:** DO NOT USE THESE IN PRODUCTION. The smart contract are meant to demonstrate the core concept: providing basic functionality and essential unit tests.

Over the coming months we will develop the production ready smart contracts --  hang tight -- we're getting ready for lift-off!

# Installation

Install the repo and dependencies by running:

`pnpm`

## Deployment

These contracts can be deployed to a network by running:

`pnpm deploy <networkName>`

## Verification

These contracts can be verified on Etherscan, or an Etherscan clone, for example (Polygonscan) by running:

`pnpm etherscan-verify <ethereum network name>`

# Testing

Run the unit tests locally with:

`pnpm test`

## Coverage

Generate the test coverage report with:

`pnpm coverage`
