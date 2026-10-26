# Gunicorn production configuration for FinTrack AI Backend
# Used by Render, Railway, and PythonAnywhere

# ── Worker configuration ──────────────────────────────────────────────────────
workers = 2               # 2 workers = good for free-tier (1-2 vCPUs)
worker_class = 'sync'     # sync worker; use 'gevent' for higher concurrency
threads = 2               # threads per worker
timeout = 120             # 2 min timeout for ML predictions

# ── Binding ───────────────────────────────────────────────────────────────────
bind = '0.0.0.0:5000'

# ── Logging ───────────────────────────────────────────────────────────────────
accesslog = '-'           # stdout
errorlog = '-'            # stderr
loglevel = 'info'

# ── Process naming ────────────────────────────────────────────────────────────
proc_name = 'fintrack-ai'
