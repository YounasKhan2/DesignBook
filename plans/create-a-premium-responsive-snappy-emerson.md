# DesignBook — Implementation Plan (MVP)

## Context
Building a 15-page premium responsive SaaS web app for "DesignBook" — a private searchable design catalog for Dubai clothing shops and garment factories. The owner saves and searches designs, companies, and dyes with multiple images. No backend; all state is in-memory mock. Strictly a design catalog — not an ERP, inventory system, or production tracker.

---

## Tech Stack (already installed)
- React 18 + Vite + Tailwind CSS v4
- React Router 7 (`createBrowserRouter`)
- shadcn/ui components (`src/app/components/ui/`)
- Lucide React icons
- React Hook Form 7.55.0
- Sonner (toasts)
- Zod (validation)
- `useIsMobile` hook at `src/app/components/ui/use-mobile`
- No `@make-kits` packages present — use shadcn/ui directly

---

## Color Scheme (applied via Tailwind arbitrary values — do NOT modify theme.css)
- **Navy** `#1a3461` — primary brand color (sidebar bg, buttons, accents)
- **Navy Dark** `#122548` — hover states
- **Emerald** `#10b981` — CTA, success, FAB button, badges
- **Soft BG** `#f4f6f9` — app page background
- **White** `#ffffff` — card backgrounds
- **Muted** `#64748b` — secondary text

---

## File Structure

```
src/app/
├── App.tsx                          # RouterProvider + Toaster entry
├── routes.ts                        # createBrowserRouter with all 15 pages
├── types/index.ts                   # Design, Company, Dye TypeScript interfaces
├── data/
│   ├── companies.ts                 # 8 Dubai companies mock data
│   ├── designs.ts                   # 15 design records mock data
│   └── dyes.ts                      # 12 dye records mock data
├── hooks/
│   └── useDesignBookStore.ts        # React context + useState CRUD store
├── components/
│   ├── ui/                          # (existing shadcn — do not modify)
│   ├── layout/
│   │   ├── AppShell.tsx             # Root authenticated layout
│   │   ├── Sidebar.tsx              # Desktop 240px navy sidebar
│   │   ├── BottomNav.tsx            # Mobile bottom tabs + emerald FAB
│   │   └── TopBar.tsx               # Mobile page header (title + back)
│   ├── shared/
│   │   ├── DesignCard.tsx           # Image-based design card
│   │   ├── CompanyCard.tsx          # Company info card
│   │   ├── DyeCard.tsx              # Dye swatch card
│   │   ├── StatCard.tsx             # Dashboard stats card
│   │   ├── SearchBar.tsx            # Global search input
│   │   ├── EmptyState.tsx           # Empty list placeholder
│   │   ├── ImageUpload.tsx          # Drag-drop image upload with preview
│   │   └── ConfirmDialog.tsx        # Delete confirmation dialog
│   └── pages/
│       ├── landing/LandingPage.tsx
│       ├── auth/
│       │   ├── LoginPage.tsx
│       │   ├── SignUpPage.tsx
│       │   └── ForgotPasswordPage.tsx
│       ├── dashboard/DashboardPage.tsx
│       ├── designs/
│       │   ├── DesignsGalleryPage.tsx
│       │   ├── AddDesignPage.tsx
│       │   ├── DesignDetailPage.tsx
│       │   └── EditDesignPage.tsx
│       ├── companies/
│       │   ├── CompaniesPage.tsx
│       │   └── CompanyDetailPage.tsx
│       ├── dyes/
│       │   ├── DyesPage.tsx
│       │   └── DyeDetailPage.tsx
│       ├── search/GlobalSearchPage.tsx
│       └── settings/SettingsPage.tsx
```

---

## Routing Strategy

Two layout trees via `createBrowserRouter`:

```
/              → PublicLayout (no sidebar)
  (index)      → LandingPage
  /login       → LoginPage
  /signup      → SignUpPage
  /forgot      → ForgotPasswordPage

/app           → AppShell (sidebar + bottom nav)
  (index)      → DashboardPage
  /designs     → DesignsGalleryPage
  /designs/new → AddDesignPage
  /designs/:id → DesignDetailPage
  /designs/:id/edit → EditDesignPage
  /companies   → CompaniesPage
  /companies/:id → CompanyDetailPage
  /dyes        → DyesPage
  /dyes/:id    → DyeDetailPage
  /search      → GlobalSearchPage
  /settings    → SettingsPage
```

`App.tsx` exports `RouterProvider` as default + renders `Toaster`.

---

## Layout Architecture

### AppShell
```
<div class="flex h-screen overflow-hidden bg-[#f4f6f9]">
  <Sidebar />        ← hidden on mobile (md:flex, w-60, fixed left)
  <div class="flex-1 flex flex-col md:ml-60 overflow-hidden">
    <TopBar />       ← mobile only (md:hidden)
    <main class="flex-1 overflow-y-auto pb-20 md:pb-0">
      <Outlet />
    </main>
    <BottomNav />    ← mobile only (md:hidden, fixed bottom-0)
  </div>
</div>
```

### Sidebar (desktop)
- `bg-[#1a3461]` navy background, 240px fixed
- Logo + "DesignBook" wordmark at top
- Nav links with Lucide icons: `LayoutDashboard`, `Layers`, `Building2`, `Droplets`, `Search`, `Settings`
- Active state: `bg-white/10 text-white rounded-lg`
- Inactive: `text-white/60 hover:text-white hover:bg-white/5`
- Use `NavLink` from react-router for automatic `isActive`
- Bottom: user avatar + sign-out link

### BottomNav (mobile)
- 5 tabs: Home, Designs, **Add** (center FAB), Search, Settings
- Center FAB: `bg-[#10b981]` circular button, elevated with shadow
- Active: `text-[#1a3461]`, inactive: `text-gray-400`
- `fixed bottom-0 left-0 right-0 z-40 bg-white border-t`

---

## TypeScript Types (`src/app/types/index.ts`)

```ts
Design: { id, code, name, description, category, status, season, 
          companyId, dyeIds[], images[], thumbnailUrl, fabricType, 
          colorways[], quantity, priceAED, createdAt, updatedAt, tags[], notes }

Company: { id, name, nameArabic?, logo?, industry, contactPerson, email, 
           phone, address, emirate, trn?, status, totalDesigns, joinedAt, notes }

Dye: { id, code, name, nameArabic?, hexColor, category, manufacturer, 
       supplierName, batchNumber, stockKg, pricePerKgAED, status, fastness,
       usedInDesignIds[], notes, createdAt }
```

Status enums:
- Design: `Draft | In Review | Approved | In Production | Completed`
- Company: `Active | Inactive | Prospect`
- Dye: `In Stock | Low Stock | Out of Stock | Discontinued`

---

## Mock Data — Dubai Context

**Companies (8 records):** Al Barsha Textiles LLC, Gulf Uniform Solutions, Madinat Fashion House, Desert Rose Couture, Emirates School Wear Co., Bur Dubai Garments Factory, Jumeirah Couture, Al Quoz Workwear Co.

**Designs (15 records):** Mix of Abayas (Eid collections), Hotel uniforms (InterContinental, Marriott), School uniforms, Kaftans, Thobes — with realistic Dubai fashion industry names, UAE pricing in AED, Unsplash fashion photo URLs.

**Dyes (12 records):** Jet Black, Royal Navy, Desert Gold, Emirates Green, Pearl White, Crimson Red, Camel Beige, Charcoal, Rose Gold, Burgundy, Sand, Ivory — with realistic manufacturers (Huntsman Arabia, DyStar Gulf, Clariant MENA), stock levels, and hex colors.

---

## State Management (`useDesignBookStore.ts`)

React Context + `useState` initialized from mock data. Exposes:
- `designs`, `companies`, `dyes` — arrays
- `addDesign`, `updateDesign`, `deleteDesign`
- `addCompany`, `updateCompany`, `deleteCompany`
- `addDye`, `updateDye`, `deleteDye`

IDs for new records: `crypto.randomUUID()`. Provided via `StoreProvider` in `AppShell`.

---

## Page Specifications

### Landing Page
1. **Hero** — navy gradient bg, white headline "Your private design book for clothing shops and factories.", two CTAs (emerald "Start Free" + outlined "Login")
2. **App Preview Mockup** — faux browser chrome card showing dashboard UI
3. **Stats Strip** — "500+ Designs", "50+ Factories", "10,000+ Dye Records"
4. **Features** — 3-column cards: "Organize Designs", "Track Dyes", "Manage Companies"
5. **CTA Banner** — emerald bg, final sign-up push
6. **Footer** — dark navy

### Auth Pages
- Split layout: navy branding panel left (desktop), form right
- shadcn Form + FormField + Input + Button
- Mock submit: 1s delay → toast.success → navigate

