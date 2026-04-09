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

            # Remove italic and replace font-serif with font-heading
            new_content = re.sub(r'\bitalic\b', '', content)
            new_content = re.sub(r'\bfont-serif\b', 'font-heading', new_content)
            
            # Clean up extra spaces
            new_content = new_content.replace('  ', ' ')
            new_content = new_content.replace(' "', '"').replace('" ', '"')
            new_content = new_content.replace(' `', '`').replace('` ', '`')

            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {file}")
                count += 1

print(f"Total files updated: {count}")
