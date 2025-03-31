import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, Share2, Printer, Image, FileText, FileCode } from 'lucide-react';

interface DiagramExportProps {
  diagramName: string;
  diagramType: 'business-model-canvas' | 'lean-canvas';
  onExport: (format: string) => void;
  onShare: (emails: string[]) => void;
  onPrint: () => void;
  onClose: () => void;
}

export const DiagramExport: React.FC<DiagramExportProps> = ({
  diagramName,
  diagramType,
  onExport,
  onShare,
  onPrint,
  onClose
}) => {
  const [shareEmails, setShareEmails] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = () => {
    const emails = shareEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    onShare(emails);
    setIsSharing(false);
    setShareEmails('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Export Diagram</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="print">Print</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Export as Image</h3>
                <p className="text-sm text-muted-foreground">
                  Export your diagram as a high-quality image file
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onExport('png')}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onExport('svg')}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    SVG
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Export as Document</h3>
                <p className="text-sm text-muted-foreground">
                  Export your diagram as a document file
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onExport('pdf')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onExport('json')}
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="share">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Share Diagram</h3>
              <p className="text-sm text-muted-foreground">
                Share your diagram with others via email
              </p>
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Input
                  id="emails"
                  placeholder="Enter email addresses separated by commas"
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleShare} disabled={!shareEmails.trim()}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="print">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Print Diagram</h3>
              <p className="text-sm text-muted-foreground">
                Print your diagram or save it as PDF
              </p>
              <div className="flex justify-end">
                <Button onClick={onPrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 