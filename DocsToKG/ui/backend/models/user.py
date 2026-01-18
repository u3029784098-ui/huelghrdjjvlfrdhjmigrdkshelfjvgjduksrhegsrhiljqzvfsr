"""
User data model.

Represents a user in the system with authentication and profile information.
"""

from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional


@dataclass
class User:
    """
    User model representing the User table.
    
    Attributes:
        user_id: Unique identifier (auto-increment)
        first_name: User's first name
        last_name: User's last name
        birth_date: User's date of birth
        email: User's email address (unique)
        address: User's physical address
        password: Hashed password
        created_at: Timestamp of account creation
        updated_at: Timestamp of last update
    """
    
    first_name: str
    last_name: str
    email: str
    password: str
    birth_date: Optional[date] = None
    address: Optional[str] = None
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self, include_id: bool = True, include_timestamps: bool = True) -> dict:
        """
        Convert user model to dictionary.
        
        Args:
            include_id: Include user_id in dictionary
            include_timestamps: Include created_at and updated_at
            
        Returns:
            Dictionary representation of user
        """
        data = {
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'password': self.password,
            'birth_date': self.birth_date,
            'address': self.address
        }
        
        if include_id and self.user_id is not None:
            data['user_id'] = self.user_id
        
        if include_timestamps:
            if self.created_at:
                data['created_at'] = self.created_at
            if self.updated_at:
                data['updated_at'] = self.updated_at
        
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> 'User':
        """
        Create a User instance from a dictionary.
        
        Args:
            data: Dictionary containing user data
            
        Returns:
            User instance
        """
        return cls(
            user_id=data.get('user_id'),
            first_name=data['first_name'],
            last_name=data['last_name'],
            birth_date=data.get('birth_date'),
            email=data['email'],
            address=data.get('address'),
            password=data['password'],
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def get_full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self) -> str:
        return f"User(id={self.user_id}, email={self.email}, name={self.get_full_name()})"
