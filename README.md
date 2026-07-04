# Daniel Liu - Academic HPB Surgeon Portfolio

Professional portfolio website for Mr Daniel Liu, MBBS (Hons), PhD - Higher Surgical Trainee in HPB Surgery at University Hospitals Bristol and Weston NHS Foundation Trust.

## Design: Swiss Bento Grid

**Swiss International Style** meets modern bento-box layout:
- **Inter typography** (Helvetica-inspired) - clean, functional, highly legible
- **Left-aligned, grid-based** design with strict hierarchy
- **Bento card layout** for skills, credentials, and contact information
- **Monochrome palette** with blue accent for interaction states
- **Heavy use of uppercase labels** and ample whitespace
- **Sharp corners** (no rounded borders) for precision aesthetic

This distinguishes the site from typical medical websites while maintaining academic professionalism.

## Features

- Fully responsive bento-grid layout (12-column CSS Grid)
- Smooth scrolling and fade-in animations
- Self-contained HTML (no build step required)
- Sections: About, Clinical Training, Expertise (bento), Research, Academic Contributions, Contact
- Schema.org markup for physician SEO
- Contact form for research collaborations (Formspree integration)

## Content

Comprehensive professional profile including:
- NHS clinical training pathway (FY1 → ST8)
- PhD in extracellular vesicles/microRNAs in pancreaticobiliary cancer (Imperial College London)
- Peer-reviewed publications
- Surgical education and leadership roles
- Awards and invited presentations

## Blog

The site includes a Blog section for sharing updates on your surgical training, research progress, and professional insights. Blog posts are added directly in the HTML - no separate files or database needed.

### How to Add a New Blog Post

1. Open `index.html`
2. Find the Blog section (`<section id="blog">`) - it contains one sample article
3. Copy the entire `<article class="blog-post">...</article>` block
4. Paste it inside the `<div class="blog-grid">` container (above the closing `</div>`)
5. Update:
   - `<time datetime="YYYY-MM-DD">` - use ISO date format
   - `<h3>` - your post title
   - `<p>` - a brief excerpt or full content (keep it concise, ~200 words for excerpt)
6. Save and redeploy

**Example new post:**
```html
<article class="blog-post" style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm);">
  <time datetime="2025-04-01" style="font-size: 0.85rem; color: var(--accent); font-weight: 500;">1 April 2025</time>
  <h3 style="margin: 0.5rem 0; font-size: 1.2rem; color: var(--text-primary);">Your Post Title Here</h3>
  <p style="margin: 0; color: var(--text-secondary);">Write a short summary of your blog post. Readers can click through to read more (you could link to an external blog if you maintain one separately).</p>
</article>
```

**Styling notes:**
- Blog posts inherit the bento-card aesthetic (border, shadow, radius)
- They stack vertically with `margin-bottom: var(--spacing-lg)`
- The date appears in accent colour, title in primary text colour
- Keep content concise - the blog section is for brief updates

## Structure

```
.
├── index.html      # Complete single-page portfolio
├── README.md       # This file
└── images/         # (optional) Add professional headshot
```

## Setup Checklist

### 1. Add Professional Headshot (Optional)

In `index.html`, find this comment inside the `.about-image` div (line ~180):

```html
<!-- Add your professional headshot: <img src="photo.jpg" alt="Daniel Liu" style="width:100%;height:100%;object-fit:cover;"> -->
```

**To add your photo:**
1. Save a high-quality headshot as `photo.jpg` in the same folder
2. Replace the comment with: `<img src="photo.jpg" alt="Daniel Liu" style="width:100%;height:100%;object-fit:cover;">`
3. Recommended: 800×1000px, <200KB, plain background, professional attire

If no photo is added, the area shows "DL" as placeholder.

### 2. Configure Contact Form (Optional)

The contact form uses FormSubmit (free tier, no account needed). To receive emails:

1. The form is pre-configured to send to `dskl329@gmail.com` via `https://formsubmit.co/dskl329@gmail.com`
2. On first submission, FormSubmit will email `dskl329@gmail.com` asking you to confirm the address
3. Once confirmed, all form submissions will forward to that email
4. To change the recipient, update the `action` attribute in the `<form>` tag (line ~620):
   ```html
   <form class="contact-form" action="https://formsubmit.co/youremail@gmail.com" method="POST">
   ```

**Alternative**: Switch to Formspree at [formspree.io](https://formspree.io) for more granular control, or remove the `<form>` element entirely.

### 3. Review Content

Verify:
- Email addresses are correct
- Publication list is up-to-date
- Training dates and institutions match your CV
- Awards and presentations are accurate

### 4. Deploy to GitHub Pages

1. **Create repository** on GitHub (e.g., `daniel-liu-portfolio`)

2. **Push files**:
   ```bash
   git init
   git add index.html README.md
   git commit -m "Initial commit - academic portfolio"
   git branch -M main
   git remote add origin https://github.com/yourusername/daniel-liu-portfolio.git
   git push -u origin origin main
   ```

3. **Enable Pages**:
   - Repository Settings → Pages
   - Source: `Deploy from a branch` → `main` → `/ (root)`
   - Save

4. **Live at**: `https://yourusername.github.io/daniel-liu-portfolio/`

## Customisation

- **Accent color**: Edit `--accent:` in `:root` (currently black #000000)
- **Font**: Change Google Fonts import to other sans-serifs (Helvetica Now, IBM Plex Sans, etc.)
- **Grid**: Adjust `grid-template-columns: repeat(12, 1fr);` for different column counts
- **Add content**: Follow bento card pattern - add `<div class="bento-card span-4">` to grid

## Technical Notes

- **Schema.org**: JSON-LD for "Physician" included in `<head>`
- **Accessibility**: Semantic HTML, proper heading hierarchy, form labels
- **Performance**: Single HTML file, minimal JavaScript, Google Fonts async
- **SEO**: Page title and meta description configured
- **No CV download link** - the site does not host a downloadable CV file

## Credits

Portfolio design developed for Daniel Liu by Pippi Longclaw