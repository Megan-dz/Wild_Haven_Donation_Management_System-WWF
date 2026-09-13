#!/bin/zsh

cd /Users/uppalapatiharshith/Documents/Wild_Haven_Donation_Management_System-WWF

# Abort any ongoing rebase
git rebase --abort 2>/dev/null || true

# Check current status
echo "=== Current Status ==="
git status

# Show recent commits
echo ""
echo "=== Recent Commits ==="
git log --oneline -3

# Attempt push
echo ""
echo "=== Pushing to GitHub ==="
git push -u origin main 2>&1

echo ""
echo "=== Push Complete ==="
