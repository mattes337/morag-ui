# Milestone 4A: Realm Management System

## Objective
Build comprehensive realm management UI for creating, configuring, and switching between isolated workspaces.

## Context
- **Parent**: 3A, 3B, 3C (Core features)
- **Focus**: Multi-tenant workspace management
- **Key Concept**: Complete data isolation between realms

## Scope
- Realm creation wizard
- Realm dashboard with metrics
- Realm settings and configuration
- User invitation and permissions
- Realm switching interface
- Billing and usage tracking
- Realm deletion workflow
- Import/export capabilities

## Visual Components
```
/app/(dashboard)/realms/
  ├── page.tsx               # Realm list/grid
  ├── create/page.tsx        # Creation wizard
  ├── [realmId]/
  │   ├── page.tsx           # Realm dashboard
  │   ├── settings/page.tsx  # Configuration
  │   ├── users/page.tsx     # User management
  │   ├── billing/page.tsx   # Usage & billing
  │   └── export/page.tsx    # Data export

/components/realms/
  ├── RealmCard.tsx          # Realm preview card
  ├── RealmWizard.tsx        # Step-by-step creation
  ├── RealmDashboard.tsx     # Overview with stats
  ├── RealmSettings.tsx      # Configuration forms
  ├── UserInvite.tsx         # Invitation modal
  ├── PermissionMatrix.tsx   # Role permissions
  ├── UsageChart.tsx         # Analytics charts
  └── RealmSelector.tsx      # Quick switcher

/stories/realms/
  ├── RealmCard.stories.tsx  # Card variations
  ├── RealmWizard.stories.tsx # Wizard steps
  ├── RealmDashboard.stories.tsx # Dashboard states
  ├── RealmSettings.stories.tsx # Settings forms
  ├── UserInvite.stories.tsx # Invitation flows
  ├── PermissionMatrix.stories.tsx # Permission grids
  ├── UsageChart.stories.tsx # Chart variations
  └── RealmSelector.stories.tsx # Selector states
```

## Realm Configuration
```typescript
interface Realm {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created: Date;
  owner: string;
  settings: {
    autoProcess: boolean;
    defaultPipeline: string[];
    vectorDatabase: 'qdrant' | 'pinecone' | 'weaviate';
    llmProvider: 'openai' | 'google' | 'anthropic';
    maxDocuments: number;
    maxUsers: number;
  };
  metrics: {
    documents: number;
    users: number;
    storage: number; // MB
    queries: number;
  };
}
```

## Creation Wizard Steps
1. **Basic Info**: Name, description, icon
2. **Configuration**: Processing settings, integrations
3. **Team Setup**: Invite initial users
4. **Review**: Confirm and create

## Realm Features
- **Quick Switch**: Keyboard shortcut (Cmd+R)
- **Favorites**: Star frequently used realms
- **Templates**: Pre-configured realm types
- **Duplication**: Clone existing realm settings
- **Archiving**: Soft delete with restoration
- **Transfer**: Change ownership
- **Export**: Download all realm data

## Success Criteria
- [ ] Realm creation wizard guides through setup
- [ ] Realm switcher updates context globally
- [ ] Dashboard shows real-time metrics
- [ ] User permissions are clearly displayed
- [ ] Settings changes show preview
- [ ] Billing information is transparent
- [ ] Export generates downloadable file
- [ ] Storybook shows wizard flow
- [ ] Stories demonstrate permission matrix

## Dependencies
- 3A: Document management (for realm context)
- 2B: Dashboard layout (for navigation)
- 2C: UI components (for forms)

## Deliverables
1. Realm management dashboard
2. Creation wizard flow
3. User permission system
4. Realm switching mechanism
5. Usage analytics display
6. Comprehensive realm management stories