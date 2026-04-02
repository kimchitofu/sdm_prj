"""
FundBridge Test Data Generator
Run: python seed_data.py
Generates ~100 records per entity for live demo.
All users have password: password123
"""
import random
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.category import Category
from app.models.fundraising import FundraisingActivity, FSAImage
from app.models.donation import Donation
from app.models.favourite import Favourite
from app.models.report import Report

# --- Data Pools ---

FIRST_NAMES = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah',
    'Ivan', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nancy', 'Oscar', 'Patricia',
    'Quentin', 'Rachel', 'Samuel', 'Tina', 'Ulysses', 'Victoria', 'William',
    'Xena', 'Yusuf', 'Zara', 'Andrew', 'Brenda', 'Carlos', 'Deborah',
    'Ethan', 'Felicity', 'Gabriel', 'Holly', 'Isaac', 'Jasmine', 'Kyle',
    'Lily', 'Marcus', 'Natalie', 'Owen', 'Penelope', 'Ryan', 'Sophia',
    'Thomas', 'Uma', 'Vincent', 'Wendy', 'Xavier', 'Yvonne'
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
    'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
    'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts'
]

CATEGORIES_DATA = [
    ('Medical', 'Help with medical expenses and treatments', 'bi-hospital'),
    ('Education', 'Support educational initiatives and scholarships', 'bi-book'),
    ('Emergency', 'Urgent relief for disasters and emergencies', 'bi-exclamation-triangle'),
    ('Community', 'Community development and improvement projects', 'bi-people'),
    ('Animals', 'Animal welfare and rescue organizations', 'bi-heart'),
    ('Environment', 'Environmental conservation and sustainability', 'bi-tree'),
    ('Sports', 'Support athletes and sports programs', 'bi-trophy'),
    ('Arts & Culture', 'Promote arts, music, and cultural programs', 'bi-palette'),
    ('Technology', 'Fund innovative tech projects and startups', 'bi-laptop'),
    ('Children', 'Programs and support for children in need', 'bi-emoji-smile'),
    ('Veterans', 'Support for veterans and military families', 'bi-shield'),
    ('Housing', 'Help with housing and shelter initiatives', 'bi-house'),
]

FSA_TITLES = {
    'Medical': [
        'Help Sarah Fight Leukemia', 'Surgery Fund for Baby Emma',
        'Cancer Treatment for John', 'Medical Bills After Car Accident',
        'Heart Surgery for Grandmother', 'Dialysis Treatment Support',
        'Prosthetic Limb for Army Vet', 'Rare Disease Treatment Fund',
        'Emergency Medical Airlift', 'Mental Health Treatment Support'
    ],
    'Education': [
        'Scholarship Fund for Rural Students', 'School Supplies for 100 Kids',
        'Build a Library in Africa', 'STEM Program for Girls',
        'College Tuition for First-Gen Student', 'Teacher Training Program',
        'Coding Bootcamp Scholarships', 'Music Education for Youth',
        'Special Needs Education Support', 'Study Abroad Opportunity'
    ],
    'Emergency': [
        'Flood Relief Fund', 'Earthquake Victims Support',
        'Wildfire Recovery Assistance', 'Hurricane Relief Effort',
        'Tornado Damage Repair Fund', 'Emergency Food Distribution',
        'Disaster Shelter Setup', 'Emergency Medical Supplies',
        'Refugee Family Support', 'Crisis Response Team Funding'
    ],
    'Community': [
        'Community Garden Project', 'Youth Center Renovation',
        'Neighborhood Cleanup Initiative', 'Senior Center Activities',
        'Community Food Bank Expansion', 'Local Park Improvement',
        'Street Art Mural Project', 'Community WiFi Installation',
        'Playground Equipment Fund', 'Local Business Recovery'
    ],
    'Animals': [
        'Rescue 50 Shelter Dogs', 'Wildlife Sanctuary Support',
        'Stray Cat Spay/Neuter Program', 'Injured Horse Rehabilitation',
        'Marine Turtle Conservation', 'Bird Sanctuary Expansion',
        'Farm Animal Rescue Mission', 'Exotic Animal Sanctuary',
        'Pet Food Bank for Families', 'Service Dog Training Program'
    ],
    'Environment': [
        'Plant 10,000 Trees', 'Ocean Cleanup Project',
        'Solar Panel Installation Fund', 'Community Composting Program',
        'Save the Coral Reef Initiative', 'Clean Water for Villages',
        'Reforestation After Wildfire', 'Sustainable Farming Project',
        'Electric Vehicle Conversion', 'Zero Waste Community Program'
    ],
    'Sports': [
        'Youth Soccer League Equipment', 'Paralympic Athlete Training',
        'Community Swimming Pool Repair', 'Basketball Court Construction',
        'Marathon for Charity Training', 'Adaptive Sports Program',
        'High School Track Renovation', 'Girls Cricket Team Fund',
        'Boxing Gym for At-Risk Youth', 'Special Olympics Support'
    ],
    'Arts & Culture': [
        'Community Theater Production', 'Art Therapy for Veterans',
        'Music Instruments for Schools', 'Cultural Festival Fund',
        'Public Art Installation', 'Dance Academy Scholarships',
        'Film Documentary Production', 'Poetry Workshop Series',
        'Heritage Preservation Project', 'Street Performance Festival'
    ],
    'Technology': [
        'Laptops for Underprivileged Students', 'Community Makerspace',
        'App for Disability Access', 'Rural Internet Connectivity',
        'Robotics Club Startup', 'AI Research for Healthcare',
        'Open Source Project Fund', 'Tech Training for Seniors',
        'Assistive Technology Development', 'Coding Club for Kids'
    ],
    'Children': [
        'Orphanage Support Fund', 'After-School Meals Program',
        'Children Hospital Play Area', 'Foster Care Support Kit',
        'Summer Camp Scholarships', 'Child Literacy Program',
        'Safe Haven for Children', 'Pediatric Cancer Support',
        'Back to School Drive', 'Mentorship Program for Youth'
    ],
    'Veterans': [
        'Veteran Housing Assistance', 'PTSD Treatment Program',
        'Job Training for Veterans', 'Veteran Family Support',
        'Homeless Veteran Outreach', 'Veteran Recreation Center',
        'Service Dog for Veteran', 'Military Spouse Support',
        'Veteran Small Business Fund', 'Memorial Park Renovation'
    ],
    'Housing': [
        'Homeless Shelter Expansion', 'Affordable Housing Project',
        'Emergency Housing Fund', 'Home Repair for Elderly',
        'Transitional Housing Program', 'Community Land Trust',
        'Habitat Build Project', 'Winter Shelter Operations',
        'Mobile Home Park Improvement', 'Housing First Initiative'
    ],
}

