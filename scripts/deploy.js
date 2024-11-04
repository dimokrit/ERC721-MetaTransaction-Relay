const ethers = require("ethers")
const { Defender } = require('@openzeppelin/defender-sdk');
const erc721Abi = require('../artifacts/contracts/Erc721Relayable.sol/Erc721Relayable.json')
const ForwarderAbi = require('../artifacts/contracts/Forwarder.sol/Forwarder.json')
const deploymentsForwarder = require(`../deployments/Forwarder.json`)
const deploymentsErc721Relayable = require(`../deployments/Erc721Relayable.json`)
const fs = require('fs')
require('dotenv').config()

const tokenName = process.env.NAME
const symbol = process.env.SYMBOL
const metadataUrl = process.env.METADATA_URL
const maxSupply = BigInt(process.env.MAX_SUPPLY)
const relayerApiKey = process.env.RELAYER_API_KEY
const relayerSecretKey = process.env.RELAYER_SECRET_KEY
const credentials = { relayerApiKey: relayerApiKey, relayerApiSecret: relayerSecretKey }
const client = new Defender(credentials)
const providerDefender = client.relaySigner.getProvider()

async function deploy() {
    const signer = await client.relaySigner.getSigner(providerDefender, { speed: 'fast' })
    const network = (await providerDefender.getNetwork()).name
    console.warn(`Current network is ${network}`)
    console.log(`Deploying Forwarder. Please wait . . .`)
    const forwarder = await deployForwarder(signer, network)
    console.log(`Deploying Erc721Relayable. Please wait . . .`)
    const erc721Relayable = await deployErc721Relayable(signer, network, await forwarder.getAddress())
}

async function deployForwarder(signer, network) {
    const Forwarder = new ethers.ContractFactory(ForwarderAbi.abi, ForwarderAbi.bytecode, signer)
    const forwarder = await Forwarder.deploy("Forwarder")
    console.warn(`Forwarder deployed to: ${await forwarder.getAddress()}`)
    console.warn(`Tansaction: ${(network == "sepolia" ? "https://sepolia.etherscan.io/tx/" : '') + forwarder.deploymentTransaction().hash}`) 

    deploymentsForwarder[network] = {}
    deploymentsForwarder[network].address = await forwarder.getAddress()
    deploymentsForwarder[network].deployer = await signer.getAddress()
    fs.writeFileSync(`./deployments/Forwarder.json`, JSON.stringify(deploymentsForwarder), { flag: "w" })
    return forwarder
}

async function deployErc721Relayable(signer, network, forwarder) {
    const Erc721Relayable = new ethers.ContractFactory(erc721Abi.abi, erc721Abi.bytecode, signer)
    const erc721Relayable = await Erc721Relayable.deploy(tokenName, symbol, metadataUrl, maxSupply, forwarder)
    console.warn(`Erc721Relayable deployed to: ${await erc721Relayable.getAddress()}`)
    console.warn(`Tansaction: ${(network == "sepolia" ? "https://sepolia.etherscan.io/tx/" : '') + erc721Relayable.deploymentTransaction().hash}`) 

    deploymentsErc721Relayable[network] = {}
    deploymentsErc721Relayable[network].address = await erc721Relayable.getAddress()
    deploymentsErc721Relayable[network].deployer = await signer.getAddress()
    fs.writeFileSync(`./deployments/Erc721Relayable.json`, JSON.stringify(deploymentsErc721Relayable), { flag: "w" })
    return erc721Relayable
}

deploy().catch(console.error)