const { expect } = require ("chai");
const { ethers } = require ("hardhat");

describe('ERC20-SampleToken', () => {
    let [accountA, accountB, accountC] = [];
    let token;
    let amount = 100;
    let address0 = "0x0000000000000000000000000000000000000000"
    let totalSupply = 1000000;
    beforeEach(async () => {
        [accountA, accountB, accountC] = await ethers.getSigners()
        const Token = await ethers.getContractFactory("SampleToken")
        token = await Token.deploy();
        await token.deployed();
    });
    describe('common function', () => {
        it('totalsupply is correct', async () => {
            expect(await token.totalSupply()).to.be.equal(totalSupply)
        });
        it('Balance of account A is correct', async () => {
            expect(await token.balanceOf(accountA.address)).to.be.equal(totalSupply)
        });
        it('Balance of account B is correct', async () => {
            expect(await token.balanceOf(accountB.address)).to.be.equal(0)
            
        });
        it('Balance of account A allowance to account B is correct', async () => {
            expect(await token.allowance(accountA.address, accountB.address)).to.be.equal(0)
        });        
    });
    describe('transfer', () => {
        it('not enough money will be revert', async () => {
           await expect(token.transfer(accountB.address, totalSupply+1)).to.be.revertedWith("You have not enough money to transfer");
        });
        it('transfer money correct', async () => {
            const transferTx = token.transfer(accountB.address, amount);
            expect (await token.balanceOf(accountA.address)).to.be.equal(totalSupply-amount);
            await expect(transferTx).to.emit(token,"Transfer").withArgs(accountA.address, accountB.address, amount)
        });
    });
    describe('transferFrom', () => {
        it('not enough money will be revert2', async () => {
            await expect(token.connect(accountB).transferFrom(accountA.address, accountC.address, totalSupply+1)).to.be.revertedWith("You have not enough money to transferfrom")
        });
        it('not enough allowanc money will be revert2', async () => {
            token.connect(accountB).approve(accountA.address, amount)
            await expect (token.connect(accountB).transferFrom(accountA.address, accountC.address, amount+1)).to.be.reverted
        });
        it('transferFrom correctly', async () => {
            await token.approve(accountB.address, amount)
            let transferTx = await token.connect(accountB).transferFrom(accountA.address, accountC.address, amount)
            expect(await token.balanceOf(accountA.address)).to.be.equal(totalSupply-amount)
            expect(await token.balanceOf(accountC.address)).to.be.equal(amount)
            expect(await token.allowance(accountA.address, accountB.address)).to.be.equal(0)
            await expect(transferTx).to.emit(token, "Transfer").withArgs(accountA.address, accountC.address, amount)
        });
    });
    describe('approve', () => {
        it('approve should not work', async () => {
            await expect(token.approve(address0, amount)).to.be.revertedWith("ERC20: approve to the zero address");
        });

        it('approve should work', async () => {
            const approveTx = await token.approve(accountB.address, amount)
            expect(await token.allowance(accountA.address, accountB.address)).to.be.equal(amount)
            await expect(approveTx).to.emit(token,"Approval").withArgs(accountA.address, accountB.address, amount)
        });
    });
});