import { getContractById, createContract, actOnContract, listContractsForRole } from "@/lib/db"
import {
  deploySmartContract,
  executeContractAction,
  verifyContractDeployment,
  queryContractState,
  getContractAuditTrail,
} from "@/lib/blockchain"
import type { User } from "@/lib/types"

export async function apiListContracts(user: User) {
  return listContractsForRole(user)
}

export async function apiGetContract(id: string) {
  return getContractById(id) || null
}

export async function apiDeployContract(params: {
  claimId: string
  policyId: string
  amount: number
  insurerWallet: string
  hospitalWallet: string
  date: number
  createdBy: User
}) {
  try {
    const { address, txHash, blockNumber, gasUsed } = await deploySmartContract(params)
    const contract = createContract({
      ...params,
      address,
      txHash,
    })
    if (contract.error) {
      return contract
    }
    return {
      contract: contract.contract,
      deployment: { blockNumber, gasUsed, txHash },
    }
  } catch (error) {
    return { error: `Deployment failed: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function apiVerifyContractDeployment(contractId: string) {
  const contract = getContractById(contractId)
  if (!contract) return { error: "Contract not found" as const }

  try {
    const verification = await verifyContractDeployment(contract.address, contract.lastTxId || "")
    return { ...verification, contract }
  } catch (error) {
    return { error: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function apiExecuteAction(params: {
  id: string
  actor: User
  action: "approve" | "reject" | "release_payment" | "request_settlement"
}) {
  const contract = getContractById(params.id)
  if (!contract) return { error: "Contract not found" as const }

  try {
    const { txHash, blockNumber, gasUsed, status } = await executeContractAction({
      address: contract.address,
      action: params.action,
    })
    const result = actOnContract({ ...params, txHash })
    if (result.error) {
      return result
    }
    return {
      contract: result.contract,
      transaction: { txHash, blockNumber, gasUsed, status },
    }
  } catch (error) {
    return { error: `Action failed: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function apiQueryContractState(contractId: string) {
  const contract = getContractById(contractId)
  if (!contract) return { error: "Contract not found" as const }

  try {
    const state = await queryContractState(contract.address)
    return { ...state, contract }
  } catch (error) {
    return { error: `State query failed: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function apiGetContractAuditTrail(contractId: string) {
  const contract = getContractById(contractId)
  if (!contract) return { error: "Contract not found" as const }

  try {
    const auditTrail = await getContractAuditTrail(contract.address)
    return { auditTrail, contract }
  } catch (error) {
    return { error: `Audit trail fetch failed: ${error instanceof Error ? error.message : "Unknown error"}` }
  }
}

export async function apiGetContractAnalytics() {
  return {
    totalDeployed: 0,
    activeContracts: 0,
    completedContracts: 0,
    failedContracts: 0,
    totalValueLocked: 0,
  }
}