DESCRIPTIONS = [
    "We are raising funds to make a real difference in our community. Every dollar counts and brings us closer to our goal. Your generous contribution will directly impact the lives of those in need. Together, we can create positive change and build a better future for everyone involved.",
    "This campaign was born out of a genuine need to help those who cannot help themselves. The situation is urgent, and we need your support now more than ever. Your donation, no matter how small, will go a long way in providing essential resources and support to those affected.",
    "Join us in this important mission to bring hope and healing. Our team has been working tirelessly to address this critical need, and with your help, we can reach our goal faster. Every contribution brings us one step closer to making a lasting impact.",
    "We believe that together, we can overcome any challenge. This fundraiser represents our collective commitment to making the world a better place. Your support will enable us to provide vital services and resources to those who need them most.",
    "Help us turn compassion into action. This campaign addresses a pressing need in our community, and we cannot do it without your generous support. Join the hundreds of donors who have already contributed to this cause.",
    "Your donation today will create ripple effects of positive change for years to come. We are committed to transparency and will keep all donors updated on the progress and impact of their contributions.",
    "This is more than just a fundraiser - it is a movement of compassionate people coming together for a common cause. Every dollar donated goes directly toward our mission, and we are grateful for your support.",
    "We have seen firsthand the impact that generous donations can make, and we are inspired to keep pushing forward. With your help, we can exceed our goal and create even more positive outcomes.",
]

DONATION_MESSAGES = [
    'Good luck!', 'Stay strong!', 'Happy to help!', 'Wishing you the best!',
    'You got this!', 'Sending love and support!', 'Every little bit helps!',
    'Hope this helps!', 'Keep going!', 'Praying for you!',
    'Such a great cause!', 'Glad to contribute!', 'You deserve this!',
    'Making a difference together!', 'Proud to support this!',
    '', '', '', '', ''  # Some donations without messages
]


