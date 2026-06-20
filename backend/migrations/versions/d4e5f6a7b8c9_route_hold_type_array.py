"""route hold_type becomes an array (multiple hold types per route)

Revision ID: d4e5f6a7b8c9
Revises: b2c3d4e5f6a7
Create Date: 2026-06-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE routes ALTER COLUMN hold_type TYPE holdtype[] "
        "USING CASE WHEN hold_type IS NULL THEN NULL ELSE ARRAY[hold_type] END"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE routes ALTER COLUMN hold_type TYPE holdtype "
        "USING hold_type[1]"
    )
