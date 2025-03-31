import React, { useState } from 'react';
import { Collaborator, ActivityData } from '../types/diagram';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, Activity, Trash2, UserPlus, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface CollaborationPanelProps {
  collaborators: Collaborator[];
  activities: ActivityData[];
  currentUserId: string;
  isOwner: boolean;
  onInviteCollaborator: (email: string, role: 'editor' | 'viewer') => void;
  onChangeRole: (userId: string, role: 'editor' | 'viewer') => void;
  onRemoveCollaborator: (userId: string) => void;
  onClose: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  collaborators,
  activities,
  currentUserId,
  isOwner,
  onInviteCollaborator,
  onChangeRole,
  onRemoveCollaborator,
  onClose
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteCollaborator(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Collaboration</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs defaultValue="collaborators" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="collaborators">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Invite Collaborators</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value: 'editor' | 'viewer') =>
                      setInviteRole(value)
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <h3 className="font-semibold">Current Collaborators</h3>
            <ScrollArea className="h-[40vh] w-full rounded-md border">
              <div className="p-4 space-y-4">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{collaborator.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {format(new Date(collaborator.joinedAt), 'PP')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isOwner && collaborator.id !== currentUserId && (
                          <>
                            <Select
                              value={collaborator.role}
                              onValueChange={(value: 'editor' | 'viewer') =>
                                onChangeRole(collaborator.id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveCollaborator(collaborator.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {!isOwner && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Shield className="w-4 h-4 mr-1" />
                            {collaborator.role}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ScrollArea className="h-[60vh] w-full rounded-md border">
            <div className="p-4 space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start space-x-2">
                    <Activity className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p>
                        <span className="font-medium">{activity.userName}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(activity.timestamp), 'PPp')}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 