const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Petty', () => {
    let [accountA, accountB, accountC] = []
    let petty
    let address0 = "0x0000000000000000000000000000000000000000"
    let uri = "sampleuri.com/";
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners()
        const Petty = await ethers.getContractFactory("Petty")
        petty = await Petty.deploy()
        await petty.deployed()
    });
    describe('Mint', () => {
        it('account is address0', async () => {
            await expect(petty.mint(address0)).to.be.revertedWith("ERC721: mint to the zero address")
        });
        it('mint correctly', async () => {
            const mintTx = await petty.mint(accountA.address)
            await expect(mintTx).to.be.emit(petty,"Transfer").withArgs(address0, accountA.address, 1)
            expect(await petty.balanceOf(accountA.address)).to.be.equal(1)
            expect(await petty.ownerOf(1)).to.be.equal(accountA.address)
            const mintTx2 = await petty.mint(accountA.address)
            await expect(mintTx2).to.be.emit(petty,"Transfer").withArgs(address0, accountA.address, 2)
            expect(await petty.balanceOf(accountA.address)).to.be.equal(2)
            expect(await petty.ownerOf(2)).to.be.equal(accountA.address)
        });
    });
    describe('update baseUri', () => {
        it('update correctly', async () => {
            await petty.mint(accountA.address)
            await petty.updateBaseTokenURI(uri)
            expect(await petty.tokenURI(1)).to.be.equal(uri+'1')
        });
    });
});
