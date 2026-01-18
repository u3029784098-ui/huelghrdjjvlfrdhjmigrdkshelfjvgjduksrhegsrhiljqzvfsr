"""
Document Data Access Object (DAO).

Handles all database operations for Document entities.
"""

from typing import List, Optional
import logging

from .base_dao import BaseDAO
from ..models.document import Document

logger = logging.getLogger(__name__)


class DocumentDAO(BaseDAO):
    """Data Access Object for Document table."""
    
    def _get_table_name(self) -> str:
        return "Document"
    
    def create(self, document: Document) -> Optional[int]:
        """
        Create a new document in the database.
        
        Args:
            document: Document instance to create
            
        Returns:
            Created doc_id or None if creation failed
            
        Raises:
            Exception: If creation fails
        """
        data = document.to_dict(include_id=False, include_timestamps=False)
        data = self._add_timestamps(data, is_update=False)
        
        query, values = self._build_insert_query(data)
        
        try:
            doc_id = self.execute_query(query, values)
            logger.info(
                f"Created document {doc_id} in project {document.project_name} "
                f"for user {document.user_id}"
            )
            return doc_id
        except Exception as e:
            logger.error(f"Failed to create document: {e}")
            raise
    
    def find_by_id(self, doc_id: int) -> Optional[Document]:
        """
        Find a document by ID.
        
        Args:
            doc_id: Document ID
            
        Returns:
            Document instance or None if not found
        """
        result = super().find_by_id(doc_id, 'doc_id')
        return Document.from_dict(result) if result else None
    
    def find_by_project(self, user_id: int, project_name: str, 
                       limit: Optional[int] = None, offset: int = 0) -> List[Document]:
        """
        Find all documents in a specific project.
        
        Args:
            user_id: User ID
            project_name: Project name
            limit: Maximum number of documents to return
            offset: Number of documents to skip
            
        Returns:
            List of Document instances
        """
        query = f"""
            SELECT * FROM {self.table_name}
            WHERE user_id = %s AND project_name = %s
            ORDER BY created_at DESC
        """
        
        if limit:
            query += f" LIMIT {limit} OFFSET {offset}"
        
        results = self.execute_query(
            query,
            (user_id, project_name),
            fetch_all=True
        ) or []
        
        return [Document.from_dict(row) for row in results]
    
    def find_by_user(self, user_id: int, limit: Optional[int] = None, 
                     offset: int = 0) -> List[Document]:
        """
        Find all documents for a specific user across all projects.
        
        Args:
            user_id: User ID
            limit: Maximum number of documents to return
            offset: Number of documents to skip
            
        Returns:
            List of Document instances
        """
        query = f"""
            SELECT * FROM {self.table_name}
            WHERE user_id = %s
            ORDER BY created_at DESC
        """
        
        if limit:
            query += f" LIMIT {limit} OFFSET {offset}"
        
        results = self.execute_query(query, (user_id,), fetch_all=True) or []
        return [Document.from_dict(row) for row in results]
    
    def find_all(self, limit: Optional[int] = None, offset: int = 0) -> List[Document]:
        """
        Find all documents with optional pagination.
        
        Args:
            limit: Maximum number of documents to return
            offset: Number of documents to skip
            
        Returns:
            List of Document instances
        """
        results = super().find_all(limit=limit, offset=offset, order_by='created_at DESC')
        return [Document.from_dict(row) for row in results]
    
    def update(self, document: Document) -> bool:
        """
        Update an existing document.
        
        Args:
            document: Document instance with updated data
            
        Returns:
            True if update successful, False otherwise
            
        Raises:
            ValueError: If doc_id is not set
        """
        if not document.doc_id:
            raise ValueError("doc_id must be set for update operation")
        
        data = document.to_dict(include_id=False, include_timestamps=False)
        data = self._add_timestamps(data, is_update=True)
        
        query, values = self._build_update_query(data, "doc_id = %s")
        values = values + (document.doc_id,)
        
        try:
            self.execute_query(query, values)
            logger.info(f"Updated document with ID: {document.doc_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update document: {e}")
            return False
    
    def delete(self, doc_id: int) -> bool:
        """
        Delete a document by ID.
        
        Args:
            doc_id: Document ID to delete
            
        Returns:
            True if deletion successful, False otherwise
        """
        return self.delete_by_id(doc_id, 'doc_id')
    
    def delete_by_project(self, user_id: int, project_name: str) -> int:
        """
        Delete all documents in a project.
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            Number of deleted documents
        """
        return self.delete_where(
            "user_id = %s AND project_name = %s",
            (user_id, project_name)
        )
    
    def count_by_project(self, user_id: int, project_name: str) -> int:
        """
        Get count of documents in a project.
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            Count of documents
        """
        return self.count(
            "user_id = %s AND project_name = %s",
            (user_id, project_name)
        )
    
    def count_by_user(self, user_id: int) -> int:
        """
        Get total count of documents for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            Count of documents
        """
        return self.count("user_id = %s", (user_id,))
    
    def search_by_path(self, user_id: int, project_name: str, 
                      path_query: str) -> List[Document]:
        """
        Search documents by path name in a project.
        
        Args:
            user_id: User ID
            project_name: Project name
            path_query: Search query for path
            
        Returns:
            List of matching Document instances
        """
        search_pattern = f"%{path_query}%"
        results = self.find_where(
            "user_id = %s AND project_name = %s AND path_name LIKE %s",
            (user_id, project_name, search_pattern),
            fetch_one=False
        ) or []
        return [Document.from_dict(row) for row in results]
    
    def get_recent_documents(self, user_id: int, limit: int = 10) -> List[Document]:
        """
        Get recently uploaded documents for a user.
        
        Args:
            user_id: User ID
            limit: Maximum number of documents to return
            
        Returns:
            List of recently uploaded Document instances
        """
        return self.find_by_user(user_id, limit=limit, offset=0)
