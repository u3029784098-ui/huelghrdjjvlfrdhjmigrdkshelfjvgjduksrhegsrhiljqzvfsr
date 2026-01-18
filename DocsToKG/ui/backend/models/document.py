"""
Document data model.

Represents a document within a project in the DocsToKG system.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Document:
    """
    Document model representing the Document table.
    
    Uses composite primary key: (doc_id, user_id, project_name)
    
    Attributes:
        doc_id: Unique document identifier (auto-increment)
        user_id: Owner user ID (foreign key)
        project_name: Parent project name (foreign key)
        path_name: File path or storage location
        created_at: Timestamp of upload
        updated_at: Timestamp of last update
    """
    
    user_id: int
    project_name: str
    path_name: str
    doc_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self, include_id: bool = True, include_timestamps: bool = True) -> dict:
        """
        Convert document model to dictionary.
        
        Args:
            include_id: Include doc_id in dictionary
            include_timestamps: Include created_at and updated_at
            
        Returns:
            Dictionary representation of document
        """
        data = {
            'user_id': self.user_id,
            'project_name': self.project_name,
            'path_name': self.path_name
        }
        
        if include_id and self.doc_id is not None:
            data['doc_id'] = self.doc_id
        
        if include_timestamps:
            if self.created_at:
                data['created_at'] = self.created_at
            if self.updated_at:
                data['updated_at'] = self.updated_at
        
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Document':
        """
        Create a Document instance from a dictionary.
        
        Args:
            data: Dictionary containing document data
            
        Returns:
            Document instance
        """
        return cls(
            doc_id=data.get('doc_id'),
            user_id=data['user_id'],
            project_name=data['project_name'],
            path_name=data['path_name'],
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def get_filename(self) -> str:
        """Extract filename from path."""
        return self.path_name.split('/')[-1] if self.path_name else ''
    
    def get_directory(self) -> str:
        """Extract directory from path."""
        parts = self.path_name.split('/') if self.path_name else []
        return '/'.join(parts[:-1]) if len(parts) > 1 else ''
    
    def __repr__(self) -> str:
        return f"Document(id={self.doc_id}, project={self.project_name}, path={self.path_name})"
