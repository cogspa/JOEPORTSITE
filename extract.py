import os
import re

content = open('/Users/joem/JOEPORTSITE/update/cogspa-project.md', 'r').read()

# Pattern matches:
# ### `filepath`
# ```(lang)
# (code)
# ```
pattern = re.compile(r'### `([^`]+)`\n+```[a-z]*\n(.*?)```', re.DOTALL)
matches = pattern.findall(content)

base_dir = '/Users/joem/JOEPORTSITE/v2'

for path, body in matches:
    # If the path starts with frontend/, strip it so it goes into v2 directly
    if path.startswith('frontend/'):
        rel_path = path[len('frontend/'):]
    else:
        rel_path = path

    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(body.strip() + '\n')
    print(f"Extracted {rel_path}")