### Dashboard
- Welcome message + today's date
- Full-width `SearchBar` (click → /app/search)
- 4 `StatCard` components (Total Designs, Companies, Dyes, Pending Reviews)
- Recent Designs grid (3 cols desktop, 2 mobile)
- Quick Actions: Add Design, Add Company, Add Dye, Search
- Low Stock Alert if any dye has low/out of stock status

### Designs Gallery
- Sticky filter bar: Category Select, Status Select, Company Select, sort toggle
- Responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- `DesignCard` with cover image (aspect-ratio 3:4), design code, name, company, status badge
- Hover overlay: View + Edit buttons
- Empty state when no results match filters

### Add/Edit Design
- Sections: Basic Info, Association (Company + Dye selectors), Fabric & Production, Media Upload, Tags & Notes
- `ImageUpload` component: drag-drop zone + file picker + preview thumbnails + remove button
- Auto-generate design code on Add: `DSN-YYYY-NNN`
- Actions: Cancel + Save Draft + Submit (emerald)

### Design Detail
- Large hero image + thumbnail row (horizontal scroll)
- Info panel: all fields displayed
- Linked Company → clickable card → company detail
- Dye swatches → colored circles → dye detail
- Edit + Delete buttons (Delete opens `ConfirmDialog`)

### Companies / Company Detail
- Top bar with Add Company button
- Filter/search input
- Grid of `CompanyCard` (logo/avatar, name, nameArabic, industry badge, status, design count)
- Detail: full info + linked designs grid
- Inline add/edit via `Dialog` or dedicated route

### Dyes / Dye Detail
- Similar to companies
- `DyeCard`: large color swatch circle, code, name, stock `Progress` bar, status badge, fastness dots
- Detail: full-width color hero band using `hexColor`, all fields, linked designs

### Global Search
- Auto-focused Input on mount
- Real-time filter across designs (name, code, description), companies (name), dyes (name, code)
- Results grouped: Designs (N), Companies (N), Dyes (N)
- Each result row: thumbnail/swatch + title + subtitle + type badge + arrow icon
- Empty state illustration with helpful hints

### Settings
- `Tabs`: Profile / Security / Notifications / About
- Profile: avatar, name, email, company name, language
- Security: change password form, 2FA switch
- Notifications: per-category switches
- About: version info, export data, clear data

---

## Key shadcn/ui Components Per Page

| Page | Components |
|---|---|
| Landing | `Button`, `Badge`, `Card` |
| Auth | `Form`, `FormField`, `Input`, `Button`, `Label`, `Separator` |
| Dashboard | `Card`, `Badge`, `Button`, `Alert`, `ScrollArea` |
| Gallery | `Card`, `Badge`, `Select`, `Button`, `Input`, `Skeleton` |
| Add/Edit Design | `Form`, `Input`, `Textarea`, `Select`, `Button`, `Badge`, `Switch` |
| Design Detail | `Badge`, `Button`, `Card`, `Tabs`, `Dialog` |
| Companies | `Card`, `Badge`, `Button`, `Input`, `Table`, `Avatar`, `Dialog` |
| Dyes | `Card`, `Badge`, `Progress`, `Button`, `Dialog` |
| Search | `Input`, `Badge`, `Card`, `Separator` |
| Settings | `Tabs`, `Form`, `Input`, `Switch`, `Button`, `Avatar` |

---

## Implementation Sequence

1. Types + Mock Data + Store hook
2. App.tsx (RouterProvider) + routes.ts
3. Layout shell: AppShell, Sidebar, BottomNav, TopBar
4. Shared components: StatCard, DesignCard, CompanyCard, DyeCard, SearchBar, EmptyState, ImageUpload, ConfirmDialog
5. Landing + Auth pages
6. Dashboard
7. Designs (Gallery → Add → Detail → Edit)
8. Companies (List → Detail)
9. Dyes (List → Detail)
10. Global Search
11. Settings
12. Polish: transitions, empty states, loading skeletons, mobile UX pass

---

## Verification
- Navigate to `/` → Landing page with hero, mockup, CTA
- Navigate to `/login` → auth form, submit toasts success, redirects to `/app`
- Navigate to `/app` → dashboard with stats, recent designs
- Navigate to `/app/designs` → gallery grid with filter bar
- Navigate to `/app/designs/new` → form, fill + submit, redirects to gallery
- Click a design card → detail page with image gallery
- Click Edit → pre-filled form
- Click Delete → confirm dialog → removes from list
- Resize to mobile → sidebar hidden, bottom nav appears, FAB visible
- Settings tabs all render without errors