def create_users():
    users = []
    used_usernames = set()
    used_emails = set()

    def make_unique_username(first, last, idx):
        base = f"{first.lower()}{last.lower()}"
        username = base
        counter = 1
        while username in used_usernames:
            username = f"{base}{counter}"
            counter += 1
        used_usernames.add(username)
        return username

    def make_unique_email(first, last, idx):
        base = f"{first.lower()}.{last.lower()}@example.com"
        email = base
        counter = 1
        while email in used_emails:
            email = f"{first.lower()}.{last.lower()}{counter}@example.com"
            counter += 1
        used_emails.add(email)
        return email

    # Create admins (3)
    for i in range(3):
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        u = User(
            email=make_unique_email(fn, ln, i),
            username=make_unique_username(fn, ln, i),
            role='admin',
            first_name=fn,
            last_name=ln,
            phone=f'+1-555-{random.randint(1000, 9999)}',
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 180))
        )
        u.set_password('password123')
        db.session.add(u)
        users.append(u)

    # Create fundraisers (30)
    for i in range(30):
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        u = User(
            email=make_unique_email(fn, ln, i),
            username=make_unique_username(fn, ln, i),
            role='fundraiser',
            first_name=fn,
            last_name=ln,
            phone=f'+1-555-{random.randint(1000, 9999)}',
            bio=f"Passionate about making a difference. Fundraiser since {random.randint(2020, 2025)}.",
            created_at=datetime.utcnow() - timedelta(days=random.randint(10, 180))
        )
        u.set_password('password123')
        db.session.add(u)
        users.append(u)

    # Create donees (55)
    for i in range(55):
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        u = User(
            email=make_unique_email(fn, ln, i),
            username=make_unique_username(fn, ln, i),
            role='donee',
            first_name=fn,
            last_name=ln,
            phone=f'+1-555-{random.randint(1000, 9999)}',
            created_at=datetime.utcnow() - timedelta(days=random.randint(5, 180))
        )
        u.set_password('password123')
        db.session.add(u)
        users.append(u)

    # Create platform managers (5)
    for i in range(5):
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        u = User(
            email=make_unique_email(fn, ln, i),
            username=make_unique_username(fn, ln, i),
            role='platform',
            first_name=fn,
            last_name=ln,
            phone=f'+1-555-{random.randint(1000, 9999)}',
            created_at=datetime.utcnow() - timedelta(days=random.randint(60, 180))
        )
        u.set_password('password123')
        db.session.add(u)
        users.append(u)

    db.session.commit()
    return users


def create_categories():
    categories = []
    for name, desc, icon in CATEGORIES_DATA:
        cat = Category(name=name, description=desc, icon=icon)
        db.session.add(cat)
        categories.append(cat)
    db.session.commit()
    return categories


def create_fsas(fundraisers, categories):
    fsas = []
    statuses = ['active'] * 50 + ['completed'] * 25 + ['draft'] * 15 + ['paused'] * 10

    for i in range(100):
        cat = random.choice(categories)
        cat_name = cat.name
        titles = FSA_TITLES.get(cat_name, FSA_TITLES['Community'])
        title = random.choice(titles) + (f" #{i}" if i >= len(titles) else "")

        goal = random.choice([500, 1000, 2000, 5000, 10000, 15000, 20000, 25000, 50000])
        status = statuses[i] if i < len(statuses) else 'active'

        created_days_ago = random.randint(5, 170)
        created_at = datetime.utcnow() - timedelta(days=created_days_ago)
        start_date = created_at + timedelta(days=random.randint(0, 3)) if status != 'draft' else None
        end_date = created_at + timedelta(days=random.randint(30, 120)) if random.random() > 0.3 else None

        if status == 'completed':
            current_amount = goal * random.uniform(1.0, 1.3)
        elif status == 'active':
            current_amount = goal * random.uniform(0.05, 0.95)
        elif status == 'paused':
            current_amount = goal * random.uniform(0.1, 0.6)
        else:
            current_amount = 0

        fsa = FundraisingActivity(
            title=title,
            description=random.choice(DESCRIPTIONS),
            goal_amount=goal,
            current_amount=round(current_amount, 2),
            status=status,
            start_date=start_date,
            end_date=end_date,
            view_count=random.randint(10, 5000),
            shortlist_count=random.randint(0, 200),
            fundraiser_id=random.choice(fundraisers).id,
            category_id=cat.id,
            created_at=created_at,
            updated_at=created_at + timedelta(days=random.randint(0, 10))
        )
        db.session.add(fsa)
        fsas.append(fsa)

    db.session.commit()
    return fsas


def create_donations(donees, fsas):
    donations = []
    for fsa in fsas:
        num_donations = random.randint(3, 20)
        for _ in range(num_donations):
            amount = random.choice([5, 10, 15, 20, 25, 30, 50, 75, 100, 150, 200, 250, 500])
            created_at = fsa.created_at + timedelta(
                days=random.randint(1, max(1, (datetime.utcnow() - fsa.created_at).days))
            )
            d = Donation(
                amount=float(amount),
                message=random.choice(DONATION_MESSAGES),
                is_anonymous=random.random() < 0.15,
                donee_id=random.choice(donees).id,
                fsa_id=fsa.id,
                created_at=created_at
            )
            db.session.add(d)
            donations.append(d)

    db.session.commit()
    return donations


def create_favourites(donees, active_fsas):
    favourites = []
    seen = set()
    for _ in range(250):
        donee = random.choice(donees)
        fsa = random.choice(active_fsas)
        key = (donee.id, fsa.id)
        if key in seen:
            continue
        seen.add(key)
        f = Favourite(
            donee_id=donee.id,
            fsa_id=fsa.id,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
        )
        db.session.add(f)
        favourites.append(f)

    db.session.commit()
    return favourites


