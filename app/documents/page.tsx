import { Sidebar } from "@/components/sidebar"
import { getCurrentUser } from "@/lib/auth"
import { DocumentUpload } from "@/components/document-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Calendar } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  size: string
  status: "pending" | "approved" | "rejected"
  claimId?: string
}

export default async function DocumentsPage() {
  const user = await getCurrentUser()

  const documents: Document[] = [
    {
      id: "1",
      name: "Medical Prescription - Dr. Smith",
      type: "PDF",
      uploadDate: "2025-11-05",
      size: "2.4 MB",
      status: "approved",
      claimId: "CLM-001",
    },
    {
      id: "2",
      name: "Lab Test Report",
      type: "PDF",
      uploadDate: "2025-11-04",
      size: "1.8 MB",
      status: "pending",
      claimId: "CLM-002",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    }
    return variants[status] || variants.pending
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userName={user?.name}
        userRole={user?.role}
        onSignOut={async () => {
          "use server"
          await import("@/lib/auth").then((m) => m.signOut())
        }}
      />
      <main className="flex-1 overflow-y-auto md:ml-64">
        <div className="p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Document Management</h1>
            <p className="text-muted-foreground">Upload and manage medical documents for your insurance claims</p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <DocumentUpload />
          </div>

          {/* Documents List */}
          <Card className="animate-slide-up delay-200">
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>View and manage all uploaded documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Upload Date</th>
                      <th className="text-left py-3 px-4 font-medium">Size</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr
                        key={doc.id}
                        className="border-b hover:bg-muted/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            {doc.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">{doc.type}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {doc.uploadDate}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{doc.size}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadge(doc.status)}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
