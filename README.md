# Kamogelo Mosia - Portfolio Website

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS to showcase my skills, projects, and experience as a Full-Stack Developer.

## 🚀 Live Demo

Visit the live website: [kamocodes.xyz](https://kamocodes.xyz)

## 📋 Features

- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Interactive Sections**: 
  - Hero section with call-to-action
  - About me with personal information
  - Technical skills with proficiency indicators
  - Featured projects with code snippets
  - Work experience timeline
  - Contact form with WhatsApp integration
- **Performance Optimized**: Fast loading with optimized images and fonts
- **SEO Friendly**: Proper meta tags and structured data
- **Analytics**: Built-in page view tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter, Poppins)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/kamocodes/portfolio.git
   cd portfolio
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy with Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure your domain (kamocodes.xyz)
   - Deploy automatically

### Deploy to Netlify

1. **Build the project**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Netlify**
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository

### Deploy to GitHub Pages

1. **Install gh-pages**
   \`\`\`bash
   npm install --save-dev gh-pages
   \`\`\`

2. **Add deployment scripts to package.json**
   \`\`\`json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d out"
     }
   }
   \`\`\`

3. **Deploy**
   \`\`\`bash
   npm run deploy
   \`\`\`

## 📁 Project Structure

\`\`\`
portfolio/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── hero.tsx          # Hero section
│   ├── about.tsx         # About section
│   ├── skills.tsx        # Skills section
│   ├── projects.tsx      # Projects section
│   ├── experience.tsx    # Experience section
│   ├── contact.tsx       # Contact section
│   └── theme-toggle.tsx  # Theme switcher
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Additional styles
└── README.md            # Project documentation
\`\`\`

## 🎨 Customization

### Colors
Update the color scheme in `app/globals.css`:
\`\`\`css
:root {
  --primary: your-color-here;
  --secondary: your-color-here;
  /* ... */
}
\`\`\`

### Content
Update personal information in the respective component files:
- `components/hero.tsx` - Name and title
- `components/about.tsx` - Personal description
- `components/skills.tsx` - Technical skills
- `components/projects.tsx` - Project information
- `components/experience.tsx` - Work experience
- `components/contact.tsx` - Contact information

### Fonts
Change fonts in `app/layout.tsx`:
\`\`\`typescript
import { Cute_Font as YourFont } from 'next/font/google'

const yourFont = YourFont({ subsets: ["latin"] })
\`\`\`

## 📱 Contact Information

- **Email**: kamogelomosia@mail.com
- **WhatsApp**: 069 843 9670
- **GitHub**: [github.com/kamocodes](https://github.com/kamocodes)
- **Website**: [kamocodes.xyz](https://kamocodes.xyz)
- **Location**: Kempton Park, Johannesburg

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kamocodes/portfolio/issues).

## ⭐ Show Your Support

Give a ⭐️ if you like this project!

---

**Built with ❤️ by Kamogelo Mosia**
