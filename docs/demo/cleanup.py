import sys
sys.path.insert(0, r'C:\Users\Administrator\.qoder\skills\docx')
from scripts.wordfile import WordFile

doc = WordFile(r'e:\Hackathon\LuminFlow\docs\demo\unpacked', rsid="B60681BC")

# Delete the stray intro paragraph from old 4.3 that was missed
try:
    stray = doc["word/document.xml"].locate_element(
        tag="w:p", contains="LuminFlow's AI pipelines are driven by a modular prompt engineering")
    doc["word/document.xml"].mark_for_deletion(stray)
    print("Deleted stray paragraph from old Section 4.3")
except Exception as e:
    print(f"Stray paragraph not found: {e}")

doc.persist(validate=False)
print("Cleanup saved")
