// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GaslessNftTransfer is Ownable(msg.sender) {

    function transferNFT(address contractAddress, address to, uint[] memory ids) external {
        IERC721 nftContract = IERC721(contractAddress);
        require(ids.length > 0, "No token IDs provided");
        for (uint i = 0; i < ids.length; i++) {
            require(nftContract.ownerOf(ids[i]) == msg.sender, "Not token owner");
            nftContract.transferFrom(msg.sender, to, ids[i]);
        }
    }
}
