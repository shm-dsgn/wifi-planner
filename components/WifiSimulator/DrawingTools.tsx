"use client"

import type React from "react"
import type { WallMaterial } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DrawingToolsProps {
  selectedMaterial: WallMaterial
  onMaterialChange: (material: WallMaterial) => void
  onClear: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

const materialOptions = [
  { value: "drywall", label: "Drywall" },
  { value: "concrete", label: "Concrete" },
  { value: "glass", label: "Glass" },
  { value: "wood", label: "Wood" },
  { value: "metal", label: "Metal" },
  { value: "brick", label: "Brick" },
  { value: "other", label: "Other" },
]

const DrawingTools: React.FC<DrawingToolsProps> = ({
  selectedMaterial,
  onMaterialChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="drawing-tools flex items-center gap-3">
      <div className="space-y-2 w-48">
        <Label htmlFor="wall-material">Wall Material</Label>
        <Select value={selectedMaterial} onValueChange={(value) => onMaterialChange(value as WallMaterial)}>
          <SelectTrigger id="wall-material">
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            {materialOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="history-buttons flex gap-2">
        <Button onClick={onUndo} disabled={!canUndo} variant="secondary" title="Undo">
          Undo
        </Button>

        <Button onClick={onRedo} disabled={!canRedo} variant="secondary" title="Redo">
          Redo
        </Button>
      </div>

      <Button onClick={onClear} variant="destructive">
        Clear Walls
      </Button>
    </div>
  )
}

export default DrawingTools
