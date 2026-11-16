import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models
from app.database import get_db
from app.routers.auth import router


@pytest.fixture
def auth_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    models.Base.metadata.create_all(bind=engine)
    test_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app = FastAPI()
    app.include_router(router, prefix="/api/auth")
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client, test_session
    models.Base.metadata.drop_all(bind=engine)
    engine.dispose()


def test_signup_signin_profile_and_logout(auth_client):
    client, test_session = auth_client
    response = client.post(
        "/api/auth/signup",
        json={"name": "  Alex Rivers ", "email": "ALEX@example.com", "password": "healthy-care-2026"},
    )

    assert response.status_code == 201
    result = response.json()
    assert result["user"] == {"id": 1, "name": "Alex Rivers", "email": "alex@example.com"}
    assert result["access_token"]
    with test_session() as db:
        user = db.query(models.User).filter_by(email="alex@example.com").one()
        assert user.hashed_password != "healthy-care-2026"
        assert user.hashed_password.startswith("scrypt$")

    token = result["access_token"]
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json() == result["user"]
    assert client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"}).status_code == 204
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_duplicate_signup_and_invalid_password_are_rejected(auth_client):
    client, _ = auth_client
    payload = {"name": "Alex Rivers", "email": "alex@example.com", "password": "healthy-care-2026"}
    assert client.post("/api/auth/signup", json=payload).status_code == 201
    assert client.post("/api/auth/signup", json=payload).status_code == 409
    assert client.post(
        "/api/auth/login",
        json={"email": payload["email"], "password": "not-the-password"},
    ).status_code == 401


def test_demo_signin_creates_a_named_account_without_password(auth_client):
    client, _ = auth_client
    response = client.post("/api/auth/demo")

    assert response.status_code == 200
    result = response.json()
    assert result["user"]["name"] == "QueueLess Demo"
    assert result["user"]["email"] == "demo@queueless.local"
    assert client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {result['access_token']}"},
    ).json() == result["user"]


def test_signup_rejects_demo_account_email(auth_client):
    client, _ = auth_client
    response = client.post(
        "/api/auth/signup",
        json={"name": "Someone", "email": "DEMO@QUEUELESS.LOCAL", "password": "healthy-care-2026"},
    )

    assert response.status_code == 409
