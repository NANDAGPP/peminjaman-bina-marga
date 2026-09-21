<?php
/**
 * ============================================================
 * Penyimpanan Sesi di Database
 * ============================================================
 * Dipakai saat aplikasi berjalan di lingkungan serverless (Vercel).
 * Di sana setiap request bisa dilayani instance berbeda, sehingga
 * file sesi di /tmp tidak bisa diandalkan.
 */

class DatabaseSessionHandler implements SessionHandlerInterface
{
    private $pdo;
    private $lifetime;

    public function __construct(PDO $pdo)
    {
        $this->pdo      = $pdo;
        $this->lifetime = (int)ini_get('session.gc_maxlifetime') ?: 1440;
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
        $stmt = $this->pdo->prepare(
            'SELECT data FROM sessions WHERE id = :id AND last_activity > :batas'
        );
        $stmt->execute([':id' => $id, ':batas' => time() - $this->lifetime]);

        $data = $stmt->fetchColumn();

        return $data === false ? '' : $data;
    }

    public function write(string $id, string $data): bool
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO sessions (id, data, last_activity) VALUES (:id, :data, :waktu)
             ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, last_activity = EXCLUDED.last_activity'
        );

        return $stmt->execute([':id' => $id, ':data' => $data, ':waktu' => time()]);
    }

    public function destroy(string $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM sessions WHERE id = :id');

        return $stmt->execute([':id' => $id]);
    }

    public function gc(int $max_lifetime): int|false
    {
        $stmt = $this->pdo->prepare('DELETE FROM sessions WHERE last_activity < :batas');
        $stmt->execute([':batas' => time() - $max_lifetime]);

        return $stmt->rowCount();
    }
}
