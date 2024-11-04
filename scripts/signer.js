const ethSigUtil = require('eth-sig-util');

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
 { name: 'verifyingContract', type: 'address' }
];

const ForwardRequest = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint48' },
  { name: 'data', type: 'bytes' }
];

function getMetaTxTypeData(chainId, verifyingContract) {
  return {
    types: {
      EIP712Domain,
      ForwardRequest,
    },
    domain: {
      name: 'Forwarder',
      version: '1',
      chainId,
      verifyingContract,
    },
    primaryType: 'ForwardRequest',
  }
};

async function sign(privatKey, data) {
  const msgParams = {
    data: data
  }
  const signature = ethSigUtil.signTypedMessage(Buffer.from(privatKey.replace(/^0x/, ''), 'hex'), msgParams, 'V4')
  return signature
}

async function buildRequest(forwarder, input) {
  const deadline = Math.floor(Date.now() / 1000) + 3600
  const nonce = Number(await forwarder.nonces(input.from))
  return { from:input.from, to: input.to, value: 0, gas: 210000, nonce, deadline, ...input }
}

async function buildTypedData(chainId, forwarder, request) {
  const typeData = getMetaTxTypeData(chainId, forwarder)
  return { ...typeData, message: request }
}

async function signMetaTxRequest(chainId, privatKey, forwarder, input) {
  const request = await buildRequest(forwarder, input)
  const ForwarderAddress = await forwarder.getAddress()
  const toSign = await buildTypedData(chainId, ForwarderAddress, request)
  const signature = await sign(privatKey, toSign)
  return { signature, request }
}

module.exports = {
  signMetaTxRequest,
  buildRequest,
  buildTypedData,
}
