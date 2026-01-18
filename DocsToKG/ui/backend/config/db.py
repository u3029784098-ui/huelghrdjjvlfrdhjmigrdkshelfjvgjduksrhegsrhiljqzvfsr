"""
Database connection module with connection pooling and error handling.

This module provides a centralized, reusable database connection manager
for MySQL using connection pooling for optimal performance.
"""

import os
import logging
from typing import Optional
from contextlib import contextmanager
import mysql.connector
from mysql.connector import pooling, Error
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Database configuration from environment variables."""
    
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', 3308))
        self.database = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self.pool_name = os.getenv('DB_POOL_NAME', 'docstokgpool')
        self.pool_size = int(os.getenv('DB_POOL_SIZE', 5))
        self.pool_reset_session = os.getenv('DB_POOL_RESET_SESSION', 'true').lower() == 'true'
        
        self._validate()
    
    def _validate(self):
        """Validate required configuration parameters."""
        if not all([self.database, self.user, self.password]):
            raise ValueError(
                "Missing required database configuration. "
                "Please set DB_NAME, DB_USER, and DB_PASSWORD in environment variables."
            )
    
    def to_dict(self):
        """Convert configuration to dictionary for mysql.connector."""
        return {
            'host': self.host,
            'port': self.port,
            'database': self.database,
            'user': self.user,
            'password': self.password,
            'pool_name': self.pool_name,
            'pool_size': self.pool_size,
            'pool_reset_session': self.pool_reset_session,
            'autocommit': False,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'use_unicode': True
        }


class DatabaseConnectionManager:
    """Singleton manager for database connections with connection pooling."""
    
    _instance: Optional['DatabaseConnectionManager'] = None
    _pool: Optional[pooling.MySQLConnectionPool] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._pool is None:
            self._initialize_pool()
    
    def _initialize_pool(self):
        """Initialize the connection pool."""
        try:
            config = DatabaseConfig()
            self._pool = pooling.MySQLConnectionPool(**config.to_dict())
            logger.info(
                f"Database connection pool initialized: "
                f"{config.pool_name} (size: {config.pool_size})"
            )
        except Error as e:
            logger.error(f"Failed to initialize database connection pool: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during pool initialization: {e}")
            raise
    
    def get_connection(self):
        """
        Get a connection from the pool.
        
        Returns:
            mysql.connector.connection.MySQLConnection: Database connection
            
        Raises:
            Error: If unable to get connection from pool
        """
        try:
            connection = self._pool.get_connection()
            logger.debug("Connection acquired from pool")
            return connection
        except Error as e:
            logger.error(f"Failed to get connection from pool: {e}")
            raise
    
    @contextmanager
    def get_cursor(self, dictionary=True, buffered=True):
        """
        Context manager for database cursor with automatic connection handling.
        
        Args:
            dictionary: If True, return rows as dictionaries
            buffered: If True, fetch all rows immediately
            
        Yields:
            tuple: (cursor, connection) pair
            
        Example:
            with db_manager.get_cursor() as (cursor, conn):
                cursor.execute("SELECT * FROM users")
                results = cursor.fetchall()
                conn.commit()
        """
        connection = None
        cursor = None
        
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=dictionary, buffered=buffered)
            yield cursor, connection
            
        except Error as e:
            if connection:
                connection.rollback()
                logger.error(f"Database error, transaction rolled back: {e}")
            raise
            
        finally:
            if cursor:
                cursor.close()
                logger.debug("Cursor closed")
            if connection:
                connection.close()
                logger.debug("Connection returned to pool")
    
    def close_pool(self):
        """Close all connections in the pool. Use during application shutdown."""
        if self._pool:
            try:
                # Close all connections in pool
                logger.info("Closing database connection pool")
                self._pool = None
                logger.info("Database connection pool closed successfully")
            except Exception as e:
                logger.error(f"Error closing connection pool: {e}")
    
    def test_connection(self) -> bool:
        """
        Test database connectivity.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            with self.get_cursor() as (cursor, conn):
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                logger.info("Database connection test successful")
                return result is not None
        except Error as e:
            logger.error(f"Database connection test failed: {e}")
            return False


# Global instance
db_manager = DatabaseConnectionManager()


def get_db_manager() -> DatabaseConnectionManager:
    """
    Get the global database manager instance.
    
    Returns:
        DatabaseConnectionManager: Singleton database manager
    """
    return db_manager


# Convenience function for getting cursor
@contextmanager
def get_cursor(dictionary=True, buffered=True):
    """
    Convenience function to get a cursor without accessing db_manager.
    
    Args:
        dictionary: If True, return rows as dictionaries
        buffered: If True, fetch all rows immediately
        
    Yields:
        tuple: (cursor, connection) pair
    """
    with db_manager.get_cursor(dictionary=dictionary, buffered=buffered) as (cursor, conn):
        yield cursor, conn
