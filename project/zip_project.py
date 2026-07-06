import os, zipfile, pathlib

project_dir = pathlib.Path(__file__).parent / "project"
zip_path = pathlib.Path(__file__).parent / "project_archive.zip"

with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(project_dir):
        for file in files:
            file_path = pathlib.Path(root) / file
            zipf.write(file_path, file_path.relative_to(project_dir.parent))
print(f"Created archive at {zip_path}")
