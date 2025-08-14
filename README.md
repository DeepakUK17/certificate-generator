🎉 Hackathon Certificate Generator 🏆

A free web app to generate certificates for hackathon participants! Customize the certificate template, upload your own data, and generate certificates easily. Perfect for hackathons, workshops, or competitions.

⚡ Features

Two Modes of Certificate Generation:

Excel + Template Upload 📄🎨

Upload a template image.

Upload an Excel sheet with team/participant data.

Automatically generate certificates for all participants.

Manual Entry + Preview ✍️👀

Upload a custom template.

Add team name, college, and member names manually.

Preview the certificate before generating.

Generate all files at once.

Customizable Templates 🎨

Any background image, font, or name placement.

Automatic File Management 💾

Certificates are saved in a chosen folder.

User-Friendly & Free 🌟

Anyone can use it. No restrictions!

🛠️ Technology Stack

Frontend: HTML, CSS, JavaScript

Backend: Python (Flask)

Libraries: Pillow (for certificate generation)

📂 Folder Structure
hackathon_certificate_generator/
│
├─ index.html          # Frontend form
├─ style.css           # Styling
├─ script.js           # Frontend JavaScript
├─ app.py              # Python Flask backend
├─ certificates/       # Generated certificates saved here
└─ sample_template.png # Placeholder template

🚀 How to Use

Install prerequisites

pip install flask pillow


Start the backend

python app.py


Open index.html in a browser.

Choose Mode:

Excel + Template: Upload your Excel file with participant data and the template.

Manual Entry: Enter team/college info, member names, and preview.

Generate Certificates 🎉

Certificates are saved in the certificates folder.

Member name fields reset automatically after generation.

🎨 Customization

Use your own template image with custom font and placement.

Adjust name position in the template easily using Pillow coordinates.

Supports any number of participants (manual or Excel mode).

🌟 Why Use This Web App?

Free & Open for Everyone 🌐

Supports custom templates, custom data, and custom placement of names.

Simple and fast workflow with preview option.

📝 License

This project is open-source and free to use for personal, educational, or hackathon purposes.
