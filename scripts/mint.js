const { Defender } = require('@openzeppelin/defender-sdk');
const ethers = require('ethers')
const erc721RelayableArtifacts = require('../artifacts/contracts/Erc721Relayable.sol/Erc721Relayable.json')
const erc721RelayableDeployed = require("../deployments/Erc721Relayable.json")
require('dotenv').config()

const to = process.env.MINT_TO
const amount = Number(process.env.MINT_AMOUNT)
const relayerApiKey = process.env.RELAYER_API_KEY
const relayerSecretKey = process.env.RELAYER_SECRET_KEY
const credentials = { relayerApiKey: relayerApiKey, relayerApiSecret: relayerSecretKey }
const client = new Defender(credentials)
const providerDefender = client.relaySigner.getProvider()

async function mint() {
    const network = (await providerDefender.getNetwork()).name
    console.warn(`Current network is ${network}`)
    const signer = await client.relaySigner.getSigner(providerDefender, { speed: 'fast' })
    console.log(`Minting ${amount} NFT to ${to}. Please wait . . .`)
    const externalErc721Address = process.env.ERC721
    const erc721 = new ethers.Contract(externalErc721Address ? externalErc721Address : erc721RelayableDeployed[network].address, erc721RelayableArtifacts.abi, signer)
    const mint = await erc721.mint(to, amount, { gasLimit: BigInt(3000000) })
    console.warn(`Successfully minted\nTransction: ${(network == "sepolia" ? "https://sepolia.etherscan.io/tx/" : '') + mint.hash}`)
}

mint().catch(console.error)