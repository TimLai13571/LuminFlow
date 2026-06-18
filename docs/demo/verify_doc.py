from docx import Document
doc = Document(r'e:\Hackathon\LuminFlow\docs\demo\LuminFlow_Hackathon_Submission.docx')
with open(r'e:\Hackathon\LuminFlow\docs\demo\verify.txt', 'w', encoding='utf-8') as f:
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if text:
            f.write(f'[{para.style.name}] {text[:300]}\n\n')
    # Check for images
    f.write(f'\n--- IMAGES IN DOCUMENT ---\n')
    for rel in doc.part.rels.values():
        if "image" in rel.reltype:
            f.write(f'Image: {rel.target_ref}\n')
print("Verification done")
