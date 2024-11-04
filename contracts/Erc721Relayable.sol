// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Erc721Relayable is  ERC721, ERC2771Context, Ownable, ReentrancyGuard {

    string private baseTokenURI;

    uint256 public totalSupply;
    uint256 public masSupply;

    event BaseURIChanged(string baseURI);
    event Mint(address mintTo, uint256 tokensCount);
    
    address founderAddress;

    constructor(string memory name, string memory symbol, string memory baseURI, uint256 _maxSupply, address trustedForwarder) ERC721(name, symbol) ERC2771Context(trustedForwarder) Ownable(msg.sender) {
        baseTokenURI = baseURI;
        founderAddress = msg.sender;       
        totalSupply = 0;
        masSupply = _maxSupply;
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address sender) {
        return ERC2771Context._msgSender();
    }

     function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }
    
     function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
    

    //Mint
    function mint(address to, uint256 amount) external nonReentrant onlyOwner {
        require(totalSupply + amount <= masSupply, 'Exeed max supply');
        for (uint i = 0; i < amount; i++) {
            _safeMint(to, totalSupply);
            totalSupply++;
        }
    }

    function getSender() public view returns(address sender) {
        return _msgSender();
    }

    //NFT Metadata Methods

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) 
    {
        string memory _tokenURI = super.tokenURI(tokenId);
        return string(abi.encodePacked(_tokenURI, ".json"));
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
        emit BaseURIChanged(baseURI);
    }

}
