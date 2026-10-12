<?php
/**
 * ============================================================
 * Penyimpanan Sesi di Database (Cross-Platform & Serverless Ready)
 * ============================================================
 * Mendukung PostgreSQL (Neon / Supabase / Heroku) dan MySQL (XAMPP / cPanel).
 * Memiliki fitur self-healing schema (auto-create table sessions bila belum ada)
 * dan toleran terhadap gangguan jaringan (graceful fallback).
 */

class DatabaseSessionHandler implements SessionHandlerInterface
{
    private PDO $pdo;
    private int $lifetime;
    private string $driver;
    private bool $schemaChecked = false;

    public function __construct(PDO $pdo)
    {
        $this->pdo      = $pdo;
        $this->lifetime = (int)ini_get('session.gc_maxlifetime') ?: 7200;
        
        try {
            $this->driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) ?: 'pgsql';
        } catch (Throwable $t) {
            $this->driver = 'pgsql';
        }

        $this->ensureTableExists();
    }

    /**
     * Memastikan tabel sessions tersedia secara otomatis tanpa perlu eksekusi SQL manual.
     */
    private function ensureTableExists(): void
    {
        if ($this->schemaChecked) {
            return;
        }

        try {
            if ($this->driver === 'pgsql') {
                $this->pdo->exec("
                    CREATE TABLE IF NOT EXISTS sessions (
                        id VARCHAR(128) PRIMARY KEY,
                        data TEXT NOT NULL,
                        last_activity BIGINT NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions (last_activity);
                ");
            } else {
                $this->pdo->exec("
                    CREATE TABLE IF NOT EXISTS `sessions` (
                        `id` VARCHAR(128) NOT NULL PRIMARY KEY,
                        `data` MEDIUMTEXT NOT NULL,
                        `last_activity` BIGINT NOT NULL,
                        INDEX `idx_sessions_last_activity` (`last_activity`)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ");
            }
            $this->schemaChecked = true;
        } catch (Throwable $e) {
            error_log('[SessionDB] Gagal verifikasi/membuat tabel sessions: ' . $e->getMessage());
        }
    }

    public function open(string $path, string $name): bool
    {
        return true;
    }

    public function close(): bool
    {
        return true;
    }

    public function read(string $id): string|false
    {
        try {
            $stmt = $this->pdo->prepare(
                'SELECT data FROM sessions WHERE id = :id AND last_activity > :batas'
            );
            $stmt->execute([
                ':id'    => $id,
                ':batas' => time() - $this->lifetime,
            ]);

            $data = $stmt->fetchColumn();
            return $data === false ? '' : (string)$data;
        } catch (Throwable $e) {
            error_log('[SessionDB Read Error]: ' . $e->getMessage());
            return '';
        }
    }

    public function write(string $id, string $data): bool
    {
        try {
            $now = time();

            if ($this->driver === 'pgsql') {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO sessions (id, data, last_activity) VALUES (:id, :data, :waktu)
                     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, last_activity = EXCLUDED.last_activity'
                );
            } elseif ($this->driver === 'mysql') {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO sessions (id, data, last_activity) VALUES (:id, :data, :waktu)
                     ON DUPLICATE KEY UPDATE data = VALUES(data), last_activity = VALUES(last_activity)'
                );
            } else {
                $stmt = $this->pdo->prepare(
                    'REPLACE INTO sessions (id, data, last_activity) VALUES (:id, :data, :waktu)'
                );
            }

            return $stmt->execute([
                ':id'    => $id,
                ':data'  => $data,
                ':waktu' => $now,
            ]);
        } catch (Throwable $e) {
            error_log('[SessionDB Write Error]: ' . $e->getMessage());
            return false;
        }
    }

    public function destroy(string $id): bool
    {
        try {
            $stmt = $this->pdo->prepare('DELETE FROM sessions WHERE id = :id');
            return $stmt->execute([':id' => $id]);
        } catch (Throwable $e) {
            error_log('[SessionDB Destroy Error]: ' . $e->getMessage());
            return false;
        }
    }

    public function gc(int $max_lifetime): int|false
    {
        try {
            $stmt = $this->pdo->prepare('DELETE FROM sessions WHERE last_activity < :batas');
            $stmt->execute([':batas' => time() - $max_lifetime]);
            return (int)$stmt->rowCount();
        } catch (Throwable $e) {
            error_log('[SessionDB GC Error]: ' . $e->getMessage());
            return false;
        }
    }
}
