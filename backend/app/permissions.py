
from fastapi import Depends, HTTPException, status

from app.dependencies import get_current_user


# Check whether the logged-in user has an allowed role
def require_roles(*allowed_roles: str):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )

        return current_user

    return role_checker


# Admin-only permission
require_admin = require_roles("admin")


# Owner-only permission
require_owner = require_roles("owner")


# Seeker-only permission
require_seeker = require_roles("seeker")
