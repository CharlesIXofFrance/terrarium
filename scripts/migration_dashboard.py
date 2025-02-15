#!/usr/bin/env python3
import os
import re
import yaml
import graphviz
from datetime import datetime
from collections import defaultdict

def extract_yaml_metadata(filepath):
    """Extract YAML metadata from a migration file."""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            yaml_match = re.search(r'/\*\n---\n(.+?)\n---\n\*/', content, re.DOTALL)
            if yaml_match:
                return yaml.safe_load(yaml_match.group(1))
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return None

def analyze_sql_content(filepath):
    """Analyze SQL content to find affected tables and functions."""
    affected_objects = {
        'tables': set(),
        'functions': set(),
        'types': set(),
        'policies': set()
    }
    
    with open(filepath, 'r') as f:
        content = f.read().lower()
        
        # Find table operations
        tables = re.findall(r'(create|alter|drop)\s+table\s+([\w\.]+)', content)
        affected_objects['tables'].update(t[1] for t in tables)
        
        # Find function operations
        functions = re.findall(r'(create|replace|drop)\s+function\s+([\w\.]+)', content)
        affected_objects['functions'].update(f[1] for f in functions)
        
        # Find type operations
        types = re.findall(r'(create|alter|drop)\s+type\s+([\w\.]+)', content)
        affected_objects['types'].update(t[1] for t in types)
        
        # Find policy operations
        policies = re.findall(r'(create|alter|drop)\s+policy\s+([\w\.]+)', content)
        affected_objects['policies'].update(p[1] for p in policies)
    
    return affected_objects

def generate_dependency_graph(migrations):
    """Generate a GraphViz dependency graph."""
    dot = graphviz.Digraph(comment='Migration Dependencies')
    dot.attr(rankdir='LR')
    
    # Add nodes
    for migration_id, metadata in migrations.items():
        label = f"{migration_id}\n{metadata.get('title', 'Unknown')}\n"
        dot.node(migration_id, label)
    
    # Add edges
    for migration_id, metadata in migrations.items():
        for dep in metadata.get('dependencies', []):
            dep_id = os.path.splitext(dep)[0]
            dot.edge(dep_id, migration_id)
    
    return dot

def generate_dashboard(migrations_dir):
    """Generate a comprehensive migration dashboard."""
    migrations = {}
    affected_tables = defaultdict(set)
    affected_functions = defaultdict(set)
    
    # Collect migration metadata
    for filename in sorted(os.listdir(migrations_dir)):
        if filename.endswith('.sql') and not filename.startswith('.'):
            filepath = os.path.join(migrations_dir, filename)
            migration_id = os.path.splitext(filename)[0]
            
            metadata = extract_yaml_metadata(filepath)
            if metadata:
                migrations[migration_id] = metadata
                
                # Analyze SQL content
                objects = analyze_sql_content(filepath)
                affected_tables[migration_id].update(objects['tables'])
                affected_functions[migration_id].update(objects['functions'])
    
    # Generate dashboard markdown
    dashboard_path = os.path.join(migrations_dir, 'MIGRATIONS_DASHBOARD.md')
    with open(dashboard_path, 'w') as f:
        f.write('# Database Migration Dashboard\n\n')
        
        # Summary section
        f.write('## Summary\n\n')
        f.write(f'Total Migrations: {len(migrations)}\n')
        f.write(f'Total Affected Tables: {len(set.union(*affected_tables.values() or [set()]))}\n')
        f.write(f'Total Affected Functions: {len(set.union(*affected_functions.values() or [set()]))}\n\n')
        
        # Migration list
        f.write('## Migrations\n\n')
        for migration_id, metadata in sorted(migrations.items()):
            f.write(f"### {migration_id}\n\n")
            f.write(f"**Title:** {metadata.get('title', 'Unknown')}\n\n")
            f.write(f"**Description:**\n{metadata.get('description', 'No description')}\n\n")
            
            if metadata.get('affected_tables'):
                f.write("**Affected Tables:**\n")
                for table in metadata['affected_tables']:
                    f.write(f"- {table}\n")
                f.write('\n')
            
            if metadata.get('dependencies'):
                f.write("**Dependencies:**\n")
                for dep in metadata['dependencies']:
                    f.write(f"- {dep}\n")
                f.write('\n')
            
            if affected_tables[migration_id]:
                f.write("**Detected Table Changes:**\n")
                for table in affected_tables[migration_id]:
                    f.write(f"- {table}\n")
                f.write('\n')
            
            if affected_functions[migration_id]:
                f.write("**Detected Function Changes:**\n")
                for func in affected_functions[migration_id]:
                    f.write(f"- {func}\n")
                f.write('\n')
            
            if metadata.get('rollback'):
                f.write("**Rollback:**\n```sql\n")
                f.write(metadata['rollback'])
                f.write('\n```\n\n')
    
    # Generate dependency graph
    try:
        dot = generate_dependency_graph(migrations)
        dot.render(os.path.join(migrations_dir, 'migration_dependencies'), 
                  format='png', cleanup=True)
    except Exception as e:
        print(f"Warning: Could not generate dependency graph: {e}")
    
    print(f"Dashboard generated at: {dashboard_path}")

def main():
    migrations_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                'supabase', 'migrations')
    generate_dashboard(migrations_dir)

if __name__ == '__main__':
    main()
