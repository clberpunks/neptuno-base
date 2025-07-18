"""latest

Revision ID: c0783b41797d
Revises: 80e59143ef16
Create Date: 2025-07-19 00:51:59.734598

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c0783b41797d'
down_revision: Union[str, None] = '80e59143ef16'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
