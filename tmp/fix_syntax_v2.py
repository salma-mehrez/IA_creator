import sys
import os

file_path = r'c:\mes projets\plateforme - Copie\frontend\src\app\dashboard\[workspaceId]\planning\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The issue is the transition from the main modal to the publish modal
# Old structure:
# {isModalOpen && (
#   ...
#  </div>
# </div>
#
# {isPublishModalOpen && (

# It should be:
# {isModalOpen && (
#   ...
#  </div>
# </div>
# )}
#
# {isPublishModalOpen && (

# Look for the last button in the main modal to be sure of the location
target_button = 'onClick={() => setIsModalOpen(false)}'
# Find the closing divs after it
insertion_point = content.find(target_button)
if insertion_point != -1:
    # Find the next two </div> and add )} after the second one
    d1 = content.find('</div>', insertion_point)
    d2 = content.find('</div>', d1 + 6)
    d3 = content.find('</div>', d2 + 6)
    
    # Actually, looking at the view_file:
    # 668:       </div>
    # 669:      </div>
    # 670:     </div>
    # 671:    
    # 672:    {/* Modal: Confirm Publication */}
    
    # If I find line 670's </div>, I add )} after it.
    
    pattern = '     </div>\n    </div>\n    \n    {/* Modal: Confirm Publication */}'
    replacement = '     </div>\n    </div>\n   )}\n\n   {/* Modal: Confirm Publication */}'
    
    if pattern in content:
        content = content.replace(pattern, replacement)
        print("Fixed syntax error.")
    else:
        # Try variation
        pattern2 = '     </div>\n    </div>\n    {/* Modal: Confirm Publication */}'
        if pattern2 in content:
            content = content.replace(pattern2, replacement)
            print("Fixed syntax error (var 2).")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
