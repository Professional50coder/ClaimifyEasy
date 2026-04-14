const { ethers } = require("hardhat")
const hre = require("hardhat") // Declare hre variable

async function verifyContracts() {
  console.log("Verifying Smart Contracts on Block Explorer...\n")

  // Read deployment addresses from deployment file or environment
  const deploymentAddresses = {
    usdc: process.env.USDC_ADDRESS,
    medicalInsurance: process.env.MEDICAL_INSURANCE_ADDRESS,
    escrow: process.env.ESCROW_ADDRESS,
  }

  console.log("Deployment Addresses:")
  console.log(JSON.stringify(deploymentAddresses, null, 2))

  // Verify Mock USDC
  if (deploymentAddresses.usdc) {
    console.log("\nVerifying Mock USDC...")
    try {
      await hre.run("verify:verify", {
        address: deploymentAddresses.usdc,
        constructorArguments: ["USD Coin", "USDC", 6],
      })
      console.log("✓ USDC verified")
    } catch (error) {
      console.log("USDC verification note:", error.message)
    }
  }

  // Verify Medical Insurance Core
  if (deploymentAddresses.medicalInsurance) {
    console.log("\nVerifying MedicalInsuranceCore...")
    try {
      await hre.run("verify:verify", {
        address: deploymentAddresses.medicalInsurance,
        constructorArguments: [deploymentAddresses.usdc],
      })
      console.log("✓ MedicalInsuranceCore verified")
    } catch (error) {
      console.log("MedicalInsuranceCore verification note:", error.message)
    }
  }

  // Verify Escrow Contract
  if (deploymentAddresses.escrow) {
    console.log("\nVerifying EscrowContract...")
    try {
      await hre.run("verify:verify", {
        address: deploymentAddresses.escrow,
        constructorArguments: [deploymentAddresses.usdc],
      })
      console.log("✓ EscrowContract verified")
    } catch (error) {
      console.log("EscrowContract verification note:", error.message)
    }
  }

  console.log("\nVerification process completed.")
}

verifyContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
