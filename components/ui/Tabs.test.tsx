import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs', () => {
  const BasicTabs = () => (
    <Tabs defaultValue="tab1" data-testid="tabs">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  );

  it('should render tabs with default active tab', () => {
    render(<BasicTabs />);
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('should switch tabs when tab trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);
    
    const tab2Trigger = screen.getByText('Tab 2');
    await user.click(tab2Trigger);
    
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('should apply custom className to tabs root', () => {
    render(
      <Tabs className="custom-tabs-class" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    
    const tabs = screen.getByTestId('tabs');
    expect(tabs).toHaveClass('custom-tabs-class');
  });

  it('should apply custom className to tabs list', () => {
    render(
      <Tabs>
        <TabsList className="custom-list-class" data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    
    const tabsList = screen.getByTestId('tabs-list');
    expect(tabsList).toHaveClass('custom-list-class');
  });

  it('should apply custom className to tab trigger', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger-class">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    
    const trigger = screen.getByText('Tab 1');
    expect(trigger).toHaveClass('custom-trigger-class');
  });

  it('should apply custom className to tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content-class">
          Content
        </TabsContent>
      </Tabs>
    );
    
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-content-class');
  });

  it('should handle controlled tabs', async () => {
    const user = userEvent.setup();
    const ControlledTabs = () => {
      const [activeTab, setActiveTab] = React.useState('tab1');
      
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
    };
    
    render(<ControlledTabs />);
    
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    
    await user.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<BasicTabs />);
    
    const firstTab = screen.getByText('Tab 1');
    await user.tab();
    
    expect(firstTab).toHaveFocus();
    
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Tab 2')).toHaveFocus();
  });

  it('should disable tab trigger when disabled', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1" disabled>
            Disabled Tab
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );
    
    const trigger = screen.getByText('Disabled Tab');
    expect(trigger).toHaveAttribute('data-disabled');
  });

  it('should forward refs correctly', () => {
    const tabsRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    
    render(
      <Tabs ref={tabsRef} defaultValue="tab1">
        <TabsList ref={listRef}>
          <TabsTrigger ref={triggerRef} value="tab1">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent ref={contentRef} value="tab1">
          Content
        </TabsContent>
      </Tabs>
    );
    
    expect(tabsRef.current).toBeInstanceOf(HTMLDivElement);
    expect(listRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have proper accessibility attributes', () => {
    render(<BasicTabs />);
    
    const tabsList = screen.getByRole('tablist');
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const content1 = screen.getByRole('tabpanel');
    
    expect(tabsList).toBeInTheDocument();
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(content1).toBeInTheDocument();
  });
});