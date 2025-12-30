# VectorNode - Project Structure

## 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx            # Auth layout
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   └── (dashboard)/              # Dashboard route group
│       ├── shipper/               # Shipper dashboard
│       ├── carrier/              # Carrier dashboard
│       └── profile/              # User profile
│
├── components/                    # React components
│   ├── ui/                       # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Alert.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts              # Barrel export
│   └── layout/                    # Layout components
│
├── contexts/                      # React contexts
│   └── AuthContext.tsx            # Authentication context
│
├── lib/                           # Utility libraries
│   ├── api.ts                     # API client (axios)
│   ├── auth.ts                    # Auth helpers
│   └── utils.ts                   # Utility functions
│
└── types/                         # TypeScript types
    └── index.ts                   # Type definitions
```

## 📦 Files Created

### Types (`src/types/index.ts`)
- `UserRole` enum
- `UserStatus` enum
- `User` interface
- `Shipment` interface
- `Bid` interface
- `Carrier` interface

### Lib Files
- **`src/lib/api.ts`**: Axios client with interceptors and API endpoints
- **`src/lib/auth.ts`**: Authentication helper functions (setAuth, getAuth, clearAuth, etc.)
- **`src/lib/utils.ts`**: Utility functions (cn, formatDate, formatCurrency, etc.)

### Contexts
- **`src/contexts/AuthContext.tsx`**: React context for authentication state management

### UI Components (`src/components/ui/`)
- **Button.tsx**: Button component with variants and loading state
- **Input.tsx**: Input field with label and error handling
- **Select.tsx**: Select dropdown with label and error handling
- **Alert.tsx**: Alert component with different types (success, error, warning, info)
- **Card.tsx**: Card container component
- **Badge.tsx**: Badge component for status indicators
- **Modal.tsx**: Modal dialog component
- **Spinner.tsx**: Loading spinner component
- **index.ts**: Barrel export for easy imports

### Auth Pages (`src/app/(auth)/`)
- **login/page.tsx**: Login page with form validation
- **register/page.tsx**: Registration page with role selection
- **layout.tsx**: Auth layout wrapper

## 🔧 Usage

### Importing Components
```typescript
// Individual imports
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Or using barrel export
import { Button, Input, Alert } from '@/components/ui';
```

### Using Auth Context
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### Using API Client
```typescript
import { api } from '@/lib/api';

// Make API calls
const shipments = await api.shipments.list();
const user = await api.auth.getMe();
```

### Using Types
```typescript
import { User, UserRole, Shipment } from '@/types';

const user: User = {
  id: '123',
  email: 'user@example.com',
  role: UserRole.SHIPPER,
  // ...
};
```

## 📝 Next Steps

1. **Install Dependencies**:
   ```bash
   npm install axios clsx tailwind-merge lucide-react
   npm install -D @types/node
   ```

2. **Configure TypeScript** (`tsconfig.json`):
   ```json
   {
     "compilerOptions": {
       "jsx": "preserve",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Configure Next.js** (`next.config.js`):
   - Ensure path aliases are configured
   - Set up environment variables for API URL

4. **Add Tailwind CSS**:
   - Configure `tailwind.config.js` with primary color theme
   - Add primary color classes (primary-50, primary-600, etc.)

5. **Create Dashboard Pages**:
   - Add shipper dashboard pages
   - Add carrier dashboard pages
   - Add profile pages

## ✅ Status

- ✅ Directory structure created
- ✅ Types defined
- ✅ Lib files created (api, auth, utils)
- ✅ Auth context created
- ✅ UI components created
- ✅ Auth pages created (login, register, layout)
- ⏳ Dashboard pages (pending)
- ⏳ Layout components (pending)





