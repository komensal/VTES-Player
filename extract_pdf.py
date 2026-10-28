import pdfplumber

pdf_path = r"c:\Users\piotr\VTES-Player\Vampire The Eternal Struggle Fifth Edition rulebook ENG.pdf"
output_path = r"c:\Users\piotr\VTES-Player\rulebook_text.txt"

pdf = pdfplumber.open(pdf_path)
print(f"Liczba stron: {len(pdf.pages)}")

text = ""
for i, page in enumerate(pdf.pages):
    t = page.extract_text()
    if t:
        text += f"--- Strona {i+1} ---\n{t}\n\n"
    if (i + 1) % 50 == 0:
        print(f"Przetworzono {i+1} stron...")

pdf.close()

with open(output_path, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Zapisano do {output_path}")
print(f"Długość tekstu: {len(text)} znaków")