import { createClient } from '@/lib/supabase/server'
import type {
  Claim,
  ClaimDocument,
  AuditLog,
  Database,
} from '@/lib/types'

/**
 * Claims Database Operations
 */
export async function createClaim(userId: string, claim: Omit<Claim, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claims')
    .insert({
      ...claim,
      patient_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('[v0] Error creating claim:', error)
    return { claim: null, error }
  }

  // Log the action
  await logAuditAction(userId, 'claim_created', { claim_id: data.id })

  return { claim: data as Claim, error: null }
}

export async function getClaim(claimId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('id', claimId)
    .eq('patient_id', userId)
    .single()

  return { claim: data as Claim | null, error }
}

export async function getUserClaims(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })

  return { claims: data as Claim[] | null, error }
}

export async function getAllClaims(
  userId: string,
  userRole: string,
  filters?: {
    status?: string
    claimType?: string
  },
) {
  const supabase = await createClient()

  let query = supabase.from('claims').select('*')

  // If user is patient, only show their claims
  if (userRole === 'patient') {
    query = query.eq('patient_id', userId)
  }
  // Hospitals and insurers can see all claims
  // Admins can see all claims

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.claimType) {
    query = query.eq('claim_type', filters.claimType)
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  })

  return { claims: data as Claim[] | null, error }
}

export async function updateClaim(
  claimId: string,
  userId: string,
  updates: Partial<Claim>,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claims')
    .update(updates)
    .eq('id', claimId)
    .eq('patient_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error updating claim:', error)
    return { claim: null, error }
  }

  await logAuditAction(userId, 'claim_updated', {
    claim_id: claimId,
    changes: updates,
  })

  return { claim: data as Claim, error: null }
}

export async function updateClaimStatus(
  claimId: string,
  status: string,
  userId: string,
  notes?: string,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('claims')
    .update({
      status,
      status_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', claimId)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error updating claim status:', error)
    return { claim: null, error }
  }

  await logAuditAction(userId, 'claim_status_updated', {
    claim_id: claimId,
    status,
    notes,
  })

  return { claim: data as Claim, error: null }
}

/**
 * Documents Database Operations
 */
export async function uploadDocument(
  userId: string,
  claimId: string,
  file: {
    filename: string
    content_type: string
    size: number
    file_path: string
  },
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .insert({
      claim_id: claimId,
      uploaded_by: userId,
      file_name: file.filename,
      file_type: file.content_type,
      file_size: file.size,
      file_path: file.file_path,
    })
    .select()
    .single()

  if (error) {
    console.error('[v0] Error uploading document:', error)
    return { document: null, error }
  }

  await logAuditAction(userId, 'document_uploaded', {
    claim_id: claimId,
    document_id: data.id,
    file_name: file.filename,
  })

  return { document: data as ClaimDocument, error: null }
}

export async function getClaimDocuments(claimId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: false })

  return { documents: data as ClaimDocument[] | null, error }
}

export async function deleteDocument(documentId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    console.error('[v0] Error deleting document:', error)
    return { error }
  }

  await logAuditAction(userId, 'document_deleted', {
    document_id: documentId,
  })

  return { error: null }
}

/**
 * Audit Logging
 */
export async function logAuditAction(
  userId: string,
  action: string,
  details?: Record<string, any>,
) {
  const supabase = await createClient()

  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    details: details || {},
  })

  if (error) {
    console.error('[v0] Error logging audit action:', error)
  }
}

export async function getAuditLogs(filters?: {
  userId?: string
  action?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()

  let query = supabase.from('audit_logs').select('*')

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }
  if (filters?.action) {
    query = query.eq('action', filters.action)
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  })

  return { logs: data as AuditLog[] | null, error }
}
