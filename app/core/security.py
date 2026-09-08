from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
import jwt
from pwdlib import PasswordHash

from app.core.config import ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECURITY_KEY

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int, expires_delta: timedelta | None = None) -> str:
    if not SECURITY_KEY:
        raise RuntimeError("SECURITY_KEY is not configured")

    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": now,
    }

    return jwt.encode(
        payload,
        SECURITY_KEY,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> int:
    if not SECURITY_KEY:
        raise RuntimeError("SECURITY_KEY is not configured")

    try:
        payload = jwt.decode(
            token,
            SECURITY_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return int(user_id)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )