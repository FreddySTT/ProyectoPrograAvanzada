"""
Fixtures de Pytest para pruebas de integración y cliente de pruebas Flask.
Garantiza aislamiento total entre pruebas para evitar polución de estado en memoria.
"""
import copy
import pytest
from app import create_app
from config import TestingConfig
from models.database import PLACES_FALLBACK

_INITIAL_PLACES_SNAPSHOT = copy.deepcopy(PLACES_FALLBACK)

@pytest.fixture(autouse=True)
def reset_database_state():
    """Restaura el estado original de los lugares en memoria antes y después de cada test."""
    PLACES_FALLBACK.clear()
    PLACES_FALLBACK.update(copy.deepcopy(_INITIAL_PLACES_SNAPSHOT))
    yield
    PLACES_FALLBACK.clear()
    PLACES_FALLBACK.update(copy.deepcopy(_INITIAL_PLACES_SNAPSHOT))

@pytest.fixture
def app():
    app = create_app(TestingConfig)
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

