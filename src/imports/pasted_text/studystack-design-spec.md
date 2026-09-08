# StudyStack — Figma Design Specification

## 1. Brand Identity

**Website Name:** StudyStack

**Tagline:**
**Your Stack. Your Track.**

**Purpose:**
StudyStack is an academic resource-sharing platform exclusively for IIT Roorkee students. Students can discover, upload, download, and save academic resources such as notes, PYQs, assignments, and lab files.

### Brand Personality

* Modern
* Student-friendly
* Clean
* Academic
* Trustworthy
* Community-driven
* Simple and easy to use

---

# 2. Color Palette

Use a **dark navy + bright blue + cyan** theme.

### Primary Colors

**Sidebar / Main Dark Background**

* Deep Navy
* HEX: `#061B49`

**Primary Blue**

* HEX: `#146EF5`

**Accent Cyan**

* HEX: `#55C7FF`

**White**

* HEX: `#FFFFFF`

### Light UI Colors

**Main Content Background**

* HEX: `#F5F8FC`

**Card Background**

* HEX: `#FFFFFF`

**Primary Text**

* HEX: `#0F172A`

**Secondary Text**

* HEX: `#64748B`

**Border**

* HEX: `#E2E8F0`

### Usage

* Sidebar: `#061B49`
* Logo/brand area: `#061B49`
* Primary buttons: `#146EF5`
* Hover/active accents: `#55C7FF`
* Main content: `#F5F8FC`
* Cards: `#FFFFFF`
* Important text: `#0F172A`
* Secondary information: `#64748B`

Do NOT make the entire website dark. Use the dark navy primarily for the sidebar, navigation, hero sections, and important brand areas. Keep the main content light and clean.

---

# 3. Logo

Use the StudyStack logo with:

* Stacked books
* Graduation cap
* Modern blue/white design
* Deep navy background

Display:

**StudyStack**

**Your Stack. Your Track.**

The logo should appear at the top of the sidebar and prominently on authentication pages.

---

# 4. Typography

Use a modern, clean sans-serif font.

Preferred:
**Inter**

Alternative:
**Poppins**

### Typography hierarchy

Page headings:

* Bold
* 28–36px

Section headings:

* Semibold
* 20–24px

Card titles:

* Semibold
* 16–18px

Body:

* 14–16px

Small metadata:

* 12–14px

Keep typography clean and highly readable.

---

# 5. Overall Layout

Use a desktop layout with:

### Left Sidebar

Width: approximately **240–260px**

Background:
`#061B49`

Contains:

* StudyStack logo
* Home
* Courses
* My Pins
* Upload
* Profile
* Logout

Active navigation item should have a subtle blue/cyan highlight.

### Main Content

Background:
`#F5F8FC`

Use generous spacing and clean cards.

Desktop:

* Sidebar + main content

Tablet:

* Smaller sidebar

Mobile:

* Replace sidebar with a hamburger menu or bottom navigation.

---

# 6. Authentication

Create the following screens:

### Login

Logo

**Welcome Back!**

Subtitle:
**Continue your learning journey with StudyStack.**

Fields:

* IITR Email
* Password

Buttons:

* Login

Links:

* Forgot Password?
* Create Account

Only allow IIT Roorkee student email addresses.

---

### Sign Up

Fields:

* Name
* IITR Email
* Password
* Confirm Password

Button:
**Create Account**

Then take the user to OTP verification.

---

### OTP Verification

Title:
**Verify Your IITR Email**

Text:
**Enter the OTP sent to your IIT Roorkee email.**

Six-digit OTP input.

Buttons:

* Verify
* Resend OTP

---

### Forgot Password

Title:
**Forgot your password?**

Enter IITR email.

Button:
**Send OTP**

---

### Reset Password

Fields:

* New Password
* Confirm Password

Button:
**Reset Password**

---

# 7. Home Dashboard

After login, show:

### Header

**Good morning, [Name] 👋**

Subtitle:
**Ready to find something useful?**

Large search bar:

**Search courses, notes, PYQs, assignments...**

---

### Quick Access

Create four cards:

📚 **Notes**

📝 **PYQs**

📄 **Assignments**

🧪 **Labs**

Each card should be clickable.

---

### Popular Courses

Display course cards.

Each card:

* Course code
* Course name
* Department
* Resource count

Example:

**CSN-XXX**

Data Structures and Algorithms

**24 Resources**

---

### Recently Added

Show resource cards with:

* Resource title
* Course
* Type
* Uploaded by
* Date
* Download button
* Pin button

---

# 8. Courses Page

Title:

**Explore Courses**

Search bar:

**Search courses...**

Filters:

* Department
* Semester
* Course Type

Sort:

* Most Popular
* Recently Added
* A–Z

### Course Card

Each card contains:

**CSN-XXX**

**Course Name**

Department

Semester

**32 Resources**

Button:

**View Resources**

---

# 9. Course Detail Page

At the top:

**Course Code**

**Course Name**

Description

Resource count

Then show four large category cards:

### 📚 Notes

Lecture notes, study material and summaries.

### 📝 PYQs

Previous year question papers.

### 📄 Assignments

Assignments and problem sets.

### 🧪 Labs

Lab sheets, files and useful lab resources.

