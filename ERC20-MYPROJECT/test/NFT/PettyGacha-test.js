const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe('Petty', function () {
    let [accountA, accountB, accountC] = [];
    let pettyGacha;
    let gold;
    let address0 = "0x0000000000000000000000000000000000000000";
    let defaulBalance = ethers.utils.parseEther("1000000")
    let priceGacha1 = ethers.utils.parseEther("100")
    let priceGacha2 = ethers.utils.parseEther("200")
    let priceGacha3 = ethers.utils.parseEther("300")
    let oneDay = 86400
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners();
        const Gold = await ethers.getContractFactory("Gold");
        gold = await Gold.deploy();
        await gold.deployed();
        const PettyGacha = await ethers.getContractFactory("PettyGacha")
        pettyGacha = await PettyGacha.deploy(gold.address)
        await pettyGacha.deployed()

        await gold.approve(pettyGacha.address, defaulBalance)
    })
    describe('openGacha', () => {
        it('should revert gacha nonexistent', async () => {
            await expect(pettyGacha.openGacha(7, priceGacha1)).to.be.revertedWith("PettyGacha: invalid Gacha")
        });
        it('should revert with incorrect price', async () => {
            await expect(pettyGacha.openGacha(1, priceGacha2)).to.be.revertedWith("PettyGacha: price not match")
        });
        it('should open gacha correctly gacha 1', async () => {
            var times = 3;
            for (var i = 1; i <= times; i++) {
                await pettyGacha.openGacha(1, priceGacha1)
                const petty = await pettyGacha._tokenIdToPetty(i)
                console.log(petty.rank)
                expect(await pettyGacha.ownerOf(i)).to.be.equal(accountA.address)
            }
            expect(await gold.balanceOf(pettyGacha.address)).to.be.equal(priceGacha1.mul(times))
            expect(await gold.balanceOf(accountA.address)).to.be.equal(defaulBalance.sub(priceGacha1.mul(times)))
        });
        it('should open gacha correctly gacha 2', async () => {
            var times = 3;
            for (var i = 1; i <= times; i++) {
                await pettyGacha.openGacha(2, priceGacha2)
                const petty = await pettyGacha._tokenIdToPetty(i)
                console.log(petty.rank)
                expect(await pettyGacha.ownerOf(i)).to.be.equal(accountA.address)
            }
            expect(await gold.balanceOf(pettyGacha.address)).to.be.equal(priceGacha2.mul(times))
            expect(await gold.balanceOf(accountA.address)).to.be.equal(defaulBalance.sub(priceGacha2.mul(times)))
        });
        it('should open gacha correctly gacha 3', async () => {
            var times = 3;
            for (var i = 1; i <= times; i++) {
                await pettyGacha.openGacha(3, priceGacha3)
                const petty = await pettyGacha._tokenIdToPetty(i)
                console.log(petty.rank)
                expect(await pettyGacha.ownerOf(i)).to.be.equal(accountA.address)
            }
            expect(await gold.balanceOf(pettyGacha.address)).to.be.equal(priceGacha3.mul(times))
            expect(await gold.balanceOf(accountA.address)).to.be.equal(defaulBalance.sub(priceGacha3.mul(times)))
        });



    });
    describe('breesKittes', () => {
        it('should revert if isnt owner', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(1, priceGacha1)
            await pettyGacha.openGacha(1, priceGacha1)
            await expect(pettyGacha.connect(accountB).breedPetties(1, 2)).to.be.revertedWith("PettyGacha: sender is not owner of token")
        });
        it('should revert if not same rank', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.openGacha(5, priceGacha1)
            await expect(pettyGacha.breedPetties(1, 2)).to.be.revertedWith("PettyGacha: must same rank")
        });
        it('should revert if rank is highest rank', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(6, priceGacha1)
            await pettyGacha.openGacha(6, priceGacha1)
            await expect(pettyGacha.breedPetties(1, 2)).to.be.revertedWith("PettyGacha: petties is at the highest rank")
        });
        it('should revert if not approve', async () => {
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.openGacha(4, priceGacha1)
            await expect(pettyGacha.breedPetties(1, 2)).to.be.revertedWith("PettyGacha: The contract is unauthorized to manage this token")
        });
        it('correctly with petty rank 1', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.breedPetties(1, 2)
            await expect(pettyGacha.ownerOf(1)).to.be.revertedWith("ERC721: owner query for nonexistent token")
            await expect(pettyGacha.ownerOf(2)).to.be.revertedWith("ERC721: owner query for nonexistent token")
            const blockNum = await ethers.provider.getBlockNumber()
            const block = await ethers.provider.getBlock(blockNum)

            let breedInfo = await pettyGacha._breedIdToInfo(1)
            expect(breedInfo.startTime).to.be.equal(await block.timestamp)
            expect(breedInfo.breedTime).to.be.equal(oneDay)
            expect(breedInfo.owner).to.be.equal(accountA.address)
            expect(breedInfo.matron).to.be.equal(1)
            expect(breedInfo.sire).to.be.equal(2)
            expect(breedInfo.newRank).to.be.equal(2)
        });
        it('correctly with petty rank 2', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(5, priceGacha1)
            await pettyGacha.openGacha(5, priceGacha1)
            await pettyGacha.breedPetties(1, 2)
            await expect(pettyGacha.ownerOf(1)).to.be.revertedWith("ERC721: owner query for nonexistent token")
            await expect(pettyGacha.ownerOf(2)).to.be.revertedWith("ERC721: owner query for nonexistent token")
            const blockNum = await ethers.provider.getBlockNumber()
            const block = await ethers.provider.getBlock(blockNum)
            let breedInfo = await pettyGacha._breedIdToInfo(1)
            expect(breedInfo.startTime).to.be.equal(block.timestamp)
            expect(breedInfo.breedTime).to.be.equal(oneDay * 2)
            expect(breedInfo.owner).to.be.equal(accountA.address)
            expect(breedInfo.matron).to.be.equal(1)
            expect(breedInfo.sire).to.be.equal(2)
            expect(breedInfo.newRank).to.be.equal(3)
        });
    });
    describe('claimPetty', () => {
        it('should revert if owner is not right', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.breedPetties(1, 2)
            await expect(pettyGacha.connect(accountB).claimPetty(1)).to.be.revertedWith("PettyGacha: sender is not breed owner")
        });
        it('should revert if breed time hasnt been exceeded in rank 1', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.openGacha(4, priceGacha1)

            await pettyGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay*1 - 1])
            await expect(pettyGacha.claimPetty(1)).to.be.revertedWith("PettyGacha: breed time hasn't been exceeded")

        });
        it('correctly with Petties rank1 ', async () => {
            // await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            // await pettyGacha.openGacha(4, priceGacha1)
            // await pettyGacha.openGacha(4, priceGacha1)
            // await pettyGacha.breedPetties(1, 2)
            // await network.provider.send("evm_increaseTime", [oneDay*1 + 1])
            // await pettyGacha.claimPetty(1)
            // const petty3 = await pettyGacha._tokenIdToPetty(3)
            // expect(petty3.rank).to.be.equal(2)
            // let breedInfo = await pettyGacha._breedIdToInfo(1)
            // expect(breedInfo.startTime).to.be.equal(0)
            // expect(breedInfo.breedTime).to.be.equal(0)
            // expect(breedInfo.owner).to.be.equal(address0)
            // expect(breedInfo.matron).to.be.equal(0)
            // expect(breedInfo.sire).to.be.equal(0)
            // expect(breedInfo.newRank).to.be.equal(0)

            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.openGacha(4, priceGacha1)
            await pettyGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay * 1 + 1])
            await pettyGacha.claimPetty(1)
            const petty3 = await pettyGacha._tokenIdToPetty(3)
            expect(petty3.rank).to.be.equal(2)
            let breedInfo = await pettyGacha._breedIdToInfo(1)
            expect(breedInfo.startTime).to.be.equal(0)
            expect(breedInfo.breedTime).to.be.equal(0)
            expect(breedInfo.owner).to.be.equal(address0)
            expect(breedInfo.matron).to.be.equal(0)
            expect(breedInfo.sire).to.be.equal(0)
            expect(breedInfo.newRank).to.be.equal(0)
        });
        it('should revert if breed time hasnt been exceeded in rank 2', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(5, priceGacha1)
            await pettyGacha.openGacha(5, priceGacha1)

            await pettyGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay*2 - 1])
            await expect(pettyGacha.claimPetty(1)).to.be.revertedWith("PettyGacha: breed time hasn't been exceeded")

        });
        it('correctly with Petties rank 2 ', async () => {
            await pettyGacha.setApprovalForAll(pettyGacha.address, true)
            await pettyGacha.openGacha(5, priceGacha1)
            await pettyGacha.openGacha(5, priceGacha1)
            await pettyGacha.breedPetties(1, 2)
            await network.provider.send("evm_increaseTime", [oneDay*2 + 1])
            await pettyGacha.claimPetty(1)
            const petty3 = await pettyGacha._tokenIdToPetty(3)
            expect(petty3.rank).to.be.equal(3)
            let breedInfo = await pettyGacha._breedIdToInfo(1)
            expect(breedInfo.startTime).to.be.equal(0)
            expect(breedInfo.breedTime).to.be.equal(0)
            expect(breedInfo.owner).to.be.equal(address0)
            expect(breedInfo.matron).to.be.equal(0)
            expect(breedInfo.sire).to.be.equal(0)
            expect(breedInfo.newRank).to.be.equal(0)
        });
    });
})