// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const TokenAddress = "0xB2F951a8a58253F008a0759fe8D6E2eEd79f2A45"
    
    const gold = await ethers.getContractAt("Gold", TokenAddress)

    const TokenSale = await ethers.getContractFactory("TokenSale");
    const tokenSale = await TokenSale.deploy(TokenAddress);
    await tokenSale.deployed();
    console.log("tokenSale deploy to:", tokenSale.address);
    const transferTx = await gold.transfer(tokenSale.address, ethers.utils.parseUnits("10000", "ether"))
    await transferTx.wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

//0xa21954Ff9bb2641FDDe87ea49097e548D56651Bb