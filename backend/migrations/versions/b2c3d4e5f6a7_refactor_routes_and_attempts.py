"""refactor routes and attempts — user-owned routes + route_attempts join

Revision ID: b2c3d4e5f6a7
Revises: c3e38f6480eb
Create Date: 2026-06-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'c3e38f6480eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop dependent tables first, then routes (cascade covers any remaining FKs)
    op.execute("DROP TABLE IF EXISTS route_attempts")
    op.execute("DROP TABLE IF EXISTS attempts")
    op.execute("DROP TABLE IF EXISTS routes CASCADE")

    # New user-owned routes table
    op.create_table(
        'routes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('grade', sa.String(), nullable=False),
        sa.Column('wall_angle', sa.String(), nullable=True),
        sa.Column('style_tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('environment', sa.Enum('GYM', 'OUTDOOR', 'OTHER', name='climbingenvironment'), nullable=False, server_default='GYM'),
        sa.Column('hold_type', sa.Enum('CRIMP', 'PINCH', 'SLOPER', 'POCKET', 'JUG', 'SIDEPULL', name='holdtype'), nullable=True),
        sa.Column('style', sa.Enum('BOULDERING', 'SPORT_CLIMBING', 'TOP_ROPE', 'TRADITIONAL_CLIMBING', name='climbingstyle'), nullable=True),
        sa.Column('wall_style', sa.Enum('OVERHANG', 'VERTICAL', 'SLAB', name='wallstyle'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_routes_id', 'routes', ['id'], unique=False)

    # New route_attempts table
    op.create_table(
        'route_attempts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('route_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sent', sa.Boolean(), nullable=True),
        sa.Column('send_type', sa.String(), nullable=True),
        sa.Column('attempts', sa.Integer(), nullable=True),
        sa.Column('route_length', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['route_id'], ['routes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_route_attempts_id', 'route_attempts', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_route_attempts_id', table_name='route_attempts')
    op.drop_table('route_attempts')
    op.drop_index('ix_routes_id', table_name='routes')
    op.drop_table('routes')
    op.execute("DROP TYPE IF EXISTS climbingenvironment")
    op.execute("DROP TYPE IF EXISTS holdtype")
    op.execute("DROP TYPE IF EXISTS climbingstyle")
    op.execute("DROP TYPE IF EXISTS wallstyle")

    # Restore old session-owned routes table
    op.create_table(
        'routes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('grade', sa.String(), nullable=False),
        sa.Column('wall_angle', sa.String(), nullable=True),
        sa.Column('sent', sa.Boolean(), nullable=True),
        sa.Column('send_type', sa.String(), nullable=True),
        sa.Column('attempts', sa.Integer(), nullable=True),
        sa.Column('route_length', sa.Integer(), nullable=True),
        sa.Column('style_tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_routes_id', 'routes', ['id'], unique=False)
