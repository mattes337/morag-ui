# Task 3.2: Idea Management System

**Phase**: 3 - Blog Authoring System
**Status**: ❌ Not Started
**Priority**: Medium
**Estimated Effort**: 3-4 days

## Overview

Implement a comprehensive idea management system that allows users to create, review, approve, and manage blog ideas. This includes both manual idea creation and automated idea generation from database content, with a structured approval workflow.

## Current State Analysis

### Existing Implementation
- No idea management functionality
- No approval workflow system
- No idea generation capabilities
- No idea organization or prioritization

### Gap Analysis
- ❌ No idea creation interface
- ❌ No approval workflow
- ❌ No idea prioritization system
- ❌ No idea organization and filtering
- ❌ No automated idea generation

## Requirements

### Functional Requirements
1. **Manual Idea Creation**: Users can manually create blog ideas
2. **Idea Organization**: Categorize, tag, and prioritize ideas
3. **Approval Workflow**: Multi-stage approval process for ideas
4. **Idea Dashboard**: Overview of all ideas with filtering and sorting
5. **Idea Details**: Detailed view with source references and metadata
6. **Bulk Operations**: Approve/reject multiple ideas at once
7. **Search and Filter**: Find ideas by various criteria
8. **Status Tracking**: Track idea progress through workflow stages

### Technical Requirements
1. **API Endpoints**: Complete CRUD operations for ideas
2. **Frontend Components**: Intuitive idea management interface
3. **Workflow Engine**: Configurable approval workflow
4. **Notification System**: Notify users of status changes
5. **Audit Trail**: Track all changes and approvals
6. **Performance**: Handle large numbers of ideas efficiently

## Implementation Plan

### Step 1: API Endpoints
```typescript
// Idea CRUD operations
GET    /api/blog/ideas
POST   /api/blog/ideas
GET    /api/blog/ideas/[id]
PUT    /api/blog/ideas/[id]
DELETE /api/blog/ideas/[id]

// Idea workflow operations
POST   /api/blog/ideas/[id]/approve
POST   /api/blog/ideas/[id]/reject
POST   /api/blog/ideas/[id]/archive
POST   /api/blog/ideas/bulk-approve
POST   /api/blog/ideas/bulk-reject

// Idea filtering and search
GET    /api/blog/ideas/search
GET    /api/blog/ideas/by-status/[status]
GET    /api/blog/ideas/by-priority/[priority]
GET    /api/blog/ideas/by-tag/[tag]
```

### Step 2: Service Layer Implementation
```typescript
export class BlogIdeaService {
  static async createIdea(data: CreateIdeaData): Promise<BlogIdea> {
    const idea = await prisma.blogIdea.create({
      data: {
        ...data,
        status: 'PENDING',
        createdAt: new Date(),
      },
      include: {
        user: true,
        realm: true,
        sourceReferences: true,
      },
    });

    // Send notification to approvers
    await this.notifyApprovers(idea);
    
    return idea;
  }

  static async approveIdea(ideaId: string, approverId: string, notes?: string): Promise<BlogIdea> {
    const idea = await prisma.blogIdea.update({
      where: { id: ideaId },
      data: {
        status: 'APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: {
        user: true,
        approvedBy: true,
      },
    });

    // Create audit log entry
    await this.createAuditLog(ideaId, 'APPROVED', approverId, notes);
    
    // Notify idea creator
    await this.notifyIdeaCreator(idea, 'approved');
    
    return idea;
  }

  static async rejectIdea(ideaId: string, approverId: string, reason: string): Promise<BlogIdea> {
    const idea = await prisma.blogIdea.update({
      where: { id: ideaId },
      data: {
        status: 'REJECTED',
        rejectedReason: reason,
        approvedById: approverId,
        approvedAt: new Date(),
      },
    });

    await this.createAuditLog(ideaId, 'REJECTED', approverId, reason);
    await this.notifyIdeaCreator(idea, 'rejected');
    
    return idea;
  }

  static async getIdeasWithFilters(filters: IdeaFilters): Promise<BlogIdea[]> {
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.userId) where.userId = filters.userId;
    if (filters.realmId) where.realmId = filters.realmId;
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.blogIdea.findMany({
      where,
      include: {
        user: true,
        realm: true,
        approvedBy: true,
        sourceReferences: true,
        _count: { select: { articles: true } },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  static async bulkApprove(ideaIds: string[], approverId: string): Promise<number> {
    const result = await prisma.blogIdea.updateMany({
      where: { 
        id: { in: ideaIds },
        status: 'PENDING',
      },
      data: {
        status: 'APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
      },
    });

    // Create audit logs for all approved ideas
    await Promise.all(
      ideaIds.map(id => this.createAuditLog(id, 'APPROVED', approverId, 'Bulk approval'))
    );

    return result.count;
  }
}
```

### Step 3: Frontend Components