def create_reports(platform_users):
    reports = []
    now = datetime.utcnow()

    for i in range(5):
        # Daily reports
        day = now - timedelta(days=i)
        r = Report(
            title=f"Daily Report - {day.strftime('%d %b %Y')}",
            report_type='daily',
            period_start=day.replace(hour=0, minute=0, second=0),
            period_end=day.replace(hour=23, minute=59, second=59),
            total_donations=random.uniform(500, 5000),
            total_fsas_created=random.randint(0, 5),
            total_fsas_completed=random.randint(0, 3),
            total_new_users=random.randint(1, 10),
            generated_by=random.choice(platform_users).id,
            generated_at=day
        )
        r.set_data({
            'donation_count': random.randint(10, 50),
            'avg_donation': random.uniform(20, 100),
            'category_breakdown': [
                {'name': cat_name, 'donations': random.uniform(0, 1000), 'fsa_count': random.randint(0, 3)}
                for cat_name, _, _ in CATEGORIES_DATA
            ]
        })
        db.session.add(r)
        reports.append(r)

    for i in range(5):
        # Weekly reports
        week_start = now - timedelta(weeks=i+1)
        week_end = week_start + timedelta(days=7)
        r = Report(
            title=f"Weekly Report - {week_start.strftime('%d %b')} to {week_end.strftime('%d %b %Y')}",
            report_type='weekly',
            period_start=week_start,
            period_end=week_end,
            total_donations=random.uniform(3000, 25000),
            total_fsas_created=random.randint(5, 20),
            total_fsas_completed=random.randint(2, 10),
            total_new_users=random.randint(5, 30),
            generated_by=random.choice(platform_users).id,
            generated_at=week_end
        )
        r.set_data({
            'donation_count': random.randint(50, 200),
            'avg_donation': random.uniform(30, 120),
            'category_breakdown': [
                {'name': cat_name, 'donations': random.uniform(100, 5000), 'fsa_count': random.randint(0, 5)}
                for cat_name, _, _ in CATEGORIES_DATA
            ]
        })
        db.session.add(r)
        reports.append(r)

    for i in range(5):
        # Monthly reports
        month = now.replace(day=1) - timedelta(days=30 * i)
        r = Report(
            title=f"Monthly Report - {month.strftime('%B %Y')}",
            report_type='monthly',
            period_start=month.replace(day=1),
            period_end=month.replace(day=28),
            total_donations=random.uniform(15000, 100000),
            total_fsas_created=random.randint(15, 40),
            total_fsas_completed=random.randint(5, 20),
            total_new_users=random.randint(20, 80),
            generated_by=random.choice(platform_users).id,
            generated_at=month.replace(day=28)
        )
        r.set_data({
            'donation_count': random.randint(200, 800),
            'avg_donation': random.uniform(40, 150),
            'category_breakdown': [
                {'name': cat_name, 'donations': random.uniform(500, 20000), 'fsa_count': random.randint(1, 10)}
                for cat_name, _, _ in CATEGORIES_DATA
            ]
        })
        db.session.add(r)
        reports.append(r)

    db.session.commit()
    return reports


def seed():
    app = create_app('development')
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        print("Creating users...")
        users = create_users()
        admins = [u for u in users if u.role == 'admin']
        fundraisers = [u for u in users if u.role == 'fundraiser']
        donees = [u for u in users if u.role == 'donee']
        platform_users = [u for u in users if u.role == 'platform']
        print(f"  Created {len(users)} users ({len(admins)} admins, {len(fundraisers)} fundraisers, {len(donees)} donees, {len(platform_users)} platform)")

        print("Creating categories...")
        categories = create_categories()
        print(f"  Created {len(categories)} categories")

        print("Creating fundraising activities...")
        fsas = create_fsas(fundraisers, categories)
        print(f"  Created {len(fsas)} FSAs")

        active_fsas = [f for f in fsas if f.status in ('active', 'completed')]
        print("Creating donations...")
        donations = create_donations(donees, active_fsas)
        print(f"  Created {len(donations)} donations")

        print("Creating favourites...")
        active_only = [f for f in fsas if f.status == 'active']
        favourites = create_favourites(donees, active_only)
        print(f"  Created {len(favourites)} favourites")

        print("Creating reports...")
        reports = create_reports(platform_users)
        print(f"  Created {len(reports)} reports")

        print("\n" + "=" * 50)
        print("SEEDING COMPLETE!")
        print("=" * 50)
        print(f"\nSample Login Credentials (password: password123):")
        print(f"  Admin:      {admins[0].email}")
        print(f"  Fundraiser: {fundraisers[0].email}")
        print(f"  Donee:      {donees[0].email}")
        print(f"  Platform:   {platform_users[0].email}")
        print(f"\nRun the app with: python run.py")


if __name__ == '__main__':
    seed()
