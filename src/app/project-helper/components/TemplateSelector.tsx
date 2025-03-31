import React from 'react';
import { Template } from '../types/diagram';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LayoutTemplate, Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  onClose: () => void;
  diagramType: 'business-model-canvas' | 'lean-canvas';
}

const templates: Template[] = [
  {
    id: 'standard-bmc',
    name: 'Standard Business Model Canvas',
    description: 'The classic 9-block business model canvas layout',
    category: 'business-model-canvas',
    thumbnail: '/templates/standard-bmc.png',
    sections: [
      {
        id: 'customer-segments',
        label: 'Customer Segments',
        description: 'Who are your customers?',
        color: '#FF6B6B',
        icon: 'users',
        width: 200,
        height: 150,
        position: { x: 0, y: 0 }
      },
      // Add other sections...
    ]
  },
  {
    id: 'standard-lean',
    name: 'Standard Lean Canvas',
    description: 'The classic lean canvas layout',
    category: 'lean-canvas',
    thumbnail: '/templates/standard-lean.png',
    sections: [
      {
        id: 'problem',
        label: 'Problem',
        description: 'What problem are you solving?',
        color: '#4ECDC4',
        icon: 'alert-circle',
        width: 200,
        height: 150,
        position: { x: 0, y: 0 }
      },
      // Add other sections...
    ]
  }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onClose,
  diagramType
}) => {
  const filteredTemplates = templates.filter(t => t.category === diagramType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Select Template</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => onSelectTemplate(template.id)}
                >
                  <div className="aspect-video relative mb-4 rounded-md overflow-hidden bg-muted">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="object-cover w-full h-full"
                    />
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-primary" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="custom">
          <div className="flex flex-col items-center justify-center h-[60vh] border rounded-md">
            <LayoutTemplate className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No custom templates yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};