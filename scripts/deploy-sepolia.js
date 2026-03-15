const { ethers } = require("hardhat")

async function main() {
  console.log("🚀 Deploying to Sepolia testnet...\n")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying with:", deployer.address)

  // Get balance
  const balance = await ethers.provider.getBalance(deployer.address)
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n")

  if (balance === 0n) {
    throw new Error("❌ Insufficient balance. Get Sepolia ETH from faucet: https://faucets.chain.link/sepolia")
  }

  // Use USDC on Sepolia (0x6f3C3Ba541e1Dff1074a546f7d528d38dfB3b883)
  const usdcAddress = "0x6f3C3Ba541e1Dff1074a546f7d528d38dfB3b883"

  console.log("📦 Deploying MedicalInsuranceCore...")
  const MedicalInsurance = await ethers.getContractFactory("MedicalInsuranceCore")
  const insurance = await MedicalInsurance.deploy(usdcAddress)
  await insurance.waitForDeployment()
  const insuranceAddress = await insurance.getAddress()
  console.log("✓ MedicalInsuranceCore:", insuranceAddress)

  console.log("\n📦 Deploying EscrowContract...")
  const Escrow = await ethers.getContractFactory("EscrowContract")
  const escrow = await Escrow.deploy(usdcAddress)
  await escrow.waitForDeployment()
  const escrowAddress = await escrow.getAddress()
  console.log("✓ EscrowContract:", escrowAddress)

  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      USDC: usdcAddress,
      MedicalInsuranceCore: insuranceAddress,
      EscrowContract: escrowAddress,
    },
    blockExplorerLinks: {
      MedicalInsurance: `https://sepolia.etherscan.io/address/${insuranceAddress}`,
      Escrow: `https://sepolia.etherscan.io/address/${escrowAddress}`,
    },
  }

  console.log("\n✅ Deployment to Sepolia complete!")
  console.log(JSON.stringify(deploymentInfo, null, 2))

  return deploymentInfo
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message)
    process.exit(1)
  })
