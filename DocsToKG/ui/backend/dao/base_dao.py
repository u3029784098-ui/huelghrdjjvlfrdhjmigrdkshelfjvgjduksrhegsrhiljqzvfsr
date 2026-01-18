"""
Abstract base DAO (Data Access Object) class.

Provides common CRUD operations and utility methods for all DAOs.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime
import logging

from ..config.db import get_cursor

logger = logging.getLogger(__name__)


class BaseDAO(ABC):
    """
    Abstract base class for all Data Access Objects.
    
    Provides common database operations and enforces consistent
    patterns across all DAOs.
    """
    
    def __init__(self):
        """Initialize the DAO."""
        self.table_name = self._get_table_name()
    
    @abstractmethod
    def _get_table_name(self) -> str:
        """
        Get the table name for this DAO.
        
        Returns:
            str: Table name
        """
        pass
    
    def _build_insert_query(self, data: Dict[str, Any]) -> Tuple[str, tuple]:
        """
        Build an INSERT query from a data dictionary.
        
        Args:
            data: Dictionary of column names to values
            
        Returns:
            Tuple of (query_string, values_tuple)
        """
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        query = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders})"
        values = tuple(data.values())
        return query, values
    
    def _build_update_query(self, data: Dict[str, Any], where_clause: str) -> Tuple[str, tuple]:
        """
        Build an UPDATE query from a data dictionary.
        
        Args:
            data: Dictionary of column names to values
            where_clause: WHERE clause (without WHERE keyword)
            
        Returns:
            Tuple of (query_string, values_tuple)
        """
        set_clause = ', '.join([f"{col} = %s" for col in data.keys()])
        query = f"UPDATE {self.table_name} SET {set_clause} WHERE {where_clause}"
        values = tuple(data.values())
        return query, values
    
    def _add_timestamps(self, data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """
        Add timestamp fields to data dictionary.
        
        Args:
            data: Data dictionary
            is_update: If True, only update updated_at
            
        Returns:
            Updated data dictionary
        """
        now = datetime.now()
        
        if not is_update and 'created_at' not in data:
            data['created_at'] = now
        
        if 'updated_at' not in data:
            data['updated_at'] = now
        
        return data
    
    def execute_query(self, query: str, params: Optional[tuple] = None, fetch_one: bool = False, 
                     fetch_all: bool = False) -> Optional[Any]:
        """
        Execute a database query with error handling.
        
        Args:
            query: SQL query string
            params: Query parameters
            fetch_one: If True, fetch and return one result
            fetch_all: If True, fetch and return all results
            
        Returns:
            Query results or None
            
        Raises:
            Exception: If query execution fails
        """
        try:
            with get_cursor() as (cursor, conn):
                cursor.execute(query, params or ())
                
                if fetch_one:
                    result = cursor.fetchone()
                    conn.commit()
                    return result
                
                if fetch_all:
                    result = cursor.fetchall()
                    conn.commit()
                    return result
                
                conn.commit()
                return cursor.lastrowid if cursor.lastrowid else None
                
        except Exception as e:
            logger.error(f"Query execution failed: {e}\nQuery: {query}\nParams: {params}")
            raise
    
    def find_by_id(self, id_value: Any, id_column: str = None) -> Optional[Dict[str, Any]]:
        """
        Find a record by its primary key.
        
        Args:
            id_value: Primary key value
            id_column: Primary key column name (defaults to table_name + '_id')
            
        Returns:
            Record dictionary or None
        """
        if id_column is None:
            id_column = f"{self.table_name.lower()}_id"
        
        query = f"SELECT * FROM {self.table_name} WHERE {id_column} = %s"
        return self.execute_query(query, (id_value,), fetch_one=True)
    
    def find_all(self, limit: Optional[int] = None, offset: int = 0, 
                 order_by: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Find all records with optional pagination and ordering.
        
        Args:
            limit: Maximum number of records to return
            offset: Number of records to skip
            order_by: Column name for ordering (e.g., 'created_at DESC')
            
        Returns:
            List of record dictionaries
        """
        query = f"SELECT * FROM {self.table_name}"
        
        if order_by:
            query += f" ORDER BY {order_by}"
        
        if limit:
            query += f" LIMIT {limit} OFFSET {offset}"
        
        return self.execute_query(query, fetch_all=True) or []
    
    def count(self, where_clause: Optional[str] = None, params: Optional[tuple] = None) -> int:
        """
        Count records matching optional criteria.
        
        Args:
            where_clause: WHERE clause (without WHERE keyword)
            params: Query parameters
            
        Returns:
            Count of matching records
        """
        query = f"SELECT COUNT(*) as count FROM {self.table_name}"
        
        if where_clause:
            query += f" WHERE {where_clause}"
        
        result = self.execute_query(query, params, fetch_one=True)
        return result['count'] if result else 0
    
    def exists(self, where_clause: str, params: tuple) -> bool:
        """
        Check if a record exists matching criteria.
        
        Args:
            where_clause: WHERE clause (without WHERE keyword)
            params: Query parameters
            
        Returns:
            True if record exists, False otherwise
        """
        return self.count(where_clause, params) > 0
    
    def delete_by_id(self, id_value: Any, id_column: str = None) -> bool:
        """
        Delete a record by its primary key.
        
        Args:
            id_value: Primary key value
            id_column: Primary key column name
            
        Returns:
            True if deleted, False otherwise
        """
        if id_column is None:
            id_column = f"{self.table_name.lower()}_id"
        
        query = f"DELETE FROM {self.table_name} WHERE {id_column} = %s"
        
        try:
            self.execute_query(query, (id_value,))
            logger.info(f"Deleted record from {self.table_name} with {id_column}={id_value}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete record: {e}")
            return False
    
    def delete_where(self, where_clause: str, params: tuple) -> int:
        """
        Delete records matching criteria.
        
        Args:
            where_clause: WHERE clause (without WHERE keyword)
            params: Query parameters
            
        Returns:
            Number of deleted records
        """
        query = f"DELETE FROM {self.table_name} WHERE {where_clause}"
        
        try:
            with get_cursor() as (cursor, conn):
                cursor.execute(query, params)
                deleted_count = cursor.rowcount
                conn.commit()
                logger.info(f"Deleted {deleted_count} record(s) from {self.table_name}")
                return deleted_count
        except Exception as e:
            logger.error(f"Failed to delete records: {e}")
            raise
    
    def find_where(self, where_clause: str, params: tuple, 
                   fetch_one: bool = False) -> Optional[Any]:
        """
        Find records matching criteria.
        
        Args:
            where_clause: WHERE clause (without WHERE keyword)
            params: Query parameters
            fetch_one: If True, return only first result
            
        Returns:
            Record(s) or None
        """
        query = f"SELECT * FROM {self.table_name} WHERE {where_clause}"
        
        if fetch_one:
            return self.execute_query(query, params, fetch_one=True)
        else:
            return self.execute_query(query, params, fetch_all=True)
