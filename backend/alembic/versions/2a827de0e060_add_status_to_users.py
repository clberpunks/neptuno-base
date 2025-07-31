from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2a827de0e060'
down_revision = 'c0783b41797d'
branch_labels = None
depends_on = None

# Crear el tipo enum personalizado
userstatus_enum = postgresql.ENUM('active', 'suspended', name='userstatus')

def upgrade():
    # Crear el tipo enum primero
    userstatus_enum.create(op.get_bind(), checkfirst=True)
    
    # Agregar la columna usando el enum
    op.add_column('users', sa.Column('status', userstatus_enum, nullable=True, server_default='active'))
    
    # Actualizar los valores nulos a 'active'
    op.execute("UPDATE users SET status = 'active' WHERE status IS NULL")
    
    # Cambiar a NOT NULL
    op.alter_column('users', 'status', nullable=False)

def downgrade():
    # Eliminar la columna
    op.drop_column('users', 'status')
    
    # Eliminar el tipo enum
    userstatus_enum.drop(op.get_bind())