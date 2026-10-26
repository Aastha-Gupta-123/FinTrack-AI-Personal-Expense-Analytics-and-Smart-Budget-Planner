-- ============================================================
-- FinTrack AI – Demo Seed Data
-- Provides a realistic demo user with 6 months of data
-- Password: Demo@12345 (bcrypt hashed)
-- ============================================================

USE fintrack_db;

-- ── Demo user (password: Demo@12345) ─────────────────────────────────────────
INSERT IGNORE INTO users (id, full_name, email, phone, password) VALUES
(1, 'Aastha Gupta', 'demo@fintrack.ai', '+91-9876543210',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMUBufRhVqzOKMf7xBa6.8pP3q');

-- ── Categories ────────────────────────────────────────────────────────────────
INSERT IGNORE INTO categories (user_id, name, icon, color) VALUES
(1, 'Food',           '🍔', '#f59e0b'),
(1, 'Transportation', '🚌', '#6366f1'),
(1, 'Shopping',       '🛍️', '#ec4899'),
(1, 'Entertainment',  '🎬', '#8b5cf6'),
(1, 'Healthcare',     '🏥', '#10b981'),
(1, 'Education',      '📚', '#0ea5e9'),
(1, 'Bills',          '⚡', '#f97316'),
(1, 'Investment',     '📈', '#14b8a6');

-- ── Income (6 months) ─────────────────────────────────────────────────────────
INSERT IGNORE INTO incomes (user_id, title, amount, source, income_date) VALUES
(1, 'Monthly Salary',  55000.00, 'Salary',      '2026-01-01'),
(1, 'Freelance Work',   8500.00, 'Freelancing', '2026-01-15'),
(1, 'Monthly Salary',  55000.00, 'Salary',      '2026-02-01'),
(1, 'Monthly Salary',  55000.00, 'Salary',      '2026-03-01'),
(1, 'Bonus',           12000.00, 'Bonus',       '2026-03-15'),
(1, 'Monthly Salary',  55000.00, 'Salary',      '2026-04-01'),
(1, 'Freelance Work',   6000.00, 'Freelancing', '2026-04-20'),
(1, 'Monthly Salary',  55000.00, 'Salary',      '2026-05-01'),
(1, 'Monthly Salary',  55000.00, 'Salary',      '2026-06-01'),
(1, 'Investment Return', 3500.00,'Investments', '2026-06-10');

-- ── Expenses (6 months) ───────────────────────────────────────────────────────
INSERT IGNORE INTO expenses (user_id, title, amount, category_name, payment_method, expense_date) VALUES
-- January
(1, 'Groceries',          3200.00, 'Food',           'Card',          '2026-01-05'),
(1, 'Metro Monthly Pass',  900.00, 'Transportation', 'UPI',           '2026-01-06'),
(1, 'Netflix',             650.00, 'Entertainment',  'Card',          '2026-01-10'),
(1, 'Electricity Bill',   2100.00, 'Bills',          'Bank Transfer', '2026-01-15'),
(1, 'Online Shopping',    4200.00, 'Shopping',       'Card',          '2026-01-18'),
(1, 'Doctor Visit',       1500.00, 'Healthcare',     'Cash',          '2026-01-22'),
-- February
(1, 'Groceries',          3500.00, 'Food',           'Card',          '2026-02-04'),
(1, 'Petrol',             1200.00, 'Transportation', 'UPI',           '2026-02-08'),
(1, 'Online Course',      3999.00, 'Education',      'Card',          '2026-02-12'),
(1, 'Electricity Bill',   1950.00, 'Bills',          'Bank Transfer', '2026-02-15'),
(1, 'Dining Out',         2800.00, 'Food',           'Card',          '2026-02-20'),
-- March
(1, 'Groceries',          3100.00, 'Food',           'Card',          '2026-03-03'),
(1, 'Metro Monthly Pass',  900.00, 'Transportation', 'UPI',           '2026-03-06'),
(1, 'Clothes Shopping',   6500.00, 'Shopping',       'Card',          '2026-03-10'),
(1, 'Electricity Bill',   2250.00, 'Bills',          'Bank Transfer', '2026-03-15'),
(1, 'Movies & Outing',    1800.00, 'Entertainment',  'Cash',          '2026-03-22'),
(1, 'Medicines',           850.00, 'Healthcare',     'Cash',          '2026-03-28'),
-- April
(1, 'Groceries',          3300.00, 'Food',           'Card',          '2026-04-05'),
(1, 'Petrol',             1350.00, 'Transportation', 'UPI',           '2026-04-09'),
(1, 'Mobile Recharge',    1199.00, 'Bills',          'UPI',           '2026-04-14'),
(1, 'Electricity Bill',   2000.00, 'Bills',          'Bank Transfer', '2026-04-15'),
(1, 'Book Purchase',       750.00, 'Education',      'Card',          '2026-04-20'),
(1, 'Restaurant',         1900.00, 'Food',           'Card',          '2026-04-25'),
-- May
(1, 'Groceries',          3600.00, 'Food',           'Card',          '2026-05-02'),
(1, 'Metro Monthly Pass',  900.00, 'Transportation', 'UPI',           '2026-05-06'),
(1, 'Amazon Shopping',    5500.00, 'Shopping',       'Card',          '2026-05-12'),
(1, 'Electricity Bill',   2400.00, 'Bills',          'Bank Transfer', '2026-05-15'),
(1, 'Gym Membership',     2000.00, 'Healthcare',     'Bank Transfer', '2026-05-18'),
(1, 'Spotify',             389.00, 'Entertainment',  'Card',          '2026-05-20'),
-- June
(1, 'Groceries',          3400.00, 'Food',           'Card',          '2026-06-03'),
(1, 'Petrol',             1400.00, 'Transportation', 'UPI',           '2026-06-07'),
(1, 'Electricity Bill',   2100.00, 'Bills',          'Bank Transfer', '2026-06-15'),
(1, 'Shopping',           3800.00, 'Shopping',       'Card',          '2026-06-18'),
(1, 'Dining Out',         2100.00, 'Food',           'Card',          '2026-06-24');

-- ── Budgets ───────────────────────────────────────────────────────────────────
INSERT IGNORE INTO budgets (user_id, monthly_budget, spent_amount, budget_status, month, year) VALUES
(1, 30000.00, 14350.00, 'Safe',      1, 2026),
(1, 30000.00, 13449.00, 'Safe',      2, 2026),
(1, 30000.00, 15400.00, 'Safe',      3, 2026),
(1, 28000.00, 10499.00, 'Safe',      4, 2026),
(1, 28000.00, 14789.00, 'Safe',      5, 2026),
(1, 28000.00, 12800.00, 'Safe',      6, 2026);

-- ── Welcome notification ──────────────────────────────────────────────────────
INSERT IGNORE INTO notifications (user_id, title, message, status) VALUES
(1, 'Welcome to FinTrack AI!',
 'Your account is set up. Start tracking your expenses and income today.',
 'unread');
