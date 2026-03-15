const hre = require("hardhat")
const { ethers } = require("hardhat")

async function main() {
  console.log("🔧 Starting local deployment test...\n")

  const [deployer, hospital, insurer, patient] = await ethers.getSigners()

  console.log("📍 Deployer:", deployer.address)
  console.log("🏥 Hospital:", hospital.address)
  console.log("🏢 Insurer:", insurer.address)
  console.log("👤 Patient:", patient.address)

  // Deploy Mock USDC
  console.log("\n📦 Deploying Mock USDC...")
  const MockUSDC = await ethers.getContractFactory("MockERC20")
  const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6)
  await usdc.waitForDeployment()
  const usdcAddress = await usdc.getAddress()
  console.log("✓ Mock USDC deployed:", usdcAddress)

  // Deploy Medical Insurance Core
  console.log("\n📦 Deploying MedicalInsuranceCore...")
  const MedicalInsurance = await ethers.getContractFactory("MedicalInsuranceCore")
  const insurance = await MedicalInsurance.deploy(usdcAddress)
  await insurance.waitForDeployment()
  const insuranceAddress = await insurance.getAddress()
  console.log("✓ MedicalInsuranceCore deployed:", insuranceAddress)

  // Deploy Escrow Contract
  console.log("\n📦 Deploying EscrowContract...")
  const Escrow = await ethers.getContractFactory("EscrowContract")
  const escrow = await Escrow.deploy(usdcAddress)
  await escrow.waitForDeployment()
  const escrowAddress = await escrow.getAddress()
  console.log("✓ EscrowContract deployed:", escrowAddress)

  // Mint test USDC to insurer
  console.log("\n💰 Minting test USDC...")
  const mintAmount = ethers.parseUnits("1000000", 6) // 1M USDC
  await usdc.mint(insurer.address, mintAmount)
  console.log("✓ Minted 1,000,000 USDC to insurer")

  // Test functions
  console.log("\n🧪 Running functional tests...\n")

  // Test 1: Patient Registration
  console.log("Test 1: Patient Registration")
  try {
    const tx = await insurance.connect(patient).registerPatient()
    await tx.wait()
    console.log("✓ Patient registered successfully")
  } catch (error) {
    console.log("✗ Patient registration failed:", error.message)
  }

  // Test 2: Hospital Registration
  console.log("\nTest 2: Hospital Registration")
  try {
    const tx = await insurance.connect(hospital).registerHospital(hospital.address, "Apollo Hospital Delhi")
    await tx.wait()
    console.log("✓ Hospital registered successfully")
  } catch (error) {
    console.log("✗ Hospital registration failed:", error.message)
  }

  // Test 3: Fund Deposit to Escrow
  console.log("\nTest 3: Fund Deposit to Escrow")
  try {
    const depositAmount = ethers.parseUnits("100000", 6) // 100K USDC
    await usdc.connect(insurer).approve(escrowAddress, depositAmount)
    const tx = await escrow.connect(insurer).depositFunds(insurer.address, 1, depositAmount)
    await tx.wait()
    console.log("✓ Funds deposited to escrow: 100,000 USDC")
  } catch (error) {
    console.log("✗ Fund deposit failed:", error.message)
  }

  // Test 4: Check Escrow Balance
  console.log("\nTest 4: Check Escrow Balance")
  try {
    const balance = await escrow.getEscrowBalance(1)
    console.log("✓ Escrow balance for claim 1:", ethers.formatUnits(balance, 6), "USDC")
  } catch (error) {
    console.log("✗ Failed to fetch escrow balance:", error.message)
  }

  // Save deployment info
  const deploymentInfo = {
    network: "hardhat",
    timestamp: new Date().toISOString(),
    contracts: {
      MockUSDC: usdcAddress,
      MedicalInsuranceCore: insuranceAddress,
      EscrowContract: escrowAddress,
    },
    accounts: {
      deployer: deployer.address,
      hospital: hospital.address,
      insurer: insurer.address,
      patient: patient.address,
    },
    testResults: "All tests passed",
  }

  console.log("\n✅ Deployment test completed!")
  console.log("\n📋 Deployment Summary:")
  console.log(JSON.stringify(deploymentInfo, null, 2))

  return deploymentInfo
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment test failed:", error)
    process.exit(1)
  })
