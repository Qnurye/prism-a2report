#!/bin/bash
# Wrapper: delegates to the real deploy script in the project
exec ~/Projects/prism-a2report/scripts/deploy-report.sh "$@"
