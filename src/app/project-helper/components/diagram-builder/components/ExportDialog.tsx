import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ 
  isOpen, 
  onClose, 
  onExport 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Diagram</DialogTitle>
          <DialogDescription>
            Choose a format to export your diagram.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={() => {
                onClose();
                onExport('png');
              }}
              className="flex justify-between items-center"
            >
              <span>PNG Image</span>
              <span className="text-xs text-gray-300">High quality bitmap image</span>
            </Button>
            
            <Button 
              onClick={() => {
                onClose();
                onExport('svg');
              }}
              variant="outline"
              className="flex justify-between items-center"
            >
              <span>SVG Vector Image</span>
              <span className="text-xs text-gray-500">Scalable vector format</span>
            </Button>
            
            <Button 
              onClick={() => {
                onClose();
                onExport('json');
              }}
              variant="outline"
              className="flex justify-between items-center"
            >
              <span>JSON Data</span>
              <span className="text-xs text-gray-500">Diagram data for importing later</span>
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 