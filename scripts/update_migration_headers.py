#!/usr/bin/env python3
import os
import re
import yaml
from datetime import datetime

def extract_old_metadata(content):
    """Extract metadata from old-style comments."""
    desc_match = re.search(r'--\s*Description:\s*(.+)', content)
    version_match = re.search(r'--\s*Version:\s*(.+)', content)
    author_match = re.search(r'--\s*Author:\s*(.+)', content)
    
    return {
        'description': desc_match.group(1).strip() if desc_match else None,
        'version': version_match.group(1).strip() if version_match else None,
        'author': author_match.group(1).strip() if author_match else None
    }

def generate_yaml_header(filename, metadata):
    """Generate YAML header from metadata."""
    migration_id = os.path.splitext(filename)[0]
    
    header = {
        'id': migration_id,
        'title': metadata['description'],
        'description': f"{metadata['description']}\nMigrated from legacy format.",
        'affected_tables': [],  # To be filled manually
        'dependencies': [],     # To be filled manually
        'rollback': '-- To be added\nDROP FUNCTION IF EXISTS function_name CASCADE;'
    }
    
    return f"""/*
---
{yaml.dump(header, default_flow_style=False)}
---
*/"""

def update_migration_file(filepath):
    """Update a migration file with the new YAML header format."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already has YAML header
    if '/*\n---' in content:
        print(f"Skipping {filepath} - already has YAML header")
        return
    
    metadata = extract_old_metadata(content)
    if not metadata['description']:
        print(f"Skipping {filepath} - no metadata found")
        return
    
    filename = os.path.basename(filepath)
    new_header = generate_yaml_header(filename, metadata)
    
    # Remove old metadata comments
    content = re.sub(r'--\s*(Description|Version|Author):.*\n', '', content)
    
    # Add new header
    new_content = new_header + '\n\n' + content.lstrip()
    
    # Write updated content
    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

def main():
    migrations_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                'supabase', 'migrations')
    
    for filename in os.listdir(migrations_dir):
        if filename.endswith('.sql') and not filename.startswith('.'):
            filepath = os.path.join(migrations_dir, filename)
            update_migration_file(filepath)

if __name__ == '__main__':
    main()
