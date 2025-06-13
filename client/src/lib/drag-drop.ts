export interface DragDropHandlers {
  onDragStart: (e: React.DragEvent, fieldType: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, onAddField: (fieldType: string) => void) => void;
}

export const createDragDropHandlers = (): DragDropHandlers => {
  return {
    onDragStart: (e: React.DragEvent, fieldType: string) => {
      e.dataTransfer.setData("text/plain", fieldType);
      e.dataTransfer.effectAllowed = "copy";
      
      // Add visual feedback
      const target = e.target as HTMLElement;
      target.classList.add("opacity-50");
    },

    onDragEnd: (e: React.DragEvent) => {
      // Remove visual feedback
      const target = e.target as HTMLElement;
      target.classList.remove("opacity-50");
    },

    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },

    onDragLeave: (e: React.DragEvent) => {
      // Remove drag over styles
      const target = e.target as HTMLElement;
      target.classList.remove("drag-over");
    },

    onDrop: (e: React.DragEvent, onAddField: (fieldType: string) => void) => {
      e.preventDefault();
      
      const fieldType = e.dataTransfer.getData("text/plain");
      if (fieldType) {
        onAddField(fieldType);
      }
      
      // Remove drag over styles
      const target = e.target as HTMLElement;
      target.classList.remove("drag-over");
    },
  };
};
