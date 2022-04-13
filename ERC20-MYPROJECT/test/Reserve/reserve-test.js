const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe('Reserve', () => {
    let [admin, receiver, seller, buyer] = []
    let gold
    let reserve
    let address0 = "0x0000000000000000000000000000000000000000"
    let reserveBalance = ethers.utils.parseEther("1000")
    let oneWeek = 86400 * 7
    beforeEach(async () => {
        [admin, receiver, seller, buyer] = await ethers.getSigners()
        const Gold = await ethers.getContractFactory("Gold")
        gold = await Gold.deploy()
        await gold.deployed()
        const Reserve = await ethers.getContractFactory("Reserve")
        reserve = await Reserve.deploy(gold.address)
    });
    describe('withdrawTo', () => {
        beforeEach(async () => {
            await gold.transfer(reserve.address, reserveBalance)
        });
        it('should revert if timestamp less than unlockTime', async () => {
            await expect(reserve.withDrawTo(receiver.address, reserveBalance)).to.be.revertedWith("Reserve, Can Not Trade")
        });
        it('should revert if caller is not owner', async () => {
            await expect(reserve.connect(receiver).withDrawTo(seller.address, reserveBalance)).to.be.revertedWith("Ownable: caller is not the owner")
        });
        it('should revert if reserve address to is address 0', async () => {
            await network.provider.send("evm_increaseTime", [oneWeek * 24])
            await expect(reserve.withDrawTo(address0, reserveBalance)).to.be.revertedWith("Reserve: transfer to zero address")
        });
        it('should revert if balance of reserve is less than amount', async () => {
            await network.provider.send("evm_increaseTime", [oneWeek * 24])
            await expect(reserve.withDrawTo(receiver.address, reserveBalance + 1)).to.be.revertedWith("Reserve: exceeds contract balance")
        });
        it('correctly', async () => {
            await network.provider.send("evm_increaseTime", [oneWeek * 24])
            await reserve.withDrawTo(receiver.address, reserveBalance)
            expect(await gold.balanceOf(reserve.address)).to.be.equal(0)
            expect(await gold.balanceOf(receiver.address)).to.be.equal(reserveBalance)
        });
    });
    describe('Combined with contract marketplace', () => {
        it('should withdraw correctly with fee from marketplace', async () => {
            let defaulFeeRate = 10
            let defaulFeeDecimal = 0
            let feeRecipientAddress = reserve.address
            let defaulPrice = ethers.utils.parseEther("100")
            let defaulBalance = ethers.utils.parseEther("10000")
            const Petty = await ethers.getContractFactory("Petty");
            petty = await Petty.deploy()
            await petty.deployed()

            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy(petty.address, defaulFeeDecimal, defaulFeeRate, feeRecipientAddress)
            await gold.transfer(buyer.address, defaulBalance)

            await marketplace.deployed()
            await marketplace.addPaymentToken(gold.address)
            await petty.mint(seller.address)
            await petty.connect(seller).setApprovalForAll(marketplace.address, true)
            await marketplace.connect(seller).addOrder(1, gold.address, defaulPrice)
            await gold.connect(buyer).approve(marketplace.address, defaulPrice)
            await marketplace.connect(buyer).excuteOrder(1)
            const reserveBalanceFee = defaulPrice.mul(10).div(100)
            await network.provider.send("evm_increaseTime", [oneWeek * 24])
            expect(await gold.balanceOf(reserve.address)).to.be.equal(reserveBalanceFee)
            await reserve.withDrawTo(receiver.address, reserveBalanceFee)
            expect(await gold.balanceOf(reserve.address)).to.be.equal(0)



        });
    });
});
