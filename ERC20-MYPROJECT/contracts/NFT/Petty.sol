// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Petty is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenCount;
    string private _baseTokenURI;
    constructor() public ERC721("Petty", "PET") {}

    function mint(address _to) public onlyOwner returns(uint256) {
        tokenCount.increment();
        uint256 _tokenId = tokenCount.current();
        _mint(_to,_tokenId);
        return _tokenId;
    }
    function _baseURI() internal view virtual override returns(string memory) {
        return _baseTokenURI;
    }
    function updateBaseTokenURI(string memory baseTokenURI_) public onlyOwner {
        _baseTokenURI = baseTokenURI_;
    }
}
