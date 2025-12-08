export type SampleClaim = {
  id: string
  policyId: string
  claimantName: string
  hospitalName: string
  insurerName: string
  diagnosis: string
  amount: number
  status: "NEW" | "SUBMITTED" | "VERIFIED" | "APPROVED" | "REJECTED" | "SETTLED"
  createdAt: string
  settledAt?: string | null
}

export type SmartContractExample = {
  id: string
  language: "solidity" | "rust"
  name: string
  description: string
  code: string
}

const indianNames = [
  "Rahul Sharma",
  "Priya Verma",
  "Amit Kumar",
  "Neha Singh",
  "Arjun Nair",
  "Ishita Iyer",
  "Ravi Kumar",
  "Ayesha Khan",
  "Kunal Mehta",
  "Sneha Patil",
  "Vikram Rao",
  "Ananya Das",
  "Suresh Reddy",
  "Meera Menon",
  "Harsh Vardhan",
  "Rohit Patil",
  "Suman Mishra",
  "Pooja Bhat",
  "Gaurav Jain",
  "Kiran Desai",
  "Aditya Nair",
  "Sameer Khan",
  "Divya Iyer",
  "Nikhil Deshmukh",
  "Asha Patel",
]

const hospitals = [
  "Apollo Hospitals, Delhi",
  "Fortis Memorial, Gurgaon",
  "Max Healthcare, Saket",
  "AIIMS, Delhi",
  "Kokilaben Dhirubhai Ambani, Mumbai",
  "Narayana Health, Bengaluru",
  "Medanta, Gurgaon",
  "Tata Memorial, Mumbai",
  "CMC, Vellore",
  "Ruby Hall, Pune",
  "Manipal Hospitals, Bengaluru",
  "Lilavati Hospital, Mumbai",
  "Delhi Heart Institute, Delhi",
]

const insurers = [
  "HDFC ERGO",
  "ICICI Lombard",
  "Star Health",
  "New India Assurance",
  "SBI General",
  "Bajaj Allianz",
  "Reliance General",
  "Tata AIG",
  "Oriental Insurance",
  "Cholamandalam",
  "United India Insurance",
]

const diagnoses = [
  "Appendectomy",
  "Cardiac Bypass",
  "Covid-19 Treatment",
  "Fracture Surgery",
  "Gallbladder Removal",
  "Knee Replacement",
  "Dialysis",
  "Cataract Surgery",
  "Cesarean Delivery",
  "Typhoid Treatment",
  "Hernia Repair",
  "Liver Surgery",
  "Kidney Stone Removal",
  "Prostate Surgery",
  "Bypass Graft",
]

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomAmount() {
  const buckets = [
    [15_000, 30_000],
    [30_001, 100_000],
    [100_001, 500_000],
    [500_001, 800_000],
    [800_001, 1_500_000],
  ] as const
  const [a, b] = rand(buckets)
  return randInt(a, b)
}
function dateFromToday(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString()
}

const statuses: SampleClaim["status"][] = ["NEW", "SUBMITTED", "VERIFIED", "APPROVED", "REJECTED", "SETTLED"]

export const sampleClaims: SampleClaim[] = Array.from({ length: 150 }).map((_, i) => {
  const status = rand(statuses)
  const createdOffset = randInt(5, 180)
  const createdAt = dateFromToday(createdOffset)
  let settledAt: string | null = null
  if (status === "SETTLED") {
    settledAt = dateFromToday(createdOffset - randInt(0, Math.min(45, createdOffset - 1)))
  }
  return {
    id: `CLAIM-${String(i + 1).padStart(5, "0")}`,
    policyId: `POL${100000 + i}`,
    claimantName: rand(indianNames),
    hospitalName: rand(hospitals),
    insurerName: rand(insurers),
    diagnosis: rand(diagnoses),
    amount: randomAmount(),
    status,
    createdAt,
    settledAt,
  }
})

