# Google Cloud Storage Setup

This application integrates with Google Cloud Storage (GCP) for document uploads. Follow these steps to configure it.

## Prerequisites

- Google Cloud Project created
- Billing enabled on the project
- Cloud Storage API enabled

## Setup Steps

### 1. Create a GCP Project
```bash
# Visit https://console.cloud.google.com/
# Create a new project or use an existing one
```

### 2. Enable Cloud Storage API
```bash
# In GCP Console:
# 1. Go to APIs & Services > Library
# 2. Search for "Cloud Storage"
# 3. Click on "Google Cloud Storage API"
# 4. Click "Enable"
```

### 3. Create a Service Account
```bash
# In GCP Console:
# 1. Go to APIs & Services > Service Accounts
# 2. Click "Create Service Account"
# 3. Fill in the details:
#    - Service account name: claims-storage-account
#    - Service account ID: claims-storage-account
# 4. Click "Create and Continue"
# 5. Grant the following roles:
#    - Storage Admin (roles/storage.admin)
# 6. Click "Continue" and "Done"
```

### 4. Create and Download Service Account Key
```bash
# In the Service Accounts page:
# 1. Click on the service account you just created
# 2. Go to the "Keys" tab
# 3. Click "Add Key" > "Create new key"
# 4. Select "JSON" format
# 5. Click "Create" - this downloads a JSON file with your credentials
# 6. Save this file securely (you'll need it for environment setup)
```

### 5. Create a Cloud Storage Bucket
```bash
# In GCP Console:
# 1. Go to Cloud Storage > Buckets
# 2. Click "Create"
# 3. Enter bucket name: claims-documents (or your preferred name)
# 4. Choose location: Select appropriate region for your data
# 5. Choose storage class: Standard
# 6. Leave other options as default
# 7. Click "Create"
```

### 6. Set Up Environment Variables

You have two options to configure GCP credentials:

#### Option A: Using JSON Key File (Recommended)
```bash
# Set the path to your downloaded JSON key file:
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

#### Option B: Using Environment Variables
```bash
# Extract the credentials from the JSON file and set:
export GOOGLE_CLOUD_PROJECT=your-project-id
export GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account",...}'
export GCP_BUCKET_NAME=claims-documents
```

### 7. In Your Application

Add to your `.env.local` or Vercel environment:
```
GCP_BUCKET_NAME=claims-documents
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

Or if using the JSON credentials as an env var:
```
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"...","...'
GCP_BUCKET_NAME=claims-documents
```

## Vercel Deployment

For Vercel deployment:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following:
   - `GCP_BUCKET_NAME`: Your bucket name
   - `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
   - `GOOGLE_CLOUD_CREDENTIALS`: The entire JSON content from your service account key (as a single line)

## Usage

Once configured, documents uploaded through the application will automatically be stored in GCP Cloud Storage with:
- Automatic timestamping to prevent filename collisions
- Signed URLs with 7-day expiration for secure access
- Metadata preservation (MIME type, upload time, etc.)
- Automatic cleanup capability

## Testing

To verify GCP integration is working:

1. Log into the application
2. Navigate to the Documents section
3. Upload a test document
4. Check the upload completes successfully
5. In GCP Console, verify the file appears in your bucket under `documents/` folder

## Troubleshooting

### "GOOGLE_APPLICATION_CREDENTIALS not found"
- Ensure the path to your JSON key file is correct and the file exists
- Or use the `GOOGLE_CLOUD_CREDENTIALS` environment variable instead

### "Bucket not found"
- Verify the `GCP_BUCKET_NAME` environment variable matches your actual bucket name
- Ensure the bucket exists in your GCP project
- Check that the service account has Storage Admin permissions

### Upload fails but no error shown
- Check the server logs for detailed error messages
- Verify the service account has the correct permissions
- Ensure the bucket name is correct in environment variables

## Security Considerations

1. **Never commit the JSON key file** to version control
2. **Use environment variables** for sensitive credentials
3. **Rotate credentials regularly** for production deployments
4. **Use IAM roles** with minimal required permissions
5. **Enable bucket versioning** and retention policies for important documents
6. **Set up bucket logging** to monitor access

## Disabling GCP (Optional)

If GCP credentials are not configured, the application will:
- Still accept file uploads
- Process them without cloud storage
- Log files to the local system (for development only)
- Show appropriate warnings in logs

To fully disable GCP:
- Don't set `GCP_BUCKET_NAME` or `GOOGLE_CLOUD_PROJECT` environment variables
- The fallback in-memory storage will be used
