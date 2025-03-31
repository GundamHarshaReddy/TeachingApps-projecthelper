"use client"

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { ChartConfig } from '../types/diagram';

interface DataVisualizationProps {
  onAddChart: (config: ChartConfig) => void;
  onClose: () => void;
}

export function DataVisualization({ onAddChart, onClose }: DataVisualizationProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [title, setTitle] = useState('');
  const [data, setData] = useState<Array<{ label: string; value: number }>>([
    { label: '', value: 0 }
  ]);

  const handleAddDataPoint = () => {
    setData([...data, { label: '', value: 0 }]);
  };

  const handleDataChange = (index: number, field: 'label' | 'value', value: string | number) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: field === 'value' ? Number(value) : value
    };
    setData(newData);
  };

  const handleSubmit = () => {
    if (!title || data.some(d => !d.label || isNaN(d.value))) {
      return;
    }

    onAddChart({
      type: chartType,
      title,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chartType">Chart Type</Label>
        <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'pie') => setChartType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Chart Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chart title"
        />
      </div>

      <div className="space-y-2">
        <Label>Data Points</Label>
        {data.map((point, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={point.label}
                  onChange={(e) => handleDataChange(index, 'label', e.target.value)}
                  placeholder="Enter label"
                />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={point.value}
                  onChange={(e) => handleDataChange(index, 'value', e.target.value)}
                  placeholder="Enter value"
                />
              </div>
            </div>
          </Card>
        ))}
        <Button type="button" variant="outline" onClick={handleAddDataPoint}>
          Add Data Point
        </Button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Add Chart
        </Button>
      </div>
    </div>
  );
} 