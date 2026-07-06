# ------------------------------------------------------------
# run_all.ps1 – launch FastAPI server + open Gmail with extension
# ------------------------------------------------------------

# 1️⃣ Change to the project folder
$projectDir = "C:\Users\virla\Desktop\CAPSTONE-Project\project"
Set-Location -Path $projectDir

# 2️⃣ (Optional) create a virtual environment if not present
if (-Not (Test-Path ".venv")) {
    python -m venv .venv
}

# 3️⃣ Activate the virtual environment
& "$projectDir\.venv\Scripts\Activate.ps1"

# 4️⃣ Install required Python packages
pip install -r requirements.txt

# 5️⃣ Start FastAPI server in a new dedicated window
Start-Process -FilePath "python" -ArgumentList "-m uvicorn app:app --host 127.0.0.1 --port 8000"

# Give the server a moment to start
Start-Sleep -Seconds 5

# 6️⃣ Launch Chrome with the extension loaded and open Gmail
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$extensionRoot = "C:\Users\virla\Desktop\CAPSTONE-Project"

# Use a temporary user data dir so Chrome forces a completely new, isolated instance!
# This ensures the extension loads even if you already have regular Chrome windows open.
$profileDir = "C:\Users\virla\Desktop\CAPSTONE-Project\chrome-dev-profile"

# Pass arguments as a single string to ensure Chrome parses them correctly
$chromeArgs = "--user-data-dir=`"$profileDir`" --disable-extensions-except=`"$extensionRoot`" --load-extension=`"$extensionRoot`" https://mail.google.com"

Start-Process -FilePath $chromePath -ArgumentList $chromeArgs
