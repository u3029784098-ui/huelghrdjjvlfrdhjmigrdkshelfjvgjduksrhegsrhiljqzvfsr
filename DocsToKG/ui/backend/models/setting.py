"""
Setting data model.

Represents configuration and settings for a project.
Stores document paths, LLM configuration, Neo4j settings, and graph metadata.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List


@dataclass
class Setting:
    """
    Setting model representing the Setting table.
    
    Uses composite primary key: (user_id, project_name)
    
    Stores comprehensive configuration for document processing,
    LLM/embedding models, and Neo4j graph database settings.
    """
    
    user_id: int
    project_name: str
    
    # Document paths and prefixes
    raw_doc_path: Optional[str] = None
    raw_doc_prefix: Optional[str] = None
    metadata_doc_path: Optional[str] = None
    metadata_doc_prefix: Optional[str] = None
    text_doc_path: Optional[str] = None
    text_doc_prefix: Optional[str] = None
    figures_doc_path: Optional[str] = None
    figures_doc_prefix: Optional[str] = None
    formulas_doc_path: Optional[str] = None
    formulas_doc_prefix: Optional[str] = None
    tables_doc_path: Optional[str] = None
    tables_doc_prefix: Optional[str] = None
    hierarchy_doc_path: Optional[str] = None
    hierarchy_doc_prefix: Optional[str] = None
    shrinks_doc_path: Optional[str] = None
    shrinks_doc_prefix: Optional[str] = None
    
    # LLM & Embeddings configuration
    llm_provider: Optional[str] = None
    llm: Optional[str] = None
    embedding_provider: Optional[str] = None
    embedding_model: Optional[str] = None
    dimensions: Optional[int] = None
    similarity_metric: Optional[str] = None
    
    # Graph metadata labels
    lexical_graph_meta_label: Optional[str] = None
    domain_graph_meta_label: Optional[str] = None
    formulas_graph_meta_label: Optional[str] = None
    tables_graph_meta_label: Optional[str] = None
    figures_graph_meta_label: Optional[str] = None
    
    # Hierarchy & graph settings
    hierarchy_level: Optional[str] = None  # Stored as comma-separated list
    llm_graph_builder_url: Optional[str] = None
    
    # Neo4j configuration
    neo_4j_uri: Optional[str] = None
    neo4j_username: Optional[str] = None
    neo4j_password: Optional[str] = None
    neo4j_database: Optional[str] = None
    neo4j_auradb: bool = False
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self, include_timestamps: bool = True) -> dict:
        """
        Convert setting model to dictionary.
        
        Args:
            include_timestamps: Include created_at and updated_at
            
        Returns:
            Dictionary representation of setting
        """
        data = {
            'user_id': self.user_id,
            'project_name': self.project_name,
            'raw_doc_path': self.raw_doc_path,
            'raw_doc_prefix': self.raw_doc_prefix,
            'metadata_doc_path': self.metadata_doc_path,
            'metadata_doc_prefix': self.metadata_doc_prefix,
            'text_doc_path': self.text_doc_path,
            'text_doc_prefix': self.text_doc_prefix,
            'figures_doc_path': self.figures_doc_path,
            'figures_doc_prefix': self.figures_doc_prefix,
            'formulas_doc_path': self.formulas_doc_path,
            'formulas_doc_prefix': self.formulas_doc_prefix,
            'tables_doc_path': self.tables_doc_path,
            'tables_doc_prefix': self.tables_doc_prefix,
            'hierarchy_doc_path': self.hierarchy_doc_path,
            'hierarchy_doc_prefix': self.hierarchy_doc_prefix,
            'shrinks_doc_path': self.shrinks_doc_path,
            'shrinks_doc_prefix': self.shrinks_doc_prefix,
            'llm_provider': self.llm_provider,
            'llm': self.llm,
            'embedding_provider': self.embedding_provider,
            'embedding_model': self.embedding_model,
            'dimensions': self.dimensions,
            'similarity_metric': self.similarity_metric,
            'lexical_graph_meta_label': self.lexical_graph_meta_label,
            'domain_graph_meta_label': self.domain_graph_meta_label,
            'formulas_graph_meta_label': self.formulas_graph_meta_label,
            'tables_graph_meta_label': self.tables_graph_meta_label,
            'figures_graph_meta_label': self.figures_graph_meta_label,
            'hierarchy_level': self.hierarchy_level,
            'llm_graph_builder_url': self.llm_graph_builder_url,
            'neo_4j_uri': self.neo_4j_uri,
            'neo4j_username': self.neo4j_username,
            'neo4j_password': self.neo4j_password,
            'neo4j_database': self.neo4j_database,
            'neo4j_auradb': self.neo4j_auradb
        }
        
        if include_timestamps:
            if self.created_at:
                data['created_at'] = self.created_at
            if self.updated_at:
                data['updated_at'] = self.updated_at
        
        return data
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Setting':
        """
        Create a Setting instance from a dictionary.
        
        Args:
            data: Dictionary containing setting data
            
        Returns:
            Setting instance
        """
        return cls(
            user_id=data['user_id'],
            project_name=data['project_name'],
            raw_doc_path=data.get('raw_doc_path'),
            raw_doc_prefix=data.get('raw_doc_prefix'),
            metadata_doc_path=data.get('metadata_doc_path'),
            metadata_doc_prefix=data.get('metadata_doc_prefix'),
            text_doc_path=data.get('text_doc_path'),
            text_doc_prefix=data.get('text_doc_prefix'),
            figures_doc_path=data.get('figures_doc_path'),
            figures_doc_prefix=data.get('figures_doc_prefix'),
            formulas_doc_path=data.get('formulas_doc_path'),
            formulas_doc_prefix=data.get('formulas_doc_prefix'),
            tables_doc_path=data.get('tables_doc_path'),
            tables_doc_prefix=data.get('tables_doc_prefix'),
            hierarchy_doc_path=data.get('hierarchy_doc_path'),
            hierarchy_doc_prefix=data.get('hierarchy_doc_prefix'),
            shrinks_doc_path=data.get('shrinks_doc_path'),
            shrinks_doc_prefix=data.get('shrinks_doc_prefix'),
            llm_provider=data.get('llm_provider'),
            llm=data.get('llm') or data.get('model'),
            embedding_provider=data.get('embedding_provider'),
            embedding_model=data.get('embedding_model'),
            dimensions=data.get('dimensions'),
            similarity_metric=data.get('similarity_metric'),
            lexical_graph_meta_label=data.get('lexical_graph_meta_label'),
            domain_graph_meta_label=data.get('domain_graph_meta_label'),
            formulas_graph_meta_label=data.get('formulas_graph_meta_label'),
            tables_graph_meta_label=data.get('tables_graph_meta_label'),
            figures_graph_meta_label=data.get('figures_graph_meta_label'),
            hierarchy_level=data.get('hierarchy_level'),
            llm_graph_builder_url=data.get('llm_graph_builder_url'),
            neo_4j_uri=data.get('neo_4j_uri'),
            neo4j_username=data.get('neo4j_username'),
            neo4j_password=data.get('neo4j_password'),
            neo4j_database=data.get('neo4j_database'),
            neo4j_auradb=bool(data.get('neo4j_auradb', False)),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    def get_hierarchy_levels(self) -> List[str]:
        """Get hierarchy levels as a list."""
        if not self.hierarchy_level:
            return []
        return [level.strip() for level in self.hierarchy_level.split(',')]
    
    def set_hierarchy_levels(self, levels: List[str]) -> None:
        """Set hierarchy levels from a list."""
        self.hierarchy_level = ','.join(levels) if levels else None
    
    def __repr__(self) -> str:
        return f"Setting(user={self.user_id}, project={self.project_name})"
