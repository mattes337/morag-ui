# Milestone 4C: Admin & Settings Interface

## Objective
Build comprehensive administration and settings interfaces for system configuration and user management.

## Context
- **Parent**: 3A, 3B, 3C (Core features)
- **Parallel to**: 4A (Realms), 4B (Analytics)
- **Focus**: System administration and configuration

## Scope
- User administration panel
- System settings configuration
- API key management
- Integration settings
- Security settings
- Notification preferences
- Audit logs viewer
- System health monitoring

## Visual Components
```
/app/(dashboard)/admin/
  ├── page.tsx               # Admin dashboard
  ├── users/page.tsx         # User management
  ├── settings/page.tsx      # System settings
  ├── api-keys/page.tsx      # API management
  ├── integrations/page.tsx  # Third-party integrations
  ├── security/page.tsx      # Security settings
  ├── logs/page.tsx          # Audit logs
  └── health/page.tsx        # System monitoring

/components/admin/
  ├── UserTable.tsx          # User list with actions
  ├── UserForm.tsx           # Create/edit user
  ├── RoleManager.tsx        # Role permissions
  ├── ApiKeyCard.tsx         # API key display
  ├── IntegrationCard.tsx    # Integration settings
  ├── SettingsForm.tsx       # Configuration forms
  ├── AuditLog.tsx           # Log viewer
  ├── SystemStatus.tsx       # Health indicators
  └── BackupRestore.tsx      # Data management

/stories/admin/
  ├── UserTable.stories.tsx  # Table states
  ├── UserForm.stories.tsx   # Form validation
  ├── RoleManager.stories.tsx # Permission grids
  ├── ApiKeyCard.stories.tsx # Key states
  ├── IntegrationCard.stories.tsx # Integration types
  ├── SettingsForm.stories.tsx # Form variations
  ├── AuditLog.stories.tsx   # Log displays
  ├── SystemStatus.stories.tsx # Status indicators
  └── BackupRestore.stories.tsx # Backup flows
```

## Settings Categories
```typescript
interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  processing: {
    defaultPipeline: string[];
    maxFileSize: number; // MB
    allowedFormats: string[];
    concurrentJobs: number;
    timeout: number; // seconds
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionTimeout: number; // minutes
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  integrations: {
    openai: { apiKey: string; model: string };
    google: { apiKey: string; model: string };
    qdrant: { host: string; port: number };
    neo4j: { uri: string; credentials: any };
  };
}
```

## Admin Features
- **User Management**: CRUD operations, role assignment
- **Bulk Operations**: Import/export users, bulk actions
- **API Keys**: Generate, revoke, set permissions
- **Activity Monitoring**: Real-time user activity
- **System Logs**: Searchable audit trail
- **Health Checks**: Service status indicators
- **Backup/Restore**: Data export and import
- **Email Templates**: Customize notifications

## User Management
- **User Search**: Filter by name, email, role
- **Quick Actions**: Enable/disable, reset password
- **Role Assignment**: Drag-drop role management
- **Activity History**: User action timeline
- **Bulk Import**: CSV user upload
- **Invitation System**: Email invitations

## Success Criteria
- [ ] Admin can manage all users
- [ ] Settings changes preview before save
- [ ] API keys show/hide securely
- [ ] Integration tests show connection status
- [ ] Audit logs are searchable and filterable
- [ ] System health shows real-time status
- [ ] Backup generates downloadable archive
- [ ] Storybook shows all admin workflows
- [ ] Stories demonstrate permission management

## Dependencies
- 2A: Authentication (for admin roles)
- 2B: Dashboard layout (for navigation)
- 2C: UI components (for forms)

## Deliverables
1. Complete admin dashboard
2. User management system
3. Settings configuration interface
4. API key management
5. System monitoring dashboard
6. Admin component stories in Storybook