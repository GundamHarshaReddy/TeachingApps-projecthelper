import React, { useState } from 'react';
import { DiagramVersion } from '../types/diagram';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { History, RotateCcw, Save } from 'lucide-react';
import { format } from 'date-fns';

interface VersionHistoryProps {
  versions: DiagramVersion[];
  currentVersionNumber: number;
  onRevertToVersion: (versionNumber: number) => void;
  onSaveVersion: (description: string) => void;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersionNumber,
  onRevertToVersion,
  onSaveVersion,
  onClose
}) => {
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);

  const handleSaveVersion = () => {
    if (newVersionDescription.trim()) {
      onSaveVersion(newVersionDescription);
      setNewVersionDescription('');
      setShowNewVersionForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Version History</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setShowNewVersionForm(!showNewVersionForm)}
          className="space-x-2"
        >
          <Save size={16} />
          <span>Save New Version</span>
        </Button>
      </div>

      {showNewVersionForm && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Version Description</label>
              <Textarea
                value={newVersionDescription}
                onChange={(e) => setNewVersionDescription(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewVersionForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveVersion}>Save Version</Button>
            </div>
          </div>
        </Card>
      )}

      <ScrollArea className="h-[60vh] w-full rounded-md border">
        <div className="p-4 space-y-4">
          {versions.map((version) => (
            <Card
              key={version.id}
              className={`p-4 ${
                version.versionNumber === currentVersionNumber
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Version {version.versionNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {version.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                    <History size={14} />
                    <span>
                      Created by {version.createdBy} on{' '}
                      {format(new Date(version.createdAt), 'PPp')}
                    </span>
                  </div>
                </div>
                {version.versionNumber !== currentVersionNumber && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRevertToVersion(version.versionNumber)}
                    className="space-x-2"
                  >
                    <RotateCcw size={14} />
                    <span>Revert</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}; 