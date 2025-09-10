# UI Components Bundle Optimization Migration Guide

This guide helps you migrate from the old single-import pattern to the new optimized bundle structure.

## Quick Start

### Before (All components loaded)
```typescript
import { Button, Table, Dialog, Select } from '@/components/ui';
```

### After (Optimized)
```typescript
// Core components (always loaded - ~15KB)
import { Button } from '@/components/ui/core';

// Heavy components (loaded on demand)
import { Table } from '@/components/ui/data';
import { Dialog } from '@/components/ui/overlays';
import { Select } from '@/components/ui/forms';
```

## Migration Strategy

### 1. Immediate Migration (Recommended)

Replace your imports with the new modular structure:

```typescript
// OLD - loads everything (~100KB)
import { 
  Button, 
  Input, 
  Card, 
  Table, 
  Dialog, 
  Select 
} from '@/components/ui';

// NEW - optimized loading
import { Button, Input, Card } from '@/components/ui/core';    // ~15KB
import { Table } from '@/components/ui/data';                  // ~18KB when used
import { Dialog } from '@/components/ui/overlays';             // ~20KB when used
import { Select } from '@/components/ui/forms';                // ~25KB when used
```

### 2. Gradual Migration (Backward Compatible)

The old import pattern still works but isn't optimized:

```typescript
// Still works but loads all components
import { Button, Table } from '@/components/ui';
```

## Component Migration Map

### Core Components (Always Loaded)
```typescript
// OLD
import { Button, Input, Label, Card, Badge, Spinner, Skeleton, Separator, Progress, Avatar } from '@/components/ui';

// NEW
import { Button, Input, Label, Card, Badge, Spinner, Skeleton, Separator, Progress, Avatar } from '@/components/ui/core';
```

### Form Components (Grouped Loading)
```typescript
// OLD
import { Checkbox, Textarea, Switch, RadioGroup, Select } from '@/components/ui';

// NEW
import { Checkbox, Textarea, Switch, RadioGroup, Select } from '@/components/ui/forms';
```

### Overlay Components (Grouped Loading)
```typescript
// OLD
import { Dialog, Tooltip, Toast } from '@/components/ui';

// NEW
import { Dialog, Tooltip, Toast } from '@/components/ui/overlays';
```

### Data Display Components (Heavy)
```typescript
// OLD
import { Table, EmptyState } from '@/components/ui';

// NEW
import { Table, EmptyState } from '@/components/ui/data';
```

### Layout Components (Heavy)
```typescript
// OLD
import { Tabs, Drawer, Collapsible } from '@/components/ui';

// NEW
import { Tabs, Drawer, Collapsible } from '@/components/ui/layout';
```

## Lazy Loading Migration

For maximum optimization, use lazy loading for heavy components:

### Table Component
```typescript
// OLD - immediate loading
import { Table } from '@/components/ui';

function MyComponent() {
  return <Table>...</Table>;
}

// NEW - lazy loading
import { Suspense } from 'react';
import { LazyTable } from '@/components/ui/lazy';
import { Spinner } from '@/components/ui/core';

function MyComponent() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazyTable>...</LazyTable>
    </Suspense>
  );
}
```

### Select Component
```typescript
// OLD
import { Select } from '@/components/ui';

// NEW - lazy loading
import { Suspense } from 'react';
import { LazySelect } from '@/components/ui/lazy';
import { Spinner } from '@/components/ui/core';

function MyComponent() {
  return (
    <Suspense fallback={<Spinner />}>
      <LazySelect>...</LazySelect>
    </Suspense>
  );
}
```

## Page-by-Page Migration Examples

### Dashboard Page
```typescript
// OLD - loads everything
import { 
  Card, 
  CardContent, 
  Button, 
  Progress, 
  Badge 
} from '@/components/ui';

// NEW - optimized
import { 
  Card, 
  CardContent, 
  Button, 
  Progress, 
  Badge 
} from '@/components/ui/core'; // Only core components needed
```

### Form Page
```typescript
// OLD - loads everything
import { 
  Button, 
  Input, 
  Label, 
  Select, 
  Checkbox, 
  Switch 
} from '@/components/ui';

// NEW - optimized
import { Button, Input, Label } from '@/components/ui/core';
import { Select, Checkbox, Switch } from '@/components/ui/forms';
```

### Data Table Page
```typescript
// OLD - loads everything
import { 
  Table, 
  Button, 
  Badge, 
  EmptyState 
} from '@/components/ui';

// NEW - optimized
import { Button, Badge } from '@/components/ui/core';
import { Table, EmptyState } from '@/components/ui/data';

// Or with lazy loading
import { Button, Badge, Spinner } from '@/components/ui/core';
import { Suspense } from 'react';
import { LazyTable, LazyEmptyState } from '@/components/ui/lazy';

function TablePage() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Button>Add Item</Button>
        <Badge>Active</Badge>
      </div>
      
      <Suspense fallback={<Spinner />}>
        <LazyTable>
          {/* Table content */}
        </LazyTable>
      </Suspense>
    </div>
  );
}
```

## Bundle Size Impact

### Before Migration
- Initial bundle: ~100KB (all components loaded)
- First render: Slow due to large bundle
- Subsequent renders: Fast (everything cached)

### After Migration
- Initial bundle: ~15KB (core components only)
- First render: Fast due to small bundle
- Component bundles: Loaded on demand (18-25KB each)
- Overall savings: ~85% reduction in initial bundle size

## Performance Testing

### Measure Bundle Size
```bash
# Run bundle analysis
npm run build:analyze

# Check specific import sizes
npm run build
ls -lah .next/static/chunks/
```

### Monitor Loading Performance
```javascript
// Add to your pages for monitoring
import { preloadHeavyComponents } from '@/components/ui/lazy';

function MyPage() {
  useEffect(() => {
    // Preload components when user is likely to need them
    const timer = setTimeout(preloadHeavyComponents, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return <div>...</div>;
}
```

## Common Issues & Solutions

### Issue: Import not found
```
Module not found: Can't resolve '@/components/ui/core'
```
**Solution**: Check if the component is in the correct module. Refer to the component migration map above.

### Issue: Component not rendering
```
TypeError: Button is not a function
```
**Solution**: Make sure you're importing from the correct module and the component exists:
```typescript
// Check if import path is correct
import { Button } from '@/components/ui/core'; // ✅
import { Button } from '@/components/ui/forms'; // ❌ Button is in core
```

### Issue: Bundle still large
**Solution**: Use bundle analyzer to identify remaining large imports:
```bash
npm run build:analyze
```
Look for:
- Wildcard imports (`import * from`)
- Unused heavy components
- Missing lazy loading for large components

### Issue: TypeScript errors
**Solution**: Make sure to import types from the same module:
```typescript
// Correct
import { Button, type ButtonProps } from '@/components/ui/core';

// Incorrect - mixing modules
import { Button } from '@/components/ui/core';
import { type ButtonProps } from '@/components/ui'; 
```

## Automation Scripts

### Find All UI Imports
```bash
# Find all current UI component imports
grep -r "from '@/components/ui'" --include="*.tsx" --include="*.ts" . | grep -v node_modules
```

### Suggest Optimizations
```bash
# Find files that could benefit from optimization
grep -r "import.*from '@/components/ui'" . | grep -E "(Table|Select|Dialog|Tabs|Drawer)" | head -10
```

## Testing Your Migration

### 1. Verify Functionality
```bash
# Ensure your app still works
npm run dev
# Test all pages that use UI components
```

### 2. Check Bundle Size
```bash
# Compare bundle sizes
npm run build:analyze
# Look for reduced initial bundle size
```

### 3. Performance Testing
```bash
# Test loading performance
npm run build
npm run start
# Use browser DevTools to measure loading times
```

## Rollback Plan

If you encounter issues, you can temporarily rollback:

```typescript
// Emergency rollback - use old import pattern
import { Button, Table, Dialog } from '@/components/ui';
```

The old import pattern remains functional while you resolve issues.

## Next Steps

1. **Start with core components**: Migrate high-usage, lightweight components first
2. **Add lazy loading**: Implement lazy loading for heavy components on critical pages
3. **Monitor performance**: Use bundle analyzer to track improvements
4. **Update documentation**: Update your component usage documentation
5. **Team training**: Educate team members on new import patterns

## Questions & Support

For questions about the migration:
1. Check the bundle size estimates in `components/ui/lazy.ts`
2. Review the component categorization in `components/ui/README.md`
3. Test with the provided `test-bundle-optimization.tsx` example
4. Use `npm run build:analyze` to verify optimizations