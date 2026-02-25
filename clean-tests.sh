#!/bin/bash

# Clean up test artifacts and results
echo "🧹 Cleaning up test artifacts..."

# Remove test results
if [ -d "test-results" ]; then
    echo "Removing test-results directory..."
    rm -rf test-results
fi

# Remove coverage reports
if [ -d "coverage" ]; then
    echo "Removing coverage directory..."
    rm -rf coverage
fi

# Remove playwright reports
if [ -d "playwright-report" ]; then
    echo "Removing playwright-report directory..."
    rm -rf playwright-report
fi

# Remove playwright cache
if [ -d "playwright/.cache" ]; then
    echo "Removing playwright cache..."
    rm -rf playwright/.cache
fi

echo "✅ Test cleanup complete!"
