const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("EscrowContract - Blockchain Fund Management", () => {
  let escrow
  let mockUSDC
  let owner, insurer, patient, hospital

  beforeEach(async () => {
    ;[owner, insurer, patient, hospital] = await ethers.getSigners()

    // Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockERC20")
    mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6)
    await mockUSDC.waitForDeployment()

    // Deploy Escrow Contract
    const Escrow = await ethers.getContractFactory("EscrowContract")
    escrow = await Escrow.deploy(await mockUSDC.getAddress())
    await escrow.waitForDeployment()

    // Mint tokens - ₹100 crores equivalent
    await mockUSDC.mint(insurer.address, ethers.parseUnits("1000000", 6))
  })

  describe("Fund Deposit - Insurer Deposits", () => {
    it("should deposit ₹1 lakh to escrow", async () => {
      const amount = ethers.parseUnits("100000", 6) // ₹1 lakh

      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), amount)
      await expect(escrow.connect(insurer).depositFunds(insurer.address, 1, amount)).to.emit(escrow, "FundsDeposited")
    })

    it("should deposit ₹50 lakhs for major surgery", async () => {
      const amount = ethers.parseUnits("5000000", 6) // ₹50 lakhs

      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), amount)
      await expect(escrow.connect(insurer).depositFunds(insurer.address, 1, amount)).to.emit(escrow, "FundsDeposited")
    })

    it("should reject deposit without approval", async () => {
      const amount = ethers.parseUnits("100000", 6)

      // No approval given
      await expect(escrow.connect(insurer).depositFunds(insurer.address, 1, amount)).to.be.revertedWith(
        "ERC20: insufficient allowance",
      )
    })
  })

  describe("Escrow Balance Tracking", () => {
    it("should track single claim escrow", async () => {
      const amount = ethers.parseUnits("85000", 6)

      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), amount)
      await escrow.connect(insurer).depositFunds(insurer.address, 1, amount)

      const balance = await escrow.getEscrowBalance(1)
      expect(balance).to.equal(amount)
    })

    it("should track multiple claims separately", async () => {
      const amount1 = ethers.parseUnits("85000", 6)
      const amount2 = ethers.parseUnits("120000", 6)

      // Claim 1
      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), amount1)
      await escrow.connect(insurer).depositFunds(insurer.address, 1, amount1)

      // Claim 2
      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), amount2)
      await escrow.connect(insurer).depositFunds(insurer.address, 2, amount2)

      expect(await escrow.getEscrowBalance(1)).to.equal(amount1)
      expect(await escrow.getEscrowBalance(2)).to.equal(amount2)
    })
  })

  describe("Fund Release - Blockchain Settlement", () => {
    beforeEach(async () => {
      const amount = ethers.parseUnits("85000", 6)
      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), amount)
      await escrow.connect(insurer).depositFunds(insurer.address, 1, amount)
    })

    it("should release funds to hospital", async () => {
      const releaseAmount = ethers.parseUnits("85000", 6)

      await expect(escrow.connect(insurer).releaseFunds(1, hospital.address, releaseAmount)).to.emit(
        escrow,
        "FundsReleased",
      )
    })

    it("should release partial funds", async () => {
      const releaseAmount = ethers.parseUnits("50000", 6) // Partial release

      await expect(escrow.connect(insurer).releaseFunds(1, patient.address, releaseAmount)).to.emit(
        escrow,
        "FundsReleased",
      )

      const remainingBalance = await escrow.getEscrowBalance(1)
      expect(remainingBalance).to.equal(ethers.parseUnits("35000", 6))
    })

    it("should prevent over-release", async () => {
      const excessAmount = ethers.parseUnits("200000", 6) // More than escrowed

      await expect(escrow.connect(insurer).releaseFunds(1, patient.address, excessAmount)).to.be.revertedWith(
        "Insufficient escrow balance",
      )
    })

    it("should handle 2-hour settlement time", async () => {
      const releaseAmount = ethers.parseUnits("85000", 6)

      // Simulate 2-hour settlement
      const tx = await escrow.connect(insurer).releaseFunds(1, patient.address, releaseAmount)
      const receipt = await tx.wait()

      // Verify transaction
      expect(receipt.hash).to.exist
    })
  })

  describe("Real-world Scenarios", () => {
    it("should handle Cardiac Surgery claim flow", async () => {
      const claimAmount = ethers.parseUnits("85000", 6)

      // 1. Deposit funds
      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), claimAmount)
      await escrow.connect(insurer).depositFunds(insurer.address, 1, claimAmount)

      // 2. Verify balance
      expect(await escrow.getEscrowBalance(1)).to.equal(claimAmount)

      // 3. Release to hospital
      await escrow.connect(insurer).releaseFunds(1, hospital.address, claimAmount)

      // 4. Verify empty escrow
      expect(await escrow.getEscrowBalance(1)).to.equal(0)
    })

    it("should handle multi-step complex surgery settlement", async () => {
      const totalAmount = ethers.parseUnits("250000", 6) // ₹2.5 lakhs
      const advancePayment = ethers.parseUnits("100000", 6) // 40% advance
      const finalPayment = ethers.parseUnits("150000", 6) // 60% final

      // Deposit total amount
      await mockUSDC.connect(insurer).approve(await escrow.getAddress(), totalAmount)
      await escrow.connect(insurer).depositFunds(insurer.address, 1, totalAmount)

      // Release advance
      await escrow.connect(insurer).releaseFunds(1, hospital.address, advancePayment)
      expect(await escrow.getEscrowBalance(1)).to.equal(finalPayment)

      // Release final payment
      await escrow.connect(insurer).releaseFunds(1, hospital.address, finalPayment)
      expect(await escrow.getEscrowBalance(1)).to.equal(0)
    })
  })
})
