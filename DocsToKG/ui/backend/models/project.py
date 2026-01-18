"""
Project data model.

Represents a document-to-knowledge-graph project with status and metadata.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List


@dataclass
class Project:
    """
    Project model representing the Project table.
    
    Uses composite primary key: (project_name, user_id)
    
    Attributes:
        project_name: Unique project name
        user_id: Owner user ID (foreign key)
        description: Project description
        is_favorite: Whether marked as favorite
        status: Project status (completed, uploading, processing, error)
        tags: List of tags/labels
        percentage: Completion percentage (0-100)
        created_at: Timestamp of creation
        updated_at: Timestamp of last update
    """
    
    project_name: str
    user_id: int
    description: Optional[str] = None
    is_favorite: bool = False
    status: str = "uploading"  # completed, uploading, processing, error
    tags: List[str] = field(default_factory=list)
    percentage: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self, include_timestamps: bool = True) -> dict:
        """
        Convert project model to dictionary.
        
        Args:
            include_timestamps: Include created_at and updated_at
            
        Returns:
            Dictionary representation of project
        """
        data = {
            'project_name': self.project_name,
            'user_id': self.user_id,
            'description': self.description,
            'is_favorite': self.is_favorite,
            'status': self.status,
            'tags': ','.join(self.tags) if self.tags else None,  # Store as comma-separated string
            'percentage': self.percentage
        }
        
        if include_timestamps:
            if self.created_at:
                data['created_at'] = self.created_at
            if self.updated_at:
                data['updated_at'] = self.updated_at
        
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Project':
        """
        Create a Project instance from a dictionary.
        
        Args:
            data: Dictionary containing project data
            
        Returns:
            Project instance
        """
        # Parse tags from comma-separated string
        tags = []
        if data.get('tags'):
            tags = [tag.strip() for tag in str(data['tags']).split(',')]
        
        return cls(
            project_name=data['project_name'],
            user_id=data['user_id'],
            description=data.get('description'),
            is_favorite=bool(data.get('is_favorite', False)),
            status=data.get('status', 'uploading'),
            tags=tags,
            percentage=data.get('percentage', 0),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def add_tag(self, tag: str) -> None:
        """Add a tag to the project."""
        if tag and tag not in self.tags:
            self.tags.append(tag)
    
    def remove_tag(self, tag: str) -> None:
        """Remove a tag from the project."""
        if tag in self.tags:
            self.tags.remove(tag)
    
    def is_complete(self) -> bool:
        """Check if project is completed."""
        return self.status == 'completed' and self.percentage == 100
    
    def is_processing(self) -> bool:
        """Check if project is currently processing."""
        return self.status == 'processing'
    
    def is_error(self) -> bool:
        """Check if project encountered an error."""
        return self.status == 'error'
    
    def __repr__(self) -> str:
        return f"Project(name={self.project_name}, user_id={self.user_id}, status={self.status}, completion={self.percentage}%)"
