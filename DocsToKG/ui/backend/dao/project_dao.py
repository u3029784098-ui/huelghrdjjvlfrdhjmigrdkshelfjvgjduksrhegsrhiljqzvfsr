"""
Project Data Access Object (DAO).

Handles all database operations for Project entities.
Manages composite key operations (project_name, user_id).
"""

from typing import List, Optional
import logging

from .base_dao import BaseDAO
from ..models.project import Project

logger = logging.getLogger(__name__)


class ProjectDAO(BaseDAO):
    """Data Access Object for Project table."""
    
    def _get_table_name(self) -> str:
        return "Project"
    
    def create(self, project: Project) -> bool:
        """
        Create a new project in the database.
        
        Args:
            project: Project instance to create
            
        Returns:
            True if creation successful, False otherwise
            
        Raises:
            Exception: If project already exists or creation fails
        """
        # Check if project already exists (composite key)
        if self.find_by_key(project.project_name, project.user_id):
            raise ValueError(
                f"Project '{project.project_name}' already exists for user {project.user_id}"
            )
        
        data = project.to_dict(include_timestamps=False)
        data = self._add_timestamps(data, is_update=False)
        
        query, values = self._build_insert_query(data)
        
        try:
            self.execute_query(query, values)
            logger.info(f"Created project: {project.project_name} for user {project.user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to create project: {e}")
            raise
    
    def find_by_key(self, project_name: str, user_id: int) -> Optional[Project]:
        """
        Find a project by composite key (project_name, user_id).
        
        Args:
            project_name: Project name
            user_id: User ID
            
        Returns:
            Project instance or None if not found
        """
        result = self.find_where(
            "project_name = %s AND user_id = %s",
            (project_name, user_id),
            fetch_one=True
        )
        return Project.from_dict(result) if result else None
    
    def find_by_user(self, user_id: int, limit: Optional[int] = None, 
                     offset: int = 0) -> List[Project]:
        """
        Find all projects for a specific user.
        
        Args:
            user_id: User ID
            limit: Maximum number of projects to return
            offset: Number of projects to skip
            
        Returns:
            List of Project instances
        """
        query = f"SELECT * FROM {self.table_name} WHERE user_id = %s ORDER BY created_at DESC"
        
        if limit:
            query += f" LIMIT {limit} OFFSET {offset}"
        
        results = self.execute_query(query, (user_id,), fetch_all=True) or []
        return [Project.from_dict(row) for row in results]
    
    def find_all(self, limit: Optional[int] = None, offset: int = 0) -> List[Project]:
        """
        Find all projects with optional pagination.
        
        Args:
            limit: Maximum number of projects to return
            offset: Number of projects to skip
            
        Returns:
            List of Project instances
        """
        results = super().find_all(limit=limit, offset=offset, order_by='created_at DESC')
        return [Project.from_dict(row) for row in results]
    
    def update(self, project: Project) -> bool:
        """
        Update an existing project.
        
        Args:
            project: Project instance with updated data
            
        Returns:
            True if update successful, False otherwise
            
        Raises:
            ValueError: If composite key is not set
        """
        if not project.project_name or not project.user_id:
            raise ValueError("project_name and user_id must be set for update operation")
        
        data = project.to_dict(include_timestamps=False)
        data = self._add_timestamps(data, is_update=True)
        
        # Remove composite key from update data
        data.pop('project_name', None)
        data.pop('user_id', None)
        
        query, values = self._build_update_query(
            data,
            "project_name = %s AND user_id = %s"
        )
        values = values + (project.project_name, project.user_id)
        
        try:
            self.execute_query(query, values)
            logger.info(f"Updated project: {project.project_name} for user {project.user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update project: {e}")
            return False
    
    def delete(self, project_name: str, user_id: int) -> bool:
        """
        Delete a project by composite key.
        
        Args:
            project_name: Project name
            user_id: User ID
            
        Returns:
            True if deletion successful, False otherwise
        """
        deleted_count = self.delete_where(
            "project_name = %s AND user_id = %s",
            (project_name, user_id)
        )
        return deleted_count > 0
    
    def find_by_status(self, user_id: int, status: str) -> List[Project]:
        """
        Find projects by status for a specific user.
        
        Args:
            user_id: User ID
            status: Project status (completed, uploading, processing, error)
            
        Returns:
            List of Project instances
        """
        results = self.find_where(
            "user_id = %s AND status = %s",
            (user_id, status),
            fetch_one=False
        ) or []
        return [Project.from_dict(row) for row in results]
    
    def find_favorites(self, user_id: int) -> List[Project]:
        """
        Find all favorite projects for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of favorite Project instances
        """
        results = self.find_where(
            "user_id = %s AND is_favorite = true",
            (user_id,),
            fetch_one=False
        ) or []
        return [Project.from_dict(row) for row in results]
    
    def toggle_favorite(self, project_name: str, user_id: int) -> bool:
        """
        Toggle the favorite status of a project.
        
        Args:
            project_name: Project name
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        project = self.find_by_key(project_name, user_id)
        if not project:
            return False
        
        project.is_favorite = not project.is_favorite
        return self.update(project)
    
    def update_progress(self, project_name: str, user_id: int, percentage: int) -> bool:
        """
        Update the progress percentage of a project.
        
        Args:
            project_name: Project name
            user_id: User ID
            percentage: Progress percentage (0-100)
            
        Returns:
            True if successful, False otherwise
        """
        if not 0 <= percentage <= 100:
            raise ValueError("Percentage must be between 0 and 100")
        
        project = self.find_by_key(project_name, user_id)
        if not project:
            return False
        
        project.percentage = percentage
        if percentage == 100:
            project.status = 'completed'
        
        return self.update(project)
    
    def count_by_user(self, user_id: int) -> int:
        """
        Get count of projects for a specific user.
        
        Args:
            user_id: User ID
            
        Returns:
            Count of projects
        """
        return self.count("user_id = %s", (user_id,))
    
    def search_by_name(self, user_id: int, name_query: str) -> List[Project]:
        """
        Search projects by name for a specific user.
        
        Args:
            user_id: User ID
            name_query: Search query
            
        Returns:
            List of matching Project instances
        """
        search_pattern = f"%{name_query}%"
        results = self.find_where(
            "user_id = %s AND project_name LIKE %s",
            (user_id, search_pattern),
            fetch_one=False
        ) or []
        return [Project.from_dict(row) for row in results]
