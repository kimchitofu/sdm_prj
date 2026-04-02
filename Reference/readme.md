================================================================================
                    FUNDBRIDGE - Online Fundraising System
================================================================================

A web-based fundraising platform (similar to GoFundMe) that connects fund
raisers with donors. Built with Python Flask, SQLite, and Bootstrap 5.

================================================================================
                              HOW TO RUN
================================================================================

1. Open Terminal and navigate to the project folder:

   cd "path/to/Project"

2. Activate the virtual environment:

   source venv/bin/activate        (Mac/Linux)
   venv\Scripts\activate           (Windows)

3. Install dependencies (only needed once):

   pip install -r requirements.txt

4. Generate test data (only needed once, creates ~100 records per entity):

   python seed_data.py

5. Start the server:

   python run.py

6. Open your browser and go to:

   http://localhost:5000

7. Login with any of the generated credentials printed by seed_data.py.
   All users have the password: password123

   Roles available:
   - Admin        (manages user accounts)
   - Fundraiser   (creates and manages fundraising activities)
   - Donee        (searches, donates, and saves campaigns)
   - Platform     (manages categories and generates reports)

================================================================================
                            WHAT WAS BUILT
================================================================================

Tech Stack:
  - Backend:   Python 3 + Flask (object-oriented)
  - Database:  SQLite with Flask-SQLAlchemy ORM
  - Frontend:  HTML/CSS/JS with Bootstrap 5
  - Auth:      Flask-Login (session-based)
  - Charts:    Chart.js (for platform reports)

Architecture: Boundary-Control-Entity (BCE)
  - Entity layer     (app/models/)       — SQLAlchemy ORM models
  - Control layer    (app/controllers/)  — OOP business logic classes
  - Boundary layer   (app/views/)        — Flask blueprint routes

--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------

