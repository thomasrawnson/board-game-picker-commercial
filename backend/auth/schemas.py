from pydantic import (
    BaseModel,
    EmailStr,
    Field,
)


class RegisterRequest(BaseModel):
    email: EmailStr

    display_name: str = Field(
        min_length=1,
        max_length=100,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str | None
    bgg_username: str | None
    email_verified: bool


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class EmailRequest(BaseModel):
    email: EmailStr


class TokenRequest(BaseModel):
    token: str = Field(
        min_length=1,
        max_length=512,
    )

class ResetPasswordRequest(
    TokenRequest
):
    password: str = Field(
        min_length=8,
        max_length=128,
    )

class MessageResponse(BaseModel):
    message: str

