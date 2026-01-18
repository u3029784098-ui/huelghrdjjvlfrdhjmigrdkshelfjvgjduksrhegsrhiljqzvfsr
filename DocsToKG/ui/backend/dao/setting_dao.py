"""
Setting Data Access Object (DAO).

Handles all database operations for Setting entities.
Manages comprehensive project configuration across document paths,
LLM settings, embedding models, and Neo4j integration.
"""

from typing import Optional
import logging

from .base_dao import BaseDAO
from ..models.setting import Setting

logger = logging.getLogger(__name__)


class SettingDAO(BaseDAO):
    """Data Access Object for Setting table."""
    
    def _get_table_name(self) -> str:
        return "Setting"
    
    def create(self, setting: Setting) -> bool:
        """
        Create a new setting configuration.
        
        Args:
            setting: Setting instance to create
            
        Returns:
            True if creation successful, False otherwise
            
        Raises:
            Exception: If setting already exists or creation fails
        """
        # Check if setting already exists (composite key)
        if self.find_by_key(setting.user_id, setting.project_name):
            raise ValueError(
                f"Setting already exists for user {setting.user_id} and project {setting.project_name}"
            )
        
        data = setting.to_dict(include_timestamps=False)
        data = self._add_timestamps(data, is_update=False)
        
        query, values = self._build_insert_query(data)
        
        try:
            self.execute_query(query, values)
            logger.info(f"Created setting for user {setting.user_id}, project {setting.project_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to create setting: {e}")
            raise
    
    def find_by_key(self, user_id: int, project_name: str) -> Optional[Setting]:
        """
        Find a setting by composite key (user_id, project_name).
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            Setting instance or None if not found
        """
        result = self.find_where(
            "user_id = %s AND project_name = %s",
            (user_id, project_name),
            fetch_one=True
        )
        return Setting.from_dict(result) if result else None
    
    def find_by_user(self, user_id: int) -> list:
        """
        Find all settings for a specific user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of Setting instances
        """
        results = self.find_where(
            "user_id = %s",
            (user_id,),
            fetch_one=False
        ) or []
        return [Setting.from_dict(row) for row in results]
    
    def update(self, setting: Setting) -> bool:
        """
        Update an existing setting configuration.
        
        Args:
            setting: Setting instance with updated data
            
        Returns:
            True if update successful, False otherwise
            
        Raises:
            ValueError: If composite key is not set
        """
        if not setting.user_id or not setting.project_name:
            raise ValueError("user_id and project_name must be set for update operation")
        
        data = setting.to_dict(include_timestamps=False)
        data = self._add_timestamps(data, is_update=True)
        
        # Remove composite key from update data
        data.pop('user_id', None)
        data.pop('project_name', None)
        
        query, values = self._build_update_query(
            data,
            "user_id = %s AND project_name = %s"
        )
        values = values + (setting.user_id, setting.project_name)
        
        try:
            self.execute_query(query, values)
            logger.info(f"Updated setting for user {setting.user_id}, project {setting.project_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to update setting: {e}")
            return False
    
    def delete(self, user_id: int, project_name: str) -> bool:
        """
        Delete a setting by composite key.
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            True if deletion successful, False otherwise
        """
        deleted_count = self.delete_where(
            "user_id = %s AND project_name = %s",
            (user_id, project_name)
        )
        return deleted_count > 0
    
    def update_document_paths(self, user_id: int, project_name: str, 
                             paths: dict) -> bool:
        """
        Update document paths and prefixes for a setting.
        
        Args:
            user_id: User ID
            project_name: Project name
            paths: Dictionary with keys like 'raw_doc_path', 'text_doc_path', etc.
            
        Returns:
            True if successful, False otherwise
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return False
        
        for key, value in paths.items():
            if hasattr(setting, key):
                setattr(setting, key, value)
        
        return self.update(setting)
    
    def update_llm_config(self, user_id: int, project_name: str,
                         provider: str, model: str) -> bool:
        """
        Update LLM configuration for a setting.
        
        Args:
            user_id: User ID
            project_name: Project name
            provider: LLM provider name
            model: Model identifier
            
        Returns:
            True if successful, False otherwise
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return False
        
        setting.llm_provider = provider
        setting.model = model
        return self.update(setting)
    
    def update_embedding_config(self, user_id: int, project_name: str,
                               model: str, dimensions: int, 
                               similarity_metric: str) -> bool:
        """
        Update embedding model configuration for a setting.
        
        Args:
            user_id: User ID
            project_name: Project name
            model: Embedding model name
            dimensions: Vector dimension
            similarity_metric: Similarity metric (e.g., 'cosine', 'euclidean')
            
        Returns:
            True if successful, False otherwise
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return False
        
        setting.embedding_model = model
        setting.dimensions = dimensions
        setting.similarity_metric = similarity_metric
        return self.update(setting)
    
    def update_neo4j_config(self, user_id: int, project_name: str,
                           uri: str, username: str, password: str,
                           database: str, auradb: bool = False) -> bool:
        """
        Update Neo4j configuration for a setting.
        
        Args:
            user_id: User ID
            project_name: Project name
            uri: Neo4j connection URI
            username: Neo4j username
            password: Neo4j password
            database: Database name
            auradb: Whether using AuraDB (development only)
            
        Returns:
            True if successful, False otherwise
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return False
        
        setting.neo_4j_uri = uri
        setting.neo4j_username = username
        setting.neo4j_password = password
        setting.neo4j_database = database
        setting.neo4j_auradb = auradb
        return self.update(setting)
    
    def update_graph_metadata(self, user_id: int, project_name: str,
                             labels: dict) -> bool:
        """
        Update graph metadata labels for a setting.
        
        Args:
            user_id: User ID
            project_name: Project name
            labels: Dictionary with graph metadata label keys
            
        Returns:
            True if successful, False otherwise
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return False
        
        for key, value in labels.items():
            if hasattr(setting, key):
                setattr(setting, key, value)
        
        return self.update(setting)
    
    def get_neo4j_config(self, user_id: int, project_name: str) -> Optional[dict]:
        """
        Get Neo4j configuration as a dictionary.
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            Dictionary with Neo4j config or None if not found
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return None
        
        return {
            'uri': setting.neo_4j_uri,
            'username': setting.neo4j_username,
            'password': setting.neo4j_password,
            'database': setting.neo4j_database,
            'auradb': setting.neo4j_auradb
        }
    
    def get_llm_config(self, user_id: int, project_name: str) -> Optional[dict]:
        """
        Get LLM configuration as a dictionary.
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            Dictionary with LLM config or None if not found
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return None
        
        return {
            'provider': setting.llm_provider,
            'model': setting.model
        }
    
    def get_embedding_config(self, user_id: int, project_name: str) -> Optional[dict]:
        """
        Get embedding configuration as a dictionary.
        
        Args:
            user_id: User ID
            project_name: Project name
            
        Returns:
            Dictionary with embedding config or None if not found
        """
        setting = self.find_by_key(user_id, project_name)
        if not setting:
            return None
        
        return {
            'model': setting.embedding_model,
            'dimensions': setting.dimensions,
            'similarity_metric': setting.similarity_metric
        }
