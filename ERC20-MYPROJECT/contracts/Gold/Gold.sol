// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Gold is ERC20, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    event BlacklistAdded(address account);
    event BlacklistRemoved(address account);

    mapping(address => bool) private _blacklist;

    constructor() ERC20("GOLD", "GLD") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10**decimals());
    }


    function addToBlacklist(address _account)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            _account != msg.sender,
            "Gold: must not add sender to blacklist"
        );
        require(
            _blacklist[_account] == false,
            "Gold: account was on blacklist"
        );

        _blacklist[_account] = true;
        emit BlacklistAdded(_account);
    }

    function removeFromBlacklist(address _account)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            _blacklist[_account] == true,
            "Gold: account was not on blacklist"
        );
        _blacklist[_account] = false;
        emit BlacklistRemoved(_account);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        return _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        return _unpause();
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(_blacklist[from] == false,"Gold: account sender was on blacklist");
        require(_blacklist[to] == false, "Gold: account recipient was on blacklist");
        super._beforeTokenTransfer(from, to, amount);
    }
}