#### IdeaManagementDashboard
```typescript
interface IdeaManagementDashboardProps {
  currentUser: User;
  currentRealm: Realm;
}

const IdeaManagementDashboard: React.FC<IdeaManagementDashboardProps> = ({
  currentUser,
  currentRealm
}) => {
  const [ideas, setIdeas] = useState<BlogIdea[]>([]);
  const [filters, setFilters] = useState<IdeaFilters>({});
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard with filtering, sorting, and bulk operations
  return (
    <div className="space-y-6">
      <IdeaFilters filters={filters} onFiltersChange={setFilters} />
      <IdeaStats ideas={ideas} />
      <IdeaBulkActions 
        selectedIdeas={selectedIdeas} 
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
      />
      <IdeaList 
        ideas={ideas}
        selectedIdeas={selectedIdeas}
        onSelectionChange={setSelectedIdeas}
        onIdeaAction={handleIdeaAction}
      />
    </div>
  );
};
```

#### CreateIdeaDialog
```typescript
interface CreateIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaCreated: (idea: BlogIdea) => void;
  sourceReferences?: SourceReference[];
}

const CreateIdeaDialog: React.FC<CreateIdeaDialogProps> = ({
  isOpen,
  onClose,
  onIdeaCreated,
  sourceReferences = []
}) => {
  const [formData, setFormData] = useState<CreateIdeaForm>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    tags: [],
    targetAudience: '',
    seoKeywords: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const idea = await createIdea({
        ...formData,
        sourceReferences,
      });
      onIdeaCreated(idea);
      onClose();
    } catch (error) {
      console.error('Failed to create idea:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Blog Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter blog idea title..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the blog idea..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                placeholder="e.g., Developers, Marketers..."
              />
            </div>
          </div>

          <TagInput
            label="Tags"
            tags={formData.tags}
            onTagsChange={(tags) => setFormData({...formData, tags})}
            placeholder="Add tags..."
          />

          <TagInput
            label="SEO Keywords"
            tags={formData.seoKeywords}
            onTagsChange={(seoKeywords) => setFormData({...formData, seoKeywords})}
            placeholder="Add SEO keywords..."
          />

          {sourceReferences.length > 0 && (
            <div>
              <Label>Source References</Label>
              <div className="space-y-2">
                {sourceReferences.map((ref, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm">{ref.sourceName}</span>
                    <Badge variant="secondary">{ref.sourceType}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Idea
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

#### IdeaApprovalInterface
```typescript
interface IdeaApprovalInterfaceProps {
  idea: BlogIdea;
  onApprove: (ideaId: string, notes?: string) => void;
  onReject: (ideaId: string, reason: string) => void;
  currentUser: User;
}

const IdeaApprovalInterface: React.FC<IdeaApprovalInterfaceProps> = ({
  idea,
  onApprove,
  onReject,
  currentUser
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const canApprove = currentUser.role === 'ADMIN' || currentUser.role === 'USER';

  if (!canApprove) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-3">Approval Actions</h4>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="notes">Approval Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
            rows={2}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onApprove(idea.id, notes)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Approve
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
          >
            <XIcon className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Idea</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this idea.
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this idea is being rejected..."
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onReject(idea.id, rejectionReason);
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={!rejectionReason.trim()}
            >
              Reject Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

## Workflow Configuration

### Approval Workflow Settings
```typescript
interface ApprovalWorkflowConfig {
  requireApproval: boolean;
  approverRoles: UserRole[];
  autoApproveOwnIdeas: boolean;
  maxPendingIdeas: number;
  notificationSettings: {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    notifyOnApproval: boolean;
    notifyOnRejection: boolean;
  };
}
```

## Notification System

### Notification Types
1. **New Idea Created**: Notify approvers
2. **Idea Approved**: Notify idea creator
3. **Idea Rejected**: Notify idea creator with reason
4. **Bulk Actions**: Summary notifications
5. **Reminder**: Pending approvals reminder

## Testing Strategy

### Unit Tests
- Idea CRUD operations
- Approval workflow logic
- Bulk operations
- Filtering and search

### Integration Tests
- End-to-end idea creation and approval
- Notification delivery
- Audit trail creation

### E2E Tests
- Complete idea management workflow
- User interface interactions
- Approval process

## Acceptance Criteria

- [ ] Users can create ideas manually
- [ ] Approval workflow functions correctly
- [ ] Bulk operations work efficiently
- [ ] Filtering and search provide accurate results
- [ ] Notifications are sent appropriately
- [ ] Audit trail tracks all changes
- [ ] UI is intuitive and responsive
- [ ] Performance is acceptable with large datasets

## Dependencies

- Task 3.1 (Blog Data Models) - Required for data structure
- User authentication system
- Notification system
- Audit logging system

## Success Metrics

- Ideas can be created and managed efficiently
- Approval workflow reduces bottlenecks
- Users find the interface intuitive
- Bulk operations save time for administrators
- Notification system keeps users informed
