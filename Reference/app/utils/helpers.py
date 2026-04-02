import os
import uuid
from PIL import Image
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_image(file, subfolder='fsas'):
    if not file or not allowed_file(file.filename):
        return None

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"

    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, filename)

    # Save and resize
    img = Image.open(file)
    img.thumbnail((1200, 1200))
    img.save(filepath, quality=85)

    return f"uploads/{subfolder}/{filename}"


def delete_uploaded_image(filepath):
    if filepath and filepath != 'default_fsa.png' and filepath != 'default_avatar.png':
        full_path = os.path.join(current_app.static_folder, filepath)
        if os.path.exists(full_path):
            os.remove(full_path)
