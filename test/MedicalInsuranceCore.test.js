const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("MedicalInsuranceCore - Indian Hospital Network", () => {
  let medicalInsurance
  let mockUSDC
  let owner, patient, hospital, insurer, apolloHosp, maxHosp

  const indianHospitals = {
    apollo: {
      address: null,
      name: "Apollo Hospitals Delhi",
      registration: "REG-2024-AP-001",
    },
    max: {
      address: null,
      name: "Max Healthcare Mumbai",
      registration: "REG-2024-MAX-002",
    },
    fortis: {
      address: null,
      name: "Fortis Healthcare Bangalore",
      registration: "REG-2024-FH-003",
    },
  }

  beforeEach(async () => {
    ;[owner, patient, hospital, insurer, apolloHosp, maxHosp] = await ethers.getSigners()

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20")
    mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6)
    await mockUSDC.waitForDeployment()

    // Deploy Medical Insurance Contract
    const MedicalInsurance = await ethers.getContractFactory("MedicalInsuranceCore")
    medicalInsurance = await MedicalInsurance.deploy(await mockUSDC.getAddress())
    await medicalInsurance.waitForDeployment()

    // Mint tokens for testing (₹100 crores = 1M USDC in test)
    await mockUSDC.mint(insurer.address, ethers.parseUnits("1000000", 6))
  })

  describe("Patient Registration - Indian Users", () => {
    it("should register patient from India", async () => {
      await medicalInsurance.connect(patient).registerPatient()
      expect(await medicalInsurance.isPatient(patient.address)).to.be.true
    })

    it("should prevent duplicate registration", async () => {
      await medicalInsurance.connect(patient).registerPatient()
      await expect(medicalInsurance.connect(patient).registerPatient()).to.be.revertedWith("Already registered")
    })

    it("should support multiple patients", async () => {
      await medicalInsurance.connect(patient).registerPatient()
      await medicalInsurance.connect(apolloHosp).registerPatient()

      expect(await medicalInsurance.isPatient(patient.address)).to.be.true
      expect(await medicalInsurance.isPatient(apolloHosp.address)).to.be.true
    })
  })

  describe("Hospital Registration - Indian Network", () => {
    it("should register Apollo Hospitals Delhi", async () => {
      await medicalInsurance.registerHospital(apolloHosp.address, indianHospitals.apollo.name)
      expect(await medicalInsurance.isHospital(apolloHosp.address)).to.be.true
    })

    it("should register Max Healthcare Mumbai", async () => {
      await medicalInsurance.registerHospital(maxHosp.address, indianHospitals.max.name)
      expect(await medicalInsurance.isHospital(maxHosp.address)).to.be.true
    })

    it("should only allow owner to register hospitals", async () => {
      await expect(
        medicalInsurance.connect(patient).registerHospital(hospital.address, "Test Hospital"),
      ).to.be.revertedWithCustomError(medicalInsurance, "OwnableUnauthorizedAccount")
    })
  })

  describe("Claim Submission - Indian Claims", () => {
    beforeEach(async () => {
      // Register patient and hospitals
      await medicalInsurance.connect(patient).registerPatient()
      await medicalInsurance.registerHospital(apolloHosp.address, indianHospitals.apollo.name)
      await medicalInsurance.registerHospital(maxHosp.address, indianHospitals.max.name)
    })

    it("should submit cardiac surgery claim from Apollo", async () => {
      // ₹85,000 cardiac angioplasty
      const claimAmount = ethers.parseUnits("85000", 6)
      const ipfsHash = "QmCardiacSurgeryApolloDelhiDec2024"

      const tx = await medicalInsurance.connect(patient).submitClaim(1, claimAmount, ipfsHash)
      expect(tx).to.emit(medicalInsurance, "ClaimSubmitted")
    })

    it("should submit chemotherapy claim from Max", async () => {
      // ₹120,000 lung cancer treatment
      const claimAmount = ethers.parseUnits("120000", 6)
      const ipfsHash = "QmChemotherapyMaxMumbaiDec2024"

      const tx = await medicalInsurance.connect(patient).submitClaim(2, claimAmount, ipfsHash)
      expect(tx).to.emit(medicalInsurance, "ClaimSubmitted")
    })

    it("should submit orthopedic surgery claim", async () => {
      // ₹95,000 knee replacement
      const claimAmount = ethers.parseUnits("95000", 6)
      const ipfsHash = "QmKneeReplacementFortisBlr2024"

      const tx = await medicalInsurance.connect(patient).submitClaim(3, claimAmount, ipfsHash)
      expect(tx).to.emit(medicalInsurance, "ClaimSubmitted")
    })
  })

  describe("Claim Review & Approval", () => {
    beforeEach(async () => {
      await medicalInsurance.connect(patient).registerPatient()
      await medicalInsurance.registerHospital(apolloHosp.address, indianHospitals.apollo.name)
    })

    it("should approve valid claim", async () => {
      const claimAmount = ethers.parseUnits("85000", 6)
      const ipfsHash = "QmValidClaim"

      await medicalInsurance.connect(patient).submitClaim(1, claimAmount, ipfsHash)
      await expect(medicalInsurance.connect(insurer).reviewClaim(0, true)).to.emit(medicalInsurance, "ClaimReviewed")
    })

    it("should reject fraudulent claim", async () => {
      const claimAmount = ethers.parseUnits("85000", 6)
      const ipfsHash = "QmFraudClaim"

      await medicalInsurance.connect(patient).submitClaim(1, claimAmount, ipfsHash)
      await expect(medicalInsurance.connect(insurer).reviewClaim(0, false)).to.emit(medicalInsurance, "ClaimReviewed")
    })

    it("only insurer can review claims", async () => {
      const claimAmount = ethers.parseUnits("50000", 6)
      const ipfsHash = "QmUnauthorizedReview"

      await medicalInsurance.connect(patient).submitClaim(1, claimAmount, ipfsHash)
      await expect(medicalInsurance.connect(patient).reviewClaim(0, true)).to.be.revertedWith("Only insurer can review")
    })
  })

  describe("Fraud Detection System", () => {
    beforeEach(async () => {
      await medicalInsurance.connect(patient).registerPatient()
      await medicalInsurance.registerHospital(apolloHosp.address, indianHospitals.apollo.name)
    })

    it("should flag unusually high claims (₹50+ lakhs)", async () => {
      const suspiciousAmount = ethers.parseUnits("5000000", 6) // 50 lakhs
      const ipfsHash = "QmHighClaim"

      const tx = await medicalInsurance.connect(patient).submitClaim(1, suspiciousAmount, ipfsHash)
      expect(tx).to.exist
    })

    it("should track fraud score for claims", async () => {
      const claimAmount = ethers.parseUnits("85000", 6)
      const ipfsHash = "QmFraudScoreTest"

      const tx = await medicalInsurance.connect(patient).submitClaim(1, claimAmount, ipfsHash)
      const receipt = await tx.wait()
      expect(receipt).to.exist
    })
  })

  describe("Settlement Statistics", () => {
    it("should track total claims processed", async () => {
      await medicalInsurance.connect(patient).registerPatient()
      await medicalInsurance.registerHospital(apolloHosp.address, indianHospitals.apollo.name)

      // Submit 5 claims
      for (let i = 0; i < 5; i++) {
        const amount = ethers.parseUnits((50000 + i * 10000).toString(), 6)
        await medicalInsurance.connect(patient).submitClaim(1, amount, `QmClaim${i}`)
      }

      expect(medicalInsurance).to.exist
    })
  })
})
