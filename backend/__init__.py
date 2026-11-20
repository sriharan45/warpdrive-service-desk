import os
import sys

# Ensure backend package and repository root are always in sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.dirname(_current_dir)

for _p in [_repo_root, _current_dir]:
    if _p not in sys.path:
        sys.path.insert(0, _p)
