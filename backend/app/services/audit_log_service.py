from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int | None,
    user_role: str | None,
    action: str,
    entity_type: str,
    entity_id: int | None,
    description: str,
    details: dict | None = None
):
    audit_log = AuditLog(
        user_id=user_id,
        user_role=user_role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        details=details
    )

    db.add(audit_log)
    db.flush()

    return audit_log