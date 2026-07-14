import gradio as gr
import threading
import os

# Install browser
os.system("playwright install chromium")

# Run worker in background
import worker_skeleton

def start_worker():
    try:
        worker_skeleton.main()
    except Exception as e:
        print(f"Worker crashed: {e}")

thread = threading.Thread(target=start_worker, daemon=True)
thread.start()

with gr.Blocks() as demo:
    gr.Markdown("# 🚀 Automation Worker is Running in Background!")
    gr.Markdown("Worker script sedang berjalan dan me-listen job dari Supabase.")
    gr.Markdown("Tidak perlu melakukan apa-apa di halaman ini.")

demo.launch()
