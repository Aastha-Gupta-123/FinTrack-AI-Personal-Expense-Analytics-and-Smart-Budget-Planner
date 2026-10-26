import sqlite3
conn = sqlite3.connect('backend/instance/fintrack.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables:', tables)
for table in tables:
    cursor.execute(f'PRAGMA table_info({table[0]})')
    cols = cursor.fetchall()
    print(f'\n{table[0]} columns:')
    for col in cols:
        print(f'  {col}')
conn.close()
