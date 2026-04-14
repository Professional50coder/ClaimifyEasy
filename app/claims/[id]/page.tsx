"use client"

import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ClaimDetailContent } from "@/components/claim-detail-content"

// Demo claims data
const demoClains = [
  {
    id: "CLM-2024-001",
    patientId: "PAT-001",
    diagnosis: "Motor Vehicle Accident - Multiple Injuries",
    amount: 15000,
    status: "under_review",
    documents: ["receipt_001.pdf", "medical_report_001.pdf", "police_report_001.pdf"],
    createdAt: 1710000000000,
  },
  {
    id: "CLM-2024-002",
    patientId: "PAT-002",
    diagnosis: "Surgical Procedure - Emergency",
    amount: 25000,
    status: "approved",
    documents: ["surgery_invoice.pdf", "hospital_records.pdf"],
    createdAt: 1709000000000,
  },
  {
    id: "CLM-2024-003",
    patientId: "PAT-003",
    diagnosis: "Dental Treatment - Root Canal",
    amount: 1500,
    status: "submitted",
    documents: ["dental_receipt.pdf", "x_ray.pdf"],
    createdAt: 1708000000000,
  },
]

export default function ClaimDetailPage() {
  const params = useParams()
  const claimId = params.id as string

  const claim = demoClains.find((c) => c.id === claimId)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName="User" userRole="admin" onSignOut={async () => {}} />

      {/* Main content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {claim ? (
          <ClaimDetailContent claimId={claimId} claim={claim} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Claim Not Found</h2>
            <p className="text-gray-600">The claim {claimId} does not exist.</p>
          </div>
        )}
      </main>
    </div>
  )
}