Project/
├── app/
│   ├── __init__.py                  App factory (wires everything together)
│   ├── config.py                    Dev/Test/Prod configuration classes
│   ├── extensions.py                SQLAlchemy, LoginManager, CSRFProtect
│   │
│   ├── models/                      DATABASE MODELS (6 tables)
│   │   ├── user.py                  User (admin/fundraiser/donee/platform)
│   │   ├── category.py              FSA categories (Medical, Education, etc.)
│   │   ├── fundraising.py           FundraisingActivity + FSAImage
│   │   ├── donation.py              Donation records
│   │   ├── favourite.py             Donee-FSA favourites (unique pairs)
│   │   └── report.py                Generated reports (daily/weekly/monthly)
│   │
│   ├── controllers/                 BUSINESS LOGIC (OOP with inheritance)
│   │   ├── __init__.py              BaseController (abstract base class)
│   │   ├── user_controller.py       Auth, register, suspend, search users
│   │   ├── fsa_controller.py        FSA CRUD, status transitions, analytics
│   │   ├── donation_controller.py   Make donations, history with filters
│   │   ├── favourite_controller.py  Add/remove/toggle favourites
│   │   ├── category_controller.py   Category CRUD + stats
│   │   ├── report_controller.py     Generate reports with aggregate queries
│   │   └── search_controller.py     Unified FSA search with filters + sorting
│   │
│   ├── views/                       FLASK BLUEPRINTS (routes)
│   │   ├── auth.py                  /auth/*    — login, register, logout, profile
│   │   ├── main.py                  /          — home, browse, public FSA detail
│   │   ├── admin.py                 /admin/*   — user management dashboard
│   │   ├── fundraiser.py            /fundraiser/* — FSA CRUD, analytics, history
│   │   ├── donee.py                 /donee/*   — search, donate, favourites
│   │   └── platform.py             /platform/* — categories, reports
│   │
│   ├── templates/                   HTML TEMPLATES (30+ pages)
│   │   ├── base.html                Master layout (navbar, footer, flash msgs)
│   │   ├── components/              Reusable components:
│   │   │   ├── _navbar.html           Role-aware navigation bar
│   │   │   ├── _footer.html           Site footer
│   │   │   ├── _fsa_card.html         Campaign card with progress bar
│   │   │   ├── _pagination.html       Page navigation
│   │   │   ├── _search_filters.html   Search sidebar with filters
│   │   │   └── _flash_messages.html   Alert messages
│   │   ├── auth/                    Login, register, profile pages
│   │   ├── main/                    Home, browse, FSA detail, about pages
│   │   ├── admin/                   Dashboard, user list/create/detail
│   │   ├── fundraiser/              Dashboard, FSA create/edit/detail/list,
│   │   │                            history, analytics
│   │   ├── donee/                   Dashboard, search, FSA detail, donate,
│   │   │                            favourites, donation history
│   │   ├── platform/               Dashboard, category list/form,
│   │   │                            reports, report view
│   │   └── errors/                  403, 404, 500 error pages
│   │
│   ├── static/
│   │   ├── css/style.css            Custom styles (green theme, card effects)
│   │   ├── js/main.js               Flash auto-dismiss, confirm dialogs
│   │   ├── images/                  Placeholder images
│   │   └── uploads/                 User-uploaded FSA images
│   │
│   └── utils/
│       ├── decorators.py            @role_required() access control decorator
│       ├── helpers.py               Image upload, currency/date formatters
│       └── validators.py            Email, password, amount validation
│
├── seed_data.py                     Test data generator
├── run.py                           App entry point
├── requirements.txt                 Python dependencies
├── .gitignore                       Git ignore rules
└── venv/                            Python virtual environment

--------------------------------------------------------------------------------
DATABASE SCHEMA
--------------------------------------------------------------------------------

users
  id, email, username, password_hash, role, first_name, last_name,
  phone, profile_image, bio, is_active, is_suspended, created_at

categories
  id, name, description, icon, is_active, created_at

fundraising_activities
  id, title, description, goal_amount, current_amount, status,
  start_date, end_date, view_count, shortlist_count,
  fundraiser_id (FK -> users), category_id (FK -> categories)

fsa_images
  id, fsa_id (FK -> fundraising_activities), filename, is_primary

donations
  id, amount, message, is_anonymous, donee_id (FK -> users),
  fsa_id (FK -> fundraising_activities), created_at

favourites
  id, donee_id (FK -> users), fsa_id (FK -> fundraising_activities)
  (unique constraint on donee_id + fsa_id)

reports
  id, title, report_type, period_start, period_end, total_donations,
  total_fsas_created, total_fsas_completed, total_new_users,
  report_data (JSON), generated_by (FK -> users)

--------------------------------------------------------------------------------
FEATURES BY ROLE
--------------------------------------------------------------------------------

PUBLIC (no login required):
  - Landing page with featured campaigns
  - Browse all active campaigns with search and filters
  - View individual campaign details
  - About page

ADMIN:
  - Dashboard with user statistics
  - Create, view, edit user accounts
  - Suspend and reactivate users
  - Search and filter users by role

FUND RAISER:
  - Dashboard with stats (active FSAs, total raised, views, donors)
  - Create new fundraising activities with image uploads
  - Edit existing campaigns
  - Change campaign status (draft -> active -> paused/completed)
  - View campaign analytics (views, saves, donors, donations)
  - View completed campaign history filtered by category and date

DONEE:
  - Dashboard with donation stats and saved campaigns
  - Search campaigns with filters (category, amount range, sort order)
  - View campaign details with donate and favourite buttons
  - Make donations with preset amounts ($10, $25, $50, $100)
  - Save campaigns to favourites list
  - View donation history filtered by category and date period

PLATFORM MANAGEMENT:
  - Dashboard with system-wide statistics and charts
  - Manage FSA categories (create, edit, activate/deactivate)
  - Generate reports (daily, weekly, monthly)
  - View reports with Chart.js charts and category breakdowns

--------------------------------------------------------------------------------
TEST DATA (generated by seed_data.py)
--------------------------------------------------------------------------------

  93 users     (3 admin, 30 fundraiser, 55 donee, 5 platform)
  12 categories
  100 fundraising activities (50 active, 25 completed, 15 draft, 10 paused)
  847 donations
  239 favourites
  15 reports   (5 daily, 5 weekly, 5 monthly)

  All users have password: password123

--------------------------------------------------------------------------------
OOP DESIGN (satisfies object-oriented requirement)
--------------------------------------------------------------------------------

  BaseController (abstract)
    ├── UserController        — inherits + overrides search(), adds auth methods
    ├── FSAController         — inherits + overrides create(), adds analytics
    ├── DonationController    — inherits + adds make_donation() with side effects
    ├── FavouriteController   — inherits + adds toggle with counter updates
    ├── CategoryController    — inherits + adds stats aggregation
    └── ReportController      — inherits + adds report generation logic

  SearchController (composition) — composes FSA queries with dynamic filters

  Demonstrates: inheritance, polymorphism, encapsulation, abstraction

================================================================================
