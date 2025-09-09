from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
import pandas as pd
import os
import json
from PIL import Image, ImageDraw, ImageFont
import zipfile
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('generated_certificates', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/file-upload')
def file_upload():
    return render_template('file_upload.html')

@app.route('/manual-entry')
def manual_entry():
    return render_template('manual_entry.html')

@app.route('/upload-data', methods=['POST'])
def upload_data():
    try:
        if 'dataFile' not in request.files:
            return jsonify({'error': 'No data file uploaded'}), 400
        
        file = request.files['dataFile']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read the data file
        if filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(filepath)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
        
        # Convert to JSON for frontend
        data = df.to_dict('records')
        return jsonify({'data': data, 'columns': list(df.columns)})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload-template', methods=['POST'])
def upload_template():
    try:
        if 'template' not in request.files:
            return jsonify({'error': 'No template uploaded'}), 400
        
        file = request.files['template']
        if file.filename == '':
            return jsonify({'error': 'No template selected'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"template_{filename}")
        file.save(filepath)
        
        return jsonify({'templatePath': filepath, 'filename': filename})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-certificates', methods=['POST'])
def generate_certificates():
    try:
        data = request.json
        template_path = data.get('templatePath')
        output_path = data.get('outputPath', 'generated_certificates')
        members_data = data.get('membersData', [])
        coordinates = data.get('coordinates', {})
        
        if not template_path or not os.path.exists(template_path):
            return jsonify({'error': 'Template not found'}), 400
        
        # Group members by team
        teams = {}
        for member in members_data:
            team_id = member.get('team_id', 'DEFAULT')
            if team_id not in teams:
                teams[team_id] = []
            teams[team_id].append(member)
        
        generated_folders = []
        
        for team_id, team_members in teams.items():
            # Create team folder
            team_folder = os.path.join(output_path, str(team_id))
            os.makedirs(team_folder, exist_ok=True)
            
            for i, member in enumerate(team_members):
                # Generate certificate for each member
                cert_path = generate_single_certificate(
                    template_path, 
                    member, 
                    coordinates, 
                    os.path.join(team_folder, f"{member.get('name', f'member_{i}')}_certificate.png")
                )
            
            generated_folders.append(team_folder)
        
        return jsonify({
            'success': True, 
            'message': f'Generated certificates for {len(teams)} teams',
            'folders': generated_folders
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_single_certificate(template_path, member_data, coordinates, output_path):
    try:
        # Open template image
        img = Image.open(template_path)
        draw = ImageDraw.Draw(img)
        
        # Try to load a font (fallback to default if not available)
        try:
            font = ImageFont.truetype("arial.ttf", 40)
        except:
            font = ImageFont.load_default()
        
        # Add text based on coordinates
        for field, coord in coordinates.items():
            if field in member_data and member_data[field]:
                x = int(coord.get('x', 100))
                y = int(coord.get('y', 100))
                text = str(member_data[field])
                draw.text((x, y), text, fill='black', font=font)
        
        # Save the certificate
        img.save(output_path)
        return output_path
    
    except Exception as e:
        print(f"Error generating certificate: {e}")
        return None

@app.route('/preview-certificate', methods=['POST'])
def preview_certificate():
    try:
        data = request.json
        template_path = data.get('templatePath')
        sample_data = data.get('sampleData', {})
        coordinates = data.get('coordinates', {})
        
        if not template_path or not os.path.exists(template_path):
            return jsonify({'error': 'Template not found'}), 400
        
        # Generate preview
        preview_path = os.path.join(app.config['UPLOAD_FOLDER'], f"preview_{uuid.uuid4().hex}.png")
        generate_single_certificate(template_path, sample_data, coordinates, preview_path)
        
        return jsonify({'previewPath': preview_path})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-preview/<path:filename>')
def get_preview(filename):
    return send_file(filename)

if __name__ == '__main__':
    app.run(debug=True)
