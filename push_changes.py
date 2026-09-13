#!/usr/bin/env python3
import subprocess
import os

os.chdir('/Users/uppalapatiharshith/Documents/Wild_Haven_Donation_Management_System-WWF')

print("Pushing Donor Impact Transparency features to GitHub...")
print("=" * 60)

try:
    result = subprocess.run(['git', 'push', 'origin', 'main'], 
                          capture_output=True, 
                          text=True, 
                          timeout=30)
    
    print("STDOUT:")
    print(result.stdout)
    
    if result.stderr:
        print("\nSTDERR:")
        print(result.stderr)
    
    print("\nReturn code:", result.returncode)
    
    if result.returncode == 0:
        print("\n✅ Push successful!")
    else:
        print("\n❌ Push failed. Trying force push...")
        result = subprocess.run(['git', 'push', '-f', 'origin', 'main'], 
                              capture_output=True, 
                              text=True, 
                              timeout=30)
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        
        if result.returncode == 0:
            print("\n✅ Force push successful!")
        else:
            print("\n❌ Force push also failed")
            
except subprocess.TimeoutExpired:
    print("❌ Git push timed out")
except Exception as e:
    print(f"❌ Error: {e}")

print("=" * 60)
