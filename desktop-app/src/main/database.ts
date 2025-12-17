/**
 * Database Service
 *
 * Manages SQLite database connections and migrations for the desktop app.
 * Uses better-sqlite3 for synchronous, performant SQLite operations.
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DatabaseService manages the SQLite database lifecycle including
 * initialization, migrations, and connection management.
 */
export class DatabaseService {
  private dbPath: string;
  private db: Database.Database | null = null;

  /**
   * Creates a new DatabaseService instance.
   * @param dbPath - Path to the SQLite database file
   */
  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   * Initializes the database connection and runs migrations if needed.
   * Creates the database file and parent directories if they don't exist.
   */
  async initialize(): Promise<void> {
    // Already initialized, skip
    if (this.db) {
      return;
    }

    // Create parent directories if needed
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database connection
    this.db = new Database(this.dbPath);

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    // Enable foreign key constraints (required per connection in SQLite)
    this.db.pragma('foreign_keys = ON');

    // Run migrations
    await this.runMigrations();
  }

  /**
   * Closes the database connection.
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Checks if the database is initialized and connected.
   */
  isInitialized(): boolean {
    return this.db !== null;
  }

  /**
   * Returns the raw database connection.
   * @throws Error if database is not initialized
   */
  getConnection(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Returns the database file path.
   */
  getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * Runs database migrations.
   * Migrations are idempotent (use IF NOT EXISTS).
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Get migration file path
    const migrationPath = this.getMigrationPath();

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    // Read and execute migration SQL
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration (better-sqlite3 supports multiple statements via exec)
    this.db.exec(migrationSql);
  }

  /**
   * Gets the path to the migration file.
   * In production, this will be relative to the app resources.
   * In development/tests, this uses the project structure.
   */
  private getMigrationPath(): string {
    // Try different paths for migration file

    // 1. Check relative to project root (development/testing)
    const projectRoot = path.resolve(__dirname, '..', '..', '..');
    const devPath = path.join(projectRoot, 'database', 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(devPath)) {
      return devPath;
    }

    // 2. Check relative to app.asar (production)
    const prodPath = path.join(process.resourcesPath || '', 'database', 'migrations', '001_initial_schema.sql');
    if (fs.existsSync(prodPath)) {
      return prodPath;
    }

    // 3. Fallback - return dev path and let it fail with clear error
    return devPath;
  }
}

/**
 * Default database path helper.
 * Returns the path for the application database in the user data directory.
 * @param userDataPath - Electron's app.getPath('userData')
 */
export function getDefaultDatabasePath(userDataPath: string): string {
  return path.join(userDataPath, 'contpaq-win.db');
}
