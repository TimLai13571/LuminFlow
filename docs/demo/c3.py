from docx import Document
doc = Document(r"e:\Hackathon\LuminFlow\docs\demo\LuminFlow_Hackathon_Submission.docx")
for p in doc.paragraphs[95:101]:
    print(p.text)
    print("---")