export const solidityClaimContract: SmartContractExample = {
  id: "solidity-claim-01",
  language: "solidity",
  name: "Medical Insurance Claim Contract",
  description: "Handles claim submission, validation, and settlement on Ethereum",
  code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalInsuranceClaim {
    enum ClaimStatus { PENDING, VERIFIED, APPROVED, REJECTED, SETTLED }
    
    struct Claim {
        uint256 id;
        address patient;
        address hospital;
        uint256 amount;
        string diagnosis;
        ClaimStatus status;
        uint256 createdAt;
        uint256 settledAt;
    }
    
    mapping(uint256 => Claim) public claims;
    uint256 public claimCounter;
    address public insurer;
    
    event ClaimSubmitted(uint256 indexed claimId, address indexed patient, uint256 amount);
    event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount);
    event PaymentReleased(uint256 indexed claimId, address indexed hospital, uint256 amount);
    
    constructor() {
        insurer = msg.sender;
    }
    
    function submitClaim(address _hospital, uint256 _amount, string memory _diagnosis) 
        external returns (uint256) {
        claimCounter++;
        claims[claimCounter] = Claim({
            id: claimCounter,
            patient: msg.sender,
            hospital: _hospital,
            amount: _amount,
            diagnosis: _diagnosis,
            status: ClaimStatus.PENDING,
            createdAt: block.timestamp,
            settledAt: 0
        });
        emit ClaimSubmitted(claimCounter, msg.sender, _amount);
        return claimCounter;
    }
    
    function approveClaim(uint256 _claimId) external {
        require(msg.sender == insurer, "Only insurer can approve");
        require(claims[_claimId].status == ClaimStatus.PENDING, "Invalid status");
        claims[_claimId].status = ClaimStatus.APPROVED;
        emit ClaimApproved(_claimId, claims[_claimId].amount);
    }
    
    function releaseFunds(uint256 _claimId) external payable {
        require(msg.sender == insurer, "Only insurer can release funds");
        require(claims[_claimId].status == ClaimStatus.APPROVED, "Claim not approved");
        require(msg.value == claims[_claimId].amount, "Incorrect amount");
        
        Claim storage claim = claims[_claimId];
        claim.status = ClaimStatus.SETTLED;
        claim.settledAt = block.timestamp;
        
        (bool success, ) = claim.hospital.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit PaymentReleased(_claimId, claim.hospital, msg.value);
    }
    
    function getClaim(uint256 _claimId) external view returns (Claim memory) {
        return claims[_claimId];
    }
}`,
}

export const rustClaimContract: SmartContractExample = {
  id: "rust-claim-01",
  language: "rust",
  name: "Medical Insurance Claim (Solana/Anchor)",
  description: "Claim management program for Solana blockchain using Anchor framework",
  code: `use anchor_lang::prelude::*;

declare_id!("MedIns111111111111111111111111111111111111");

#[program]
pub mod medical_insurance {
    use super::*;

    pub fn submit_claim(
        ctx: Context<SubmitClaim>,
        amount: u64,
        diagnosis: String,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        claim.id = ctx.accounts.claim_counter.counter;
        claim.patient = ctx.accounts.patient.key();
        claim.hospital = ctx.accounts.hospital.key();
        claim.amount = amount;
        claim.diagnosis = diagnosis;
        claim.status = ClaimStatus::Pending;
        claim.created_at = Clock::get()?.unix_timestamp;
        
        ctx.accounts.claim_counter.counter += 1;
        
        emit!(ClaimSubmitted {
            claim_id: claim.id,
            patient: claim.patient,
            amount,
        });
        
        Ok(())
    }

    pub fn approve_claim(ctx: Context<ApproveClaim>) -> Result<()> {
        require!(
            ctx.accounts.insurer.key() == ctx.accounts.insurer_account.key(),
            CustomError::UnauthorizedInsurer
        );
        
        let claim = &mut ctx.accounts.claim;
        require!(
            claim.status == ClaimStatus::Pending,
            CustomError::InvalidClaimStatus
        );
        
        claim.status = ClaimStatus::Approved;
        
        emit!(ClaimApproved {
            claim_id: claim.id,
            amount: claim.amount,
        });
        
        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        require!(
            claim.status == ClaimStatus::Approved,
            CustomError::ClaimNotApproved
        );
        
        claim.status = ClaimStatus::Settled;
        claim.settled_at = Clock::get()?.unix_timestamp;
        
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.insurer.key(),
            &ctx.accounts.hospital.key(),
            claim.amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.insurer.to_account_info(),
                ctx.accounts.hospital.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        
        emit!(PaymentReleased {
            claim_id: claim.id,
            hospital: ctx.accounts.hospital.key(),
            amount: claim.amount,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SubmitClaim<'info> {
    #[account(init, payer = patient, space = 8 + 256)]
    pub claim: Account<'info, Claim>,
    #[account(mut)]
    pub patient: Signer<'info>,
    #[account(mut)]
    pub claim_counter: Account<'info, ClaimCounter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveClaim<'info> {
    #[account(mut)]
    pub claim: Account<'info, Claim>,
    pub insurer: Signer<'info>,
    #[account(constraint = insurer_account.key() == insurer.key())]
    pub insurer_account: Account<'info, InsurerAccount>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub claim: Account<'info, Claim>,
    #[account(mut)]
    pub insurer: Signer<'info>,
    #[account(mut)]
    pub hospital: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Claim {
    pub id: u64,
    pub patient: Pubkey,
    pub hospital: Pubkey,
    pub amount: u64,
    pub diagnosis: String,
    pub status: ClaimStatus,
    pub created_at: i64,
    pub settled_at: i64,
}

#[account]
pub struct ClaimCounter {
    pub counter: u64,
}

#[account]
pub struct InsurerAccount {
    pub authority: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ClaimStatus {
    Pending,
    Verified,
    Approved,
    Rejected,
    Settled,
}

#[event]
pub struct ClaimSubmitted {
    pub claim_id: u64,
    pub patient: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ClaimApproved {
    pub claim_id: u64,
    pub amount: u64,
}

#[event]
pub struct PaymentReleased {
    pub claim_id: u64,
    pub hospital: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum CustomError {
    #[msg("Only insurer can perform this action")]
    UnauthorizedInsurer,
    #[msg("Invalid claim status for this operation")]
    InvalidClaimStatus,
    #[msg("Claim must be approved before payment release")]
    ClaimNotApproved,
}`,
}

export const contractExamples: SmartContractExample[] = [solidityClaimContract, rustClaimContract]
