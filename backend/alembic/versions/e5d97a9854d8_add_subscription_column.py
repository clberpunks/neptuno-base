"""Add subscription column to users

Revision ID: e5d97a9854d8
Revises: ec8315483c7d
Create Date: 2025-07-06 11:59:39.476646

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e5d97a9854d8'
down_revision: Union[str, None] = 'ec8315483c7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Crear el tipo ENUM primero para PostgreSQL
    bind = op.get_bind()
    if bind.engine.name == 'postgresql':
        subscription_enum = postgresql.ENUM(
            'free', 'pro', 'business', 'enterprise',
            name='subscriptionplan',
            create_type=True
        )
        subscription_enum.create(bind)
    
    # Añadir columna usando el tipo correcto según el motor
    if bind.engine.name == 'postgresql':
        column_type = postgresql.ENUM(
            'free', 'pro', 'business', 'enterprise',
            name='subscriptionplan',
            create_type=False
        )
    else:
        column_type = sa.Enum(
            'free', 'pro', 'business', 'enterprise',
            name='subscriptionplan'
        )
    
    op.add_column('users', sa.Column('subscription', column_type, nullable=True))


def downgrade() -> None:
    # Eliminar columna
    op.drop_column('users', 'subscription')
    
    # Eliminar tipo ENUM para PostgreSQL
    bind = op.get_bind()
    if bind.engine.name == 'postgresql':
        subscription_enum = postgresql.ENUM(
            'free', 'pro', 'business', 'enterprise',
            name='subscriptionplan',
            create_type=False
        )
        subscription_enum.drop(bind)