# Simple Blog App

A modern React-based blog application with user authentication, post management, and responsive design. Users can create, read, update, and delete blog posts with a clean and intuitive interface.

## 🎨 UI Overview

### Design System
- **Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for lightweight state management
- **Routing**: React Router DOM v6 for navigation
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for fast development and building

### Key UI Features
- ✨ Responsive design (Mobile-first approach)
- 🎭 Clean and minimal interface
- 🔐 Protected routes with authentication
- 📱 Mobile-optimized navigation
- 🚀 Fast loading with optimized components
- 📝 Rich post creation and editing experience


## 🛠 Tech Stack

### Frontend
- **React 18** - UI Library
- **React Router DOM 6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP requests

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **CSS3** - Custom styles and animations
- **Responsive Design** - Mobile-first approach

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (for authentication and posts)

### Installation

```bash
# Clone the repository
git clone git@github.com:anish-gc/blog-application-react.git

# Navigate to project directory
cd blog-application-react

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── api/                 # API configuration and requests
│   └── api.js          # Axios configuration and API calls
├── components/          # Reusable UI components
│   ├── BlogList.jsx    # Blog posts listing component
│   ├── Navbar.jsx      # Navigation component
│   ├── PostForm.jsx    # Create/Edit post form
│   └── ProtectedRoute.jsx # Authentication wrapper
├── pages/              # Page components
│   ├── CreatePostPage.jsx  # Create new post page
│   ├── EditPostPage.jsx    # Edit existing post page
│   ├── HomePage.jsx        # Home page with blog list
│   ├── LoginPage.jsx       # User login page
│   ├── PostDetailPage.jsx  # Individual post view
│   └── RegisterPage.jsx    # User registration page
├── stores/             # Zustand state stores
│   └── authStore.js    # Authentication state management
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles with Tailwind
```

## 🎯 Component Architecture

### Core Components

#### Navbar
- Responsive navigation with mobile menu
- Authentication-based menu items
- User profile and logout functionality

#### BlogList
- Grid/list view of blog posts
- Pagination support
- Post preview with metadata

#### PostForm
- Unified form for creating and editing posts
- Form validation and error handling
- Rich text editing capabilities

#### ProtectedRoute
- Authentication wrapper for protected pages
- Automatic redirection to login
- Permission-based access control

### Page Components
Each page component handles specific user flows:
- **HomePage**: Display all blog posts
- **PostDetailPage**: Show individual post with comments
- **CreatePostPage**: Form to create new posts
- **EditPostPage**: Form to edit existing posts
- **LoginPage**: User authentication
- **RegisterPage**: New user registration

## 📱 Responsive Design

### Tailwind Breakpoints
```css
sm: 640px    /* Tablets */
md: 768px    /* Small laptops */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Large screens */
```

### Mobile-First Components
- Collapsible navigation menu
- Touch-friendly buttons and forms
- Optimized typography scaling
- Flexible grid layouts for posts

## 🔐 Authentication Flow

### Zustand Auth Store
```javascript
// Authentication state management

export const authStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  
  init: () => {
    const token = localStorage.getItem('blog_token')
    const user = localStorage.getItem('blog_user')
    if (token && user) {
      set({ token, user: JSON.parse(user) })
    }
  },
  
  setUser: (user, token) => {
    localStorage.setItem('blog_token', token)
    localStorage.setItem('blog_user', JSON.stringify(user))
    set({ user, token })
  },
  
  logout: () => {
    localStorage.removeItem('blog_token')
    localStorage.removeItem('blog_user')
    set({ user: null, token: null })
  },
  
  setLoading: (isLoading) => set({ isLoading })
}))
```

### Protected Routes
- Automatic redirection for unauthenticated users
- Token-based authentication
- Persistent login state

## 🎨 Styling with Tailwind



### Component Styling Patterns
- Utility-first approach
- Consistent spacing using Tailwind scale
- Responsive modifiers for different screen sizes
- Dark mode support (if implemented)

## 🔄 State Management with Zustand

### Auth Store Features
- User authentication state
- Token management
- Login/logout actions
- Persistent state across sessions

### Benefits of Zustand
- Lightweight (2kb)
- No boilerplate code
- TypeScript support
- DevTools integration

## 📡 API Integration

### Axios Configuration
```javascript
// Base API setup
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### API Endpoints
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `GET /posts/` - Get all posts
- `POST /posts/create/` - Create new post
- `GET /posts/<id>/` - Get specific post
- `PUT /posts/<id>/update/` - Update post
- `DELETE /posts/<id>/delete/` - Delete post

## 🧪 Testing Strategy

### Component Testing
```bash
# Add testing dependencies (recommended)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Test Coverage Areas
- Component rendering
- User interactions
- API integration
- Authentication flows
- Form validation

## 📦 Build & Deployment

### Environment Variables
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_TITLE=Simple Blog App
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```


### Authentication Persistence
- Store tokens in localStorage
- Handle expired token scenarios

## 📋 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 📞 Support

For issues and feature requests, please create an issue in the repository.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Tech Stack**: React + Vite + Tailwind + Zustand + Axios
**Backend Required**: Django REST API with authentication endpoints