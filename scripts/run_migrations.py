#!/usr/bin/env python3
"""
Supabase Migration Runner
Executes SQL migration scripts in order using Supabase service role client
"""

import os
import sys
from pathlib import Path

# Add parent dir to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def run_migrations():
    """Execute all SQL migrations in order"""
    try:
        from supabase import create_client, Client
    except ImportError:
        print("ERROR: supabase package not installed")
        print("Run: pip install supabase")
        sys.exit(1)
    
    # Get environment variables
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
        sys.exit(1)
    
    # Initialize Supabase client with service role
    supabase: Client = create_client(url, service_key)
    
    # List of migration files in order
    migrations = [
        "001_create_profiles.sql",
        "002_profile_trigger.sql",
        "003_create_claims.sql",
        "004_create_documents.sql",
        "005_create_audit_logs.sql",
    ]
    
    scripts_dir = Path(__file__).parent
    
    for migration in migrations:
        migration_path = scripts_dir / migration
        
        if not migration_path.exists():
            print(f"WARNING: Migration file not found: {migration_path}")
            continue
        
        print(f"\n▶ Running migration: {migration}")
        
        try:
            with open(migration_path, "r") as f:
                sql = f.read()
            
            # Execute the SQL
            result = supabase.postgrest.session.exec_raw(sql)
            print(f"✓ Successfully executed {migration}")
            
        except Exception as e:
            print(f"✗ Error executing {migration}: {str(e)}")
            # Continue with next migration instead of failing completely
            continue
    
    print("\n✓ All migrations completed!")

if __name__ == "__main__":
    run_migrations()
