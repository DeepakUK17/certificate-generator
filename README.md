 # 🎉 Hackathon Certificate Generator 🏆

A **responsive web application** created using **HTML, CSS, JavaScript, and Python** to generate certificates for hackathon participants. This app allows users to use **custom templates**, add participant data **manually** or via **Excel**, preview certificates, and download them automatically. It’s **free for everyone**!

## ✨ Features

* 🖼 **Upload your custom certificate template**
* ✍️ **Manual entry mode:** Add team name, college, and member names individually
* 📄 **Excel upload mode:** Upload participant data in bulk for automatic certificate generation
* 👀 **Preview certificates** before generating
* 💾 **Automatically saves** generated certificates in a folder
* 🌐 Free and open for everyone
* 🎨 Customizable fonts, name positions, and template design
* 📱 Simple, responsive, and user-friendly interface

## 🛠 Technologies Used

* **HTML5** – Structure and form elements
* **CSS3** – Styling and layout
* **JavaScript** – Form handling, interactivity, and frontend logic
* **Python (Flask)** – Backend logic for generating certificates
* **Pillow** – Python library to edit and generate images

## 🚀 Installation / Usage

1. **Clone the repository**:

```bash
git clone https://github.com/your-username/hackathon-certificate-generator.git
cd hackathon-certificate-generator
```

2. **Install Python dependencies**:

```bash
pip install flask pillow
```

3. **Start the backend server**:

```bash
python app.py
```

4. **Open `index.html`** in your browser.

5. **Choose a mode**:

   * **Manual Entry:** Enter team/college info and member names, upload template, preview, then generate.
   * **Excel Upload:** Upload participant Excel sheet and template to generate all certificates automatically.

6. Generated certificates will be saved in the **certificates/** folder.

## 📂 File Structure

```
hackathon_certificate_generator/
│
├─ index.html          # Frontend form
├─ style.css           # Styling
├─ script.js           # Frontend JavaScript
├─ app.py              # Python Flask backend
├─ certificates/       # Generated certificates
└─ sample_template.png # Placeholder certificate template
```

## 📱 Responsive Design

The web app works seamlessly on:

* Desktop
* Tablets
* Mobile devices

## ⚡ Notes

* Replace `sample_template.png` with your own certificate template.
* Adjust font, name placement, and colors in `app.py` for customization.
* This app is free for **personal, educational, or hackathon use**.

---
