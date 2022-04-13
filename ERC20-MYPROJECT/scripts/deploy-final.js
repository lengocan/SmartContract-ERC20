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
  let petty
  let gold
  let tokenSale
  let reserve
  let marketplace
  let defaulFeeRate = 0
  let defaulDecimal = 0

  //Deploy Petty
  const Petty = await ethers.getContractFactory("Petty");
  petty = await Petty.deploy()
  await petty.deployed()
  console.log("Petty deployed to:", petty.address)
  // Deploy Gold
  const Gold = await ethers.getContractFactory("Gold")
  gold = await Gold.deploy()
  await gold.deployed()
  console.log("Gold deployed to:", gold.address)
  // Deploy tokenSale
  TokenSale = await ethers.getContractFactory("TokenSale")
  tokenSale = await TokenSale.deploy(gold.address)
  const transferTx = await gold.transfer(tokenSale.address, ethers.utils.parseUnits("1000000", "ether"))
  await transferTx.wait()
  console.log("tokenSale deployed to:", tokenSale.address)
  //Deploy reserve
  const Reserve = await ethers.getContractFactory("Reserve")
  reserve = await Reserve.deploy(gold.address)
  console.log("Reserve deployed to:", reserve.address)
  //Deploy marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace")
  marketplace = await Marketplace.deploy(petty.address,defaulFeeRate,defaulDecimal,reserve.address)
  await marketplace.deployed()
  console.log("Marketplace deployed to:", marketplace.address)

  const addPaymentTx = await marketplace.addPaymentToken(gold.address)
  await addPaymentTx.wait()

  console.log("Gold is payment token? true or false", await marketplace.isPaymentTokenSupported(gold.address))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
