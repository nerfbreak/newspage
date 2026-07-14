FROM mcr.microsoft.com/playwright/python:v1.45.0-jammy

# Hugging Face Spaces requires running as a non-root user with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy requirements first to leverage Docker cache
COPY --chown=user requirements.txt $HOME/app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the worker code
COPY --chown=user . $HOME/app/

# Expose port 7860 for Hugging Face Healthcheck
EXPOSE 7860

# Run the worker
CMD ["python", "worker_skeleton.py"]
