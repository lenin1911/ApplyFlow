from pwdlib import PasswordHash
from fastapi import HTTPException,status
import jwt
from app.core.config import SECURITY_KEY,ALGORITHM
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)

def create_access_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id)
    }

    token = jwt.encode(
        payload,
        SECURITY_KEY,
        algorithm=ALGORITHM
    )

    return token

def decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token,
            SECURITY_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        return int(user_id)

    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )