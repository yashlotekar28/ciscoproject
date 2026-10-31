from pydantic import BaseModel, Field
from typing import Optional, List

class CaseBase(BaseModel):
    title: str = Field(..., example="VLAN 30 Connectivity Loss")
    symptom: str = Field(..., example="PC cannot ping default gateway")
    topology_notes: str = Field(..., example="PC1 -> SW1 -> R1")
    device: str = Field(..., example="SW1")
    show_output: str = Field(..., example="show vlan brief...")
    category: str = Field(..., example="VLAN")
    severity: str = Field(..., example="high")
    expected_fault: Optional[str] = None
    osi_layer: Optional[str] = None
    concept: Optional[str] = None
    expected_next_command: Optional[str] = None
    expected_fix: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: str
    status: str
    ai_confidence: Optional[float] = 0.0
    created_at: str

    class Config:
        from_attributes = True