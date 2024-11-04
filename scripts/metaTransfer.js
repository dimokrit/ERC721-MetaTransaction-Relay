const { Defender } = require('@openzeppelin/defender-sdk')
const ethers = require('ethers')
const { signMetaTxRequest } = require('./signer.js')
const Erc721Relayable = require('../artifacts/contracts/Erc721Relayable.sol/Erc721Relayable.json')
const Forwarder = require('../artifacts/contracts/Forwarder.sol/Forwarder.json')
require('dotenv').config()

const relayerApiKey = process.env.RELAYER_API_KEY
const relayerSecretKey = process.env.RELAYER_SECRET_KEY
const credentials = { relayerApiKey: relayerApiKey, relayerApiSecret: relayerSecretKey }
const client = new Defender(credentials)
const providerDefender = client.relaySigner.getProvider()

async function sendNFTMetatransaction() {
  try {
    const nftId = Number(process.env.TOKEN_ID)
    const senderAddress = process.env.TR_FROM
    const receipentAddress = process.env.TR_TO
    const senderPrivatKey = process.env.PRIVATE_KEY_TR_FROM
    const network = (await providerDefender.getNetwork()).name
    const chainId = Number((await providerDefender.getNetwork()).chainId)
    console.warn(`Current network is ${network}`)
    const erc721RelayableAddress = require("../deployments/Erc721Relayable.json")[network].address
    const ForwarderAddress = require("../deployments/Forwarder.json")[network].address
    const safeTransferFromMetaFragment = 'safeTransferFromMeta(address,address,uint256)'

    const relayerSingner = await client.relaySigner.getSigner(providerDefender, { speed: 'fast' })
    const relayerAddress = await relayerSingner.getAddress()
    const messege = `Metatransfer NFT with id ${nftId}\nFrom: ${senderAddress}\nTo: ${receipentAddress}\nPayer: ${relayerAddress}\nPlease wait. . .`
    console.log(messege)
    const externalErc721Address = process.env.ERC721
    const externalForwarderAddress = process.env.FORWARDER
    const _forwarderContract = new ethers.Contract(externalForwarderAddress ? externalForwarderAddress : ForwarderAddress, Forwarder.abi, relayerSingner);
    const nftContract = new ethers.Contract(externalErc721Address ? externalErc721Address : erc721RelayableAddress, Erc721Relayable.abi)

    const txData = nftContract.interface.encodeFunctionData(safeTransferFromMetaFragment, [
      senderAddress,
      receipentAddress,
      nftId])

    const { request, signature } = await signMetaTxRequest(chainId, senderPrivatKey, _forwarderContract, {
      from: senderAddress,
      to: await nftContract.getAddress(),
      data: txData
    })

    const signedMessage = {
      from: request.from,
      to: request.to,
      value: request.value,
      gas: request.gas,
      deadline: request.deadline,
      data: request.data,
      signature: signature
    }
    const tranfser = await _forwarderContract.execute(signedMessage, { gasLimit: BigInt(300000) })
    console.warn(`Successfully transfered\nTransction: ${(network == "sepolia" ? "https://sepolia.etherscan.io/tx/" : '') + tranfser.hash}`)
  } catch (error) {
    console.error(error)
  }
}

sendNFTMetatransaction().catch(console.error)