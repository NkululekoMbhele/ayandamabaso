# Quick Start Guide - Ayanda Mabaso Website

## Immediate Setup (2 minutes)

### 1. Install Dependencies
```bash
cd ~/github/ayandamabaso
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The site will be available at: **http://localhost:5173**

## What You Can Test Right Now

### Without Backend (UI Only)
- ✅ Browse all pages (Home, Store, Booking, Dashboard)
- ✅ View navigation and responsive layout
- ✅ Open Login/Register modals
- ✅ See product grid layout
- ✅ View cart page
- ✅ Fill out booking form

### With Tredicik Backend Running
Start the backend first:
```bash
cd ~/github/tredicik
make dev-be
```

Then you can:
- ✅ Register new account
- ✅ Login with credentials
- ✅ Browse actual products
- ✅ Add products to cart
- ✅ View order history
- ✅ Complete checkout

## Page Overview

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Homepage with hero and features | No |
| `/store` | Product catalog with filters | No |
| `/store/[id]` | Individual product detail | No |
| `/cart` | Shopping cart | No |
| `/booking` | Consultation booking | No |
| `/dashboard` | Customer dashboard | Yes |

## Key Features per Page

### Home Page
- Hero section with tagline
- Featured services
- Social media links
- Newsletter signup (coming soon)

### Store
- Category filters (All, Ebooks, Physical Books)
- Product grid with images
- Sale badges
- Add to cart buttons

### Product Detail
- Image gallery
- Price display (with sale pricing)
- Quantity selector
- Add to cart
- Full description
- Product attributes

### Shopping Cart
- Item list with images
- Quantity controls
- Remove items
- Promo code input
- Price breakdown
- Checkout button

### Booking
- Package selection (15/30/60 min)
- Date picker
- Contact form
- Success feedback

### Dashboard (Protected)
- Stats cards (orders, spend, bookings)
- Recent orders list
- Profile information
- Account credits

## Default Credentials (if using test data)

If you have test users in the backend:
```
Email: test@example.com
Password: password123
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

### API Connection Issues
Check that:
1. Backend is running on port 8080
2. .env file has correct API_URL
3. Tenant ID 41 exists in backend

### Type Errors
```bash
npm run check
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .svelte-kit node_modules
npm install
npm run dev
```

## Next Actions

1. **Add Products** (via Tredicik admin)
   - Go to admin panel
   - Add products to tenant 41
   - Upload product images
   
2. **Test Full Flow**
   - Register new account
   - Browse products
   - Add to cart
   - Complete checkout
   
3. **Customize Content**
   - Update homepage tagline
   - Add actual business hours
   - Configure social links
   - Add real consultation packages

## Project Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run check        # Type check
npm run format       # Format code
```

## File Locations

**Critical Files:**
- API Config: `/.env`
- Portal SDK: `/src/lib/portal.ts`
- Auth Store: `/src/lib/stores/auth.svelte.ts`
- Cart Store: `/src/lib/stores/cart.svelte.ts`

**Page Files:**
- Layout: `/src/routes/+layout.svelte`
- Home: `/src/routes/+page.svelte`
- Store: `/src/routes/store/+page.svelte`
- Cart: `/src/routes/cart/+page.svelte`
- Dashboard: `/src/routes/dashboard/+page.svelte`

## Getting Help

- Review `IMPLEMENTATION.md` for detailed docs
- Check Portal SDK types in `packages/portal-sdk/src/types/`
- Test API directly at `http://localhost:8080/docs`

---

**Ready to go! Start with `npm run dev`**
