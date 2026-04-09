import os
import re

base_path = r"c:\mes projets\plateforme - Copie\frontend\src"

count = 0
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            new_content = content
            
            # Spaces before quotes
            new_content = re.sub(r'\bfrom"', 'from "', new_content)
            new_content = re.sub(r'\bimport"', 'import "', new_content)
            new_content = re.sub(r'\breturn"', 'return "', new_content)
            new_content = re.sub(r'\bcase"', 'case "', new_content)
            
            # Spaces after quotes for JSX properties and React
            new_content = re.sub(r'"(?=[a-zA-Z\-\_]+=)', '" ', new_content)
            new_content = re.sub(r'"(?=\{)', '" ', new_content)
            new_content = re.sub(r'"(?=/>)', '" ', new_content)
            new_content = re.sub(r'className="([^"]+)"className=', 'className="$1" className=', new_content)
            new_content = re.sub(r'"className=', '" className=', new_content)

            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {file}")
                count += 1

print(f"Total files fixed: {count}")
