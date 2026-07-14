# Gunakan base image resmi dari Microsoft yang sudah terinstall Python & Playwright (bebas dari error dependensi OS)
FROM mcr.microsoft.com/playwright/python:v1.45.0-jammy

# Buat folder aplikasi
WORKDIR /app

# Salin file requirements
COPY requirements.txt /app/

# Install dependency Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode worker ke dalam container
COPY . /app/

# Jalankan worker
CMD ["python", "worker_skeleton.py"]
