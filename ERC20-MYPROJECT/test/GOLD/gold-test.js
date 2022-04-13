const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Gold ERC20', () => {
    let [accountA, accountB, accountC] = []
    let token
    let amount = ethers.utils.parseUnits("100", "ether")
    let address0 = "0x0000000000000000000000000000000000000000"
    let totalSupply = ethers.utils.parseUnits("1000000", "ether")
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners()
        const Token = await ethers.getContractFactory("Gold")
        token = await Token.deploy()
        await token.deployed()
    });
    describe('common', () => {
        it("total supply should return right value", async function () {
            expect(await token.totalSupply()).to.be.equal(totalSupply)
        });
        it("balance of account A should return right value", async function () {
            expect(await token.balanceOf(accountA.address)).to.be.equal(totalSupply)
        });
        it("balance of account B should return right value", async function () {
            expect(await token.balanceOf(accountB.address)).to.be.equal(0)
        });
        it("allowance of account A should return right value", async function () {
            expect(await token.allowance(accountA.address, accountB.address)).to.be.equal(0)
        });
    });
    describe('paused', () => {
        it('sender have not pauser role', async () => {
            await expect(token.connect(accountB).pause()).to.be.reverted
        });
        it(' already paused', async () => {
            await token.pause()
            await expect(token.pause()).to.be.revertedWith("Pausable: paused")
        });
        it('pause correctly', async () => {
            const pauseTx = await token.pause()
            await expect(pauseTx).to.be.emit(token, "Paused").withArgs(accountA.address)
            await expect(token.transfer(accountB.address, amount)).to.be.revertedWith("Pausable: paused")
        });
    });
    describe('unpaused', () => {
        beforeEach(async () => {
            await token.pause()
        });
        it('sender have not pauser role', async () => {
            await expect(token.connect(accountB).unpause()).to.be.reverted
        });
        it('account is not paused', async () => {
            await token.unpause()
            await expect(token.unpause()).to.be.revertedWith("Pausable: not paused")
        });
        it('unpaused correctly', async () => {
            const unpauseTx = await token.unpause()
            await expect(unpauseTx).to.be.emit(token, "Unpaused ").withArgs(accountA.address)
            const transferTx = await token.transfer(accountB.address, amount)
            await expect(transferTx).to.be.emit(token, "Transfer").withArgs(accountA.address, accountB.address, amount)

        });
    });
    describe('add to blacklist', () => {
        it('sender is not have defualt role', async () => {
            await expect(token.connect(accountB.address).addToBlacklist(accountC.address)).to.be.reverted
        });
        it('account is already in blacklist', async () => {
            await token.addToBlacklist(accountB.address)
            await expect(token.addToBlacklist(accountB.address)).to.be.revertedWith("Gold: account was on blacklist")

        });


        it('owner add itself to blacklist', async () => {
            await expect(token.addToBlacklist(accountA.address)).to.be.reverted
        });
        it('add to blacklist correctly', async () => {
            const addToBlacklistTx = await token.addToBlacklist(accountB.address)
            await expect(addToBlacklistTx).to.be.emit(token, "BlacklistAdded").withArgs(accountB.address)
            await expect(token.connect(accountB).transfer(accountC.address, amount)).to.be.reverted
            await expect(token.transfer(accountB.address, amount)).to.be.reverted
        });
    });

    describe('remove to blacklist', () => {
        beforeEach(async () => {
            await token.transfer(accountB.address, amount)
            await token.transfer(accountC.address, amount)
            await token.addToBlacklist(accountB.address)
        });

        it('account is not already in blacklist', async () => {
            await token.removeFromBlacklist(accountB.address)
            await expect(token.removeFromBlacklist(accountB.address)).to.be.revertedWith("Gold: account was not on blacklist")
        });
        it('sender is not have defualt role', async () => {
            await expect(token.connect(accountC).removeFromBlacklist(accountB.address)).to.be.reverted
        });
        it('remove to blacklist correctly', async () => {
            await token.removeFromBlacklist(accountB.address)
            const transferTx = await token.connect(accountB).transfer(accountC.address, amount)
            await expect(transferTx).to.be.emit(token, "Transfer").withArgs(accountB.address, accountC.address, amount)
        });
    });


});
