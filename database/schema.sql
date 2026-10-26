-- ============================================================
-- FinTrack AI – Production MySQL Schema
-- Database: fintrack_db
-- ============================================================
-- Run with: mysql -u root -p < schema.sql
-- Or use PlanetScale / Railway MySQL import.
-- ============================================================

CREATE DATABASE IF NOT EXISTS fintrack_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fintrack_db;

-- ── Users ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    phone         VARCHAR(30)   NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    profile_image VARCHAR(255)  DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX ix_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Categories ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    name       VARCHAR(80)  NOT NULL,
    icon       VARCHAR(20)  DEFAULT NULL,
    color      VARCHAR(20)  DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_categories_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Expenses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           NOT NULL,
    category_id    INT           DEFAULT NULL,
    title          VARCHAR(120)  NOT NULL,
    description    TEXT          DEFAULT NULL,
    amount         DECIMAL(12,2) NOT NULL,
    category_name  VARCHAR(80)   DEFAULT NULL,
    payment_method VARCHAR(50)   DEFAULT 'Cash',
    expense_date   DATE          NOT NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_expenses_user_date     (user_id, expense_date),
    INDEX ix_expenses_user_category (user_id, category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Incomes ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incomes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    title       VARCHAR(120)  NOT NULL,
    description TEXT          DEFAULT NULL,
    amount      DECIMAL(12,2) NOT NULL,
    source      VARCHAR(80)   NOT NULL,
    income_date DATE          NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_incomes_user_date   (user_id, income_date),
    INDEX ix_incomes_user_source (user_id, source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Budgets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT           NOT NULL,
    monthly_budget  DECIMAL(12,2) NOT NULL,
    spent_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    budget_status   VARCHAR(20)   NOT NULL DEFAULT 'Safe',
    month           INT           NOT NULL,
    year            INT           NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_budget_user_month_year (user_id, month, year),
    INDEX ix_budgets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    title      VARCHAR(120) NOT NULL,
    message    VARCHAR(255) NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'unread',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ix_notifications_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
