#!/usr/bin/env python3
"""
Script to prepare and upload source code to GitHub repository
"""
import os
import shutil
import tempfile

def prepare_upload_files():
    """Prepare all files for GitHub upload"""
    
    # Create temporary directory for upload
    temp_dir = "/tmp/haraj_upload"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # Copy all necessary files
    files_to_copy = [
        "vercel.json",
        "requirements.txt", 
        "build.sh",
        ".env.example",
        "README.md"
    ]
    
    # Copy config files
    for file in files_to_copy:
        if os.path.exists(f"/app/{file}"):
            shutil.copy2(f"/app/{file}", f"{temp_dir}/{file}")
            
    # Copy frontend directory
    if os.path.exists("/app/frontend"):
        shutil.copytree("/app/frontend", f"{temp_dir}/frontend", ignore=shutil.ignore_patterns('node_modules', '.cache', 'build'))
        
    # Copy backend directory  
    if os.path.exists("/app/backend"):
        shutil.copytree("/app/backend", f"{temp_dir}/backend", ignore=shutil.ignore_patterns('__pycache__', 'uploads', '*.pyc'))
        
    print("Files prepared in:", temp_dir)
    
    # List all files for verification
    for root, dirs, files in os.walk(temp_dir):
        level = root.replace(temp_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        sub_indent = ' ' * 2 * (level + 1)
        for file in files[:10]:  # Limit output
            print(f"{sub_indent}{file}")
        if len(files) > 10:
            print(f"{sub_indent}... and {len(files)-10} more files")

if __name__ == "__main__":
    prepare_upload_files()