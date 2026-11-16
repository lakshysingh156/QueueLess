import base64
import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)

DEMO_EMAIL = "demo@queueless.local"
SESSION_DURATION = timedelta(days=7)
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().casefold()
        if not EMAIL_PATTERN.fullmatch(value):
            raise ValueError("Enter a valid email address")
        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().casefold()
        if not EMAIL_PATTERN.fullmatch(value):
            raise ValueError("Enter a valid email address")
        return value


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=64,
    )
    salt_text = base64.urlsafe_b64encode(salt).decode("ascii")
    digest_text = base64.urlsafe_b64encode(digest).decode("ascii")
    return f"scrypt${salt_text}${digest_text}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt_text, digest_text = stored_hash.split("$")
        if algorithm != "scrypt":
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_text.encode("ascii"))
        actual = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=SCRYPT_N,
            r=SCRYPT_R,
            p=SCRYPT_P,
            dklen=len(expected),
        )
    except (ValueError, UnicodeEncodeError):
        return False
    return hmac.compare_digest(actual, expected)


def _new_session(user: models.User) -> tuple[models.UserSession, str]:
    token = secrets.token_urlsafe(32)
    session = models.UserSession(
        user_id=user.id,
        token_hash=hashlib.sha256(token.encode("ascii")).hexdigest(),
        expires_at=datetime.now(timezone.utc) + SESSION_DURATION,
    )
    return session, token


def _auth_response(user: models.User, token: str) -> AuthResponse:
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


def _invalid_credentials() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if payload.email == DEMO_EMAIL:
        raise HTTPException(status_code=409, detail="This email is reserved for demo sign-in")

    user = models.User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.flush()
        session, token = _new_session(user)
        db.add(session)
        db.commit()
        db.refresh(user)
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists") from error

    return _auth_response(user, token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user is None or not verify_password(
        payload.password,
        user.hashed_password if user is not None else _DUMMY_PASSWORD_HASH,
    ):
        raise _invalid_credentials()

    session, token = _new_session(user)
    db.add(session)
    db.commit()
    return _auth_response(user, token)


@router.post("/demo", response_model=AuthResponse)
def demo_login(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == DEMO_EMAIL).first()
    if user is None:
        user = models.User(
            name="QueueLess Demo",
            email=DEMO_EMAIL,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            user = db.query(models.User).filter(models.User.email == DEMO_EMAIL).first()
            if user is None:
                raise HTTPException(status_code=503, detail="Demo sign-in is temporarily unavailable")

    session, token = _new_session(user)
    db.add(session)
    db.commit()
    return _auth_response(user, token)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
) -> models.User:
    if credentials is None or credentials.scheme.casefold() != "bearer":
        raise _invalid_credentials()

    token_hash = hashlib.sha256(credentials.credentials.encode("ascii")).hexdigest()
    session = db.query(models.UserSession).filter(
        models.UserSession.token_hash == token_hash
    ).first()
    if session is None:
        raise _invalid_credentials()

    expires_at = session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        db.delete(session)
        db.commit()
        raise _invalid_credentials()

    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    if user is None:
        raise _invalid_credentials()
    return user


@router.get("/me", response_model=UserOut)
def current_user(user: Annotated[models.User, Depends(get_current_user)]):
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
):
    if credentials is None or credentials.scheme.casefold() != "bearer":
        raise _invalid_credentials()

    token_hash = hashlib.sha256(credentials.credentials.encode("ascii")).hexdigest()
    session = db.query(models.UserSession).filter(
        models.UserSession.token_hash == token_hash
    ).first()
    if session is not None:
        db.delete(session)
        db.commit()


_DUMMY_PASSWORD_HASH = hash_password("QueueLess invalid login timing check")
