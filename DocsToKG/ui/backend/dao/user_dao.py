"""
User Data Access Object (DAO).

Handles all database operations for User entities.
"""

from typing import List, Optional
import logging

from .base_dao import BaseDAO
from ..models.user import User

logger = logging.getLogger(__name__)


class UserDAO(BaseDAO):
    """Data Access Object for User table."""
    
    def _get_table_name(self) -> str:
        return "User"
    
    def create(self, user: User) -> Optional[int]:
        """
        Create a new user in the database.
        
        Args:
            user: User instance to create
            
        Returns:
            Created user_id or None if creation failed
            
        Raises:
            Exception: If email already exists or creation fails
        """
        # Check if email already exists
        if self.find_by_email(user.email):
            raise ValueError(f"User with email {user.email} already exists")
        
        data = user.to_dict(include_id=False, include_timestamps=False)
        data = self._add_timestamps(data, is_update=False)
        
        query, values = self._build_insert_query(data)
        
        try:
            user_id = self.execute_query(query, values)
            logger.info(f"Created user with ID: {user_id}")
            return user_id
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        """
        Find a user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User instance or None if not found
        """
        result = super().find_by_id(user_id, 'user_id')
        return User.from_dict(result) if result else None
    
    def find_by_email(self, email: str) -> Optional[User]:
        """
        Find a user by email address.
        
        Args:
            email: User's email
            
        Returns:
            User instance or None if not found
        """
        result = self.find_where("email = %s", (email,), fetch_one=True)
        return User.from_dict(result) if result else None
    
    def find_all(self, limit: Optional[int] = None, offset: int = 0) -> List[User]:
        """
        Get all users with optional pagination.
        
        Args:
            limit: Maximum number of users to return
            offset: Number of users to skip
            
        Returns:
            List of User instances
        """
        results = super().find_all(limit=limit, offset=offset, order_by='created_at DESC')
        return [User.from_dict(row) for row in results]
    
    def update(self, user: User) -> bool:
        """
        Update an existing user.
        
        Args:
            user: User instance with updated data
            
        Returns:
            True if update successful, False otherwise
            
        Raises:
            ValueError: If user_id is not set
        """
        if not user.user_id:
            raise ValueError("User ID must be set for update operation")
        
        data = user.to_dict(include_id=False, include_timestamps=False)
        data = self._add_timestamps(data, is_update=True)
        
        query, values = self._build_update_query(data, "user_id = %s")
        values = values + (user.user_id,)
        
        try:
            self.execute_query(query, values)
            logger.info(f"Updated user with ID: {user.user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update user: {e}")
            return False
    
    def delete(self, user_id: int) -> bool:
        """
        Delete a user by ID.
        
        Args:
            user_id: User ID to delete
            
        Returns:
            True if deletion successful, False otherwise
        """
        return self.delete_by_id(user_id, 'user_id')
    
    def authenticate(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user by email and password.
        
        Note: This is a basic implementation. In production, you should
        use proper password hashing (bcrypt, argon2, etc.) and compare hashes.
        
        Args:
            email: User's email
            password: User's password (should be hashed in production)
            
        Returns:
            User instance if authentication successful, None otherwise
        """
        result = self.find_where(
            "email = %s AND password = %s",
            (email, password),
            fetch_one=True
        )
        return User.from_dict(result) if result else None
    
    def email_exists(self, email: str) -> bool:
        """
        Check if an email address is already registered.
        
        Args:
            email: Email address to check
            
        Returns:
            True if email exists, False otherwise
        """
        return self.exists("email = %s", (email,))
    
    def search_by_name(self, name_query: str) -> List[User]:
        """
        Search users by first or last name.
        
        Args:
            name_query: Search query for name
            
        Returns:
            List of matching User instances
        """
        query = f"""
            SELECT * FROM {self.table_name}
            WHERE first_name LIKE %s OR last_name LIKE %s
            ORDER BY first_name, last_name
        """
        search_pattern = f"%{name_query}%"
        results = self.execute_query(
            query,
            (search_pattern, search_pattern),
            fetch_all=True
        ) or []
        
        return [User.from_dict(row) for row in results]
    
    def count_users(self) -> int:
        """
        Get total count of users.
        
        Returns:
            Total number of users
        """
        return self.count()
