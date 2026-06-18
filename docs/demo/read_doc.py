from docx import Document
doc = Document(r'e:\Hackathon\LuminFlow\docs\demo\LuminFlow_Hackathon_Submission.docx')
with open(r'e:\Hackathon\LuminFlow\docs\demo\full_text.txt', 'w', encoding='utf-8') as f:
    for i, para in enumerate(doc.paragraphs):
        text = para.text.strip()
        if text:
            f.write(f'=== PARA {i} [STYLE:{para.style.name}] ===\n')
            f.write(text + '\n\n')
print("Done")