---

# 10. Resource Listing

When the user clicks a category, show resource cards.

Each resource card contains:

**Resource Name**

Course name/code

Resource type

Uploaded by

Upload date

File type

File size

Actions:

**Preview**

**Download**

**Pin**

Pinned resources should show a filled/active pin icon.

---

# 11. Search

Search should work across:

* Courses
* Notes
* PYQs
* Assignments
* Labs
* Other resources

Search results page should have:

**Search Results**

Search bar

Filters:

* Course
* Semester
* Department
* Resource type

Each result should use a clean resource card.

---

# 12. Upload Page

Title:

**Share a Resource**

Subtitle:

**Help your fellow IITR students learn better.**

Create a drag-and-drop upload box:

**Drag & drop your file here**

or

**Browse Files**

Fields:

### Course

Dropdown

### Resource Type

Dropdown:

* Notes
* PYQ
* Assignment
* Lab
* Other

### Resource Title

Text input

### Description

Optional text area

### Tags

Optional

Button:

**Upload Resource**

After successful upload:

**Resource uploaded successfully! 🎉**

---

# 13. My Pins

Title:

**Your Stack**

Subtitle:

**Resources you've saved for later.**

Show pinned resources.

Features:

* Search
* Filter by course
* Filter by type
* Download
* Remove Pin

Empty state:

**Your stack is empty.**

**Pin useful resources and they'll appear here.**

Button:

**Explore Courses**

---

# 14. Profile

Title:

**My Profile**

Show:

Profile avatar

**Student Name**

**IITR Email**

Stats:

**Uploads**

**Pinned**

**Resources Downloaded**

Sections:

### My Uploads

List of uploaded resources.

### My Pins

Saved resources.

### Account Settings

* Change password
* Edit profile
* Logout

---

# 15. Navigation

Sidebar:

### StudyStack

Home

Courses

My Pins

Upload

Profile

---

Logout

Use icons alongside each navigation item.

The currently selected page should have a clear active state.

Example:

Home
→ blue/cyan highlighted background

---

# 16. Buttons

### Primary Button

Background:
`#146EF5`

Text:
White

Rounded corners.

Examples:

**Login**

**Upload Resource**

**Download**

**View Resources**

### Secondary Button

White/light background with blue border or text.

### Hover

Use subtle brightness/blue change.

Avoid excessive animations.

---

# 17. Cards

Use:

* White background
* Rounded corners: approximately 12–16px
* Subtle shadow
* Thin light border
* Comfortable padding

Cards should feel modern but not overly decorative.

---

# 18. Icons

Use simple modern line icons.

Suggested icon style:

* Home
* Book/Open book
* Bookmark
* Upload
* User
* Search
* Download
* File
* Flask
* Clipboard
* Graduation cap
* Settings
* Log out

Keep icon style consistent throughout the application.

---

# 19. Empty States

Create empty states for:

### No Search Results

**No resources found**

Try searching for another course, resource, or keyword.

---

### No Pins

**Your stack is empty**

Pin resources you want to access later.

---

### No Resources

**Nothing here yet**

Be the first to share a resource with your classmates!

---

### No Uploads

**You haven't uploaded anything yet.**

Button:

**Upload a Resource**

---

# 20. Notifications / Feedback

Use small toast notifications.

Examples:

**Resource pinned!**

**Resource unpinned.**

**Download started.**

**Resource uploaded successfully!**

**OTP sent successfully.**

**Password changed successfully.**

Error example:

**Something went wrong. Please try again.**

---

# 21. Responsive Design

### Desktop

Sidebar permanently visible.

Main content centered with a maximum comfortable width.

### Tablet

Sidebar can become narrower.

Cards can switch from 3–4 columns to 2 columns.

### Mobile

Use:

* Hamburger menu or bottom navigation
* Full-width search
* Single-column cards
* Large touch-friendly buttons
* Responsive upload area

Make sure no content gets cut off horizontally.

---

# 22. Important User Flow

The primary user journey should be:

**Login**

↓

**Home**

↓

**Search / Courses**

↓

**Select Course**

↓

**Select Notes / PYQs / Assignments / Labs**

↓

**Open Resource**

↓

**Preview / Download / Pin**

Another major flow:

**Home**

↓

**Upload**

↓

**Select Course**

↓

**Select Resource Type**

↓

**Upload File**

↓

**Success**

---

# 23. Design Direction

The final design should feel like a **modern IITR student startup**, not a generic file-storage website.

Think:

**Academic + Modern + Minimal + Community-driven**

Avoid:

* Excessive gradients
* Too many colors
* Cluttered dashboards
* Huge decorative illustrations
* Complicated navigation

Prioritize:

* Fast resource discovery
* Simple navigation
* Easy uploads
* Easy downloads
* Clear course organization
* Personalized saved resources

The website should immediately communicate:

**“This is where IIT Roorkee students share what they know.”**

---

# Final Brand

## StudyStack

### **Your Stack. Your Track.**

**Color:** Deep Navy `#061B49`

**Primary:** Blue `#146EF5`

**Accent:** Cyan `#55C7FF`

**Background:** `#F5F8FC`

**Font:** Inter

**Style:** Modern, clean, student-focused, trustworthy, and minimal.
