"""drop unused routes.wall_angle and routes.style_tags (superseded by wall_style and style)

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-06-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('routes', 'wall_angle')
    op.drop_column('routes', 'style_tags')


def downgrade() -> None:
    op.add_column('routes', sa.Column('wall_angle', sa.String(), nullable=True))
    op.add_column('routes', sa.Column('style_tags', postgresql.ARRAY(sa.String()), nullable=True))
