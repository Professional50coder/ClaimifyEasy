const { ethers } = require("hardhat")

async function testDeployment() {
  console.log("Testing Smart Contract Deployment on Local Network...\n")

  const [deployer, patient, hospital, insurer] = await ethers.getSigners()
  console.log("Deployer:", deployer.address)
  console.log("Patient:", patient.address)
  console.log("Hospital:", hospital.address)
  console.log("Insurer:", insurer.address)

  // Deploy Mock USDC
  console.log("\n1. Deploying Mock USDC...")
  const MockUSDC = await ethers.getContractFactory("MockERC20")
  const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6)
  await usdc.waitForDeployment()
  console.log("✓ USDC deployed:", await usdc.getAddress())

  // Deploy Medical Insurance Core
  console.log("\n2. Deploying MedicalInsuranceCore...")
  const MedicalInsurance = await ethers.getContractFactory("MedicalInsuranceCore")
  const insurance = await MedicalInsurance.deploy(await usdc.getAddress())
  await insurance.waitForDeployment()
  console.log("✓ MedicalInsuranceCore deployed:", await insurance.getAddress())

  // Deploy Escrow
  console.log("\n3. Deploying EscrowContract...")
  const Escrow = await ethers.getContractFactory("EscrowContract")
  const escrow = await Escrow.deploy(await usdc.getAddress())
  await escrow.waitForDeployment()
  console.log("✓ EscrowContract deployed:", await escrow.getAddress())

  // Test Patient Registration
  console.log("\n4. Testing Patient Registration...")
  await insurance.connect(patient).registerPatient()
  const isPatient = await insurance.isPatient(patient.address)
  console.log("✓ Patient registered:", isPatient)

  // Test Hospital Registration
  console.log("\n5. Testing Hospital Registration...")
  await insurance.registerHospital(hospital.address, "Apollo Hospitals Delhi")
  const isHospital = await insurance.isHospital(hospital.address)
  console.log("✓ Hospital registered:", isHospital)

  // Test Claim Submission
  console.log("\n6. Testing Claim Submission...")
  const claimAmount = ethers.parseUnits("50000", 6)
  const ipfsHash = "QmV1234567890abcdefghijklmnopqrstuvwxyz"

  const claimTx = await insurance.connect(patient).submitClaim(1, claimAmount, ipfsHash)
  await claimTx.wait()
  console.log("✓ Claim submitted successfully")

  // Test USDC Minting for Escrow
  console.log("\n7. Testing USDC Minting...")
  const mintAmount = ethers.parseUnits("1000000", 6)
  await usdc.mint(insurer.address, mintAmount)
  const balance = await usdc.balanceOf(insurer.address)
  console.log("✓ Insurer USDC balance:", ethers.formatUnits(balance, 6), "USDC")

  // Test Escrow Fund Deposit
  console.log("\n8. Testing Escrow Fund Deposit...")
  const escrowAmount = ethers.parseUnits("100000", 6)
  await usdc.connect(insurer).approve(await escrow.getAddress(), escrowAmount)
  const depositTx = await escrow.connect(insurer).depositFunds(1, insurer.address, escrowAmount)
  await depositTx.wait()
  console.log("✓ Funds deposited to escrow")

  // Check Escrow Balance
  const escrowBalance = await escrow.getEscrowBalance(1)
  console.log("✓ Escrow balance:", ethers.formatUnits(escrowBalance, 6), "USDC")

  // Summary
  console.log("\n" + "=".repeat(50))
  console.log("DEPLOYMENT TEST SUMMARY")
  console.log("=".repeat(50))
  console.log("USDC Address:", await usdc.getAddress())
  console.log("MedicalInsuranceCore Address:", await insurance.getAddress())
  console.log("EscrowContract Address:", await escrow.getAddress())
  console.log("Network:", (await ethers.provider.getNetwork()).name)
  console.log("All tests passed! ✓")
  console.log("=".repeat(50) + "\n")
}

testDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
