import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with children', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('rounded-lg', 'border', 'border-slate-200', 'bg-white', 'shadow-lg');
    });

    it('applies custom className', () => {
      render(
        <Card className="custom-card">
          <div>Card content</div>
        </Card>
      );
      
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('renders with title', () => {
      render(
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      );
      
      const header = screen.getByText('Test Title').closest('div');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'pb-6');
    });

    it('renders with custom className', () => {
      render(
        <CardHeader className="custom-header">
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      );
      
      const header = screen.getByText('Test Title').closest('div');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(<CardTitle>Test Title</CardTitle>);
      
      const title = screen.getByText('Test Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('renders with custom className', () => {
      render(<CardTitle className="custom-title">Test Title</CardTitle>);
      
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardContent', () => {
    it('renders with children', () => {
      render(
        <CardContent>
          <p>Card content</p>
        </CardContent>
      );
      
      const content = screen.getByText('Card content').closest('div');
      expect(content).toHaveClass('pt-6');
    });

    it('renders with custom className', () => {
      render(
        <CardContent className="custom-content">
          <p>Card content</p>
        </CardContent>
      );
      
      const content = screen.getByText('Card content').closest('div');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('Complete Card Integration', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is the complete card content.</p>
          </CardContent>
        </Card>
      );
      
      const card = screen.getByText('Complete Card').closest('div');
      expect(card).toBeInTheDocument();
      
      const title = screen.getByText('Complete Card');
      expect(title).toBeInTheDocument();
      
      const content = screen.getByText('This is the complete card content.');
      expect(content).toBeInTheDocument();
    });
  });
});
