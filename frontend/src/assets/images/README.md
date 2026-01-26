# Logo Assets

Place your logo files here:

## Required Files:

1. **logo.png** - Main logo (recommended: 200x200px or larger)
   - Used on: Login page, Register page, Auth screens
   
2. **logo-small.png** - Small/icon version (recommended: 64x64px)
   - Used on: Sidebar header in dashboard

## For Favicon:

Place **favicon.png** in the `/public` folder (not here):
- Location: `frontend/public/favicon.png`
- Recommended size: 32x32px or 48x48px
- This is the browser tab icon

## Supported Formats:
- PNG (recommended for transparency)
- SVG (vector, scalable)
- JPG/JPEG (if no transparency needed)

If using SVG files, update the imports in:
- `src/layouts/AuthLayout.tsx` (change `.png` to `.svg`)
- `src/layouts/DashboardLayout.tsx` (change `.png` to `.svg`)
