const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying Medical Insurance Claim Settlement System...")

  // Get deployer
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with:", deployer.address)

  // Mock USDC address (replace with actual USDC on mainnet)
  // For development: deploy a mock ERC20
  const MockUSDC = await ethers.getContractFactory("MockERC20")
  const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6)
  await usdc.waitForDeployment()
  console.log("Mock USDC deployed to:", await usdc.getAddress())

  // Deploy main contract
  const MedicalInsurance = await ethers.getContractFactory("MedicalInsuranceCore")
  const insurance = await MedicalInsurance.deploy(await usdc.getAddress())
  await insurance.waitForDeployment()
  console.log("MedicalInsuranceCore deployed to:", await insurance.getAddress())

  // Deploy escrow contract
  const Escrow = await ethers.getContractFactory("EscrowContract")
  const escrow = await Escrow.deploy(await usdc.getAddress())
  await escrow.waitForDeployment()
  console.log("EscrowContract deployed to:", await escrow.getAddress())

  // Save deployment addresses
  const deploymentAddresses = {
    usdc: await usdc.getAddress(),
    medicalInsurance: await insurance.getAddress(),
    escrow: await escrow.getAddress(),
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
  }

  console.log("\nDeployment completed!\n", JSON.stringify(deploymentAddresses, null, 2))

  return deploymentAddresses
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
