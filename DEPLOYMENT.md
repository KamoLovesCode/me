# Deployment Guide

This guide covers multiple deployment options for your portfolio website.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended)

**Why Vercel?**
- Built by the creators of Next.js
- Zero configuration deployment
- Automatic HTTPS and CDN
- Custom domain support
- Perfect for Next.js apps

**Steps:**
1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure your custom domain (kamocodes.xyz)
5. Deploy automatically

**Custom Domain Setup:**
1. Go to your Vercel project settings
2. Add `kamocodes.xyz` as a custom domain
3. Update your DNS records:
   - Type: A, Name: @, Value: 76.76.19.61
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

### 2. Netlify

**Steps:**
1. Build the project: `npm run build`
2. Visit [netlify.com](https://netlify.com)
3. Drag and drop the `out` folder
4. Or connect your GitHub repository for continuous deployment

**Custom Domain:**
1. Go to Site settings > Domain management
2. Add custom domain: `kamocodes.xyz`
3. Update DNS records as instructed

### 3. GitHub Pages

**Automatic Deployment (Recommended):**
The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main branch.

**Manual Deployment:**
\`\`\`bash
# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
\`\`\`

**Custom Domain Setup:**
1. Go to repository Settings > Pages
2. Add custom domain: `kamocodes.xyz`
3. Update DNS records:
   - Type: A, Name: @, Value: 185.199.108.153
   - Type: A, Name: @, Value: 185.199.109.153
   - Type: A, Name: @, Value: 185.199.110.153
   - Type: A, Name: @, Value: 185.199.111.153
   - Type: CNAME, Name: www, Value: kamocodes.github.io

## 🔧 Build Commands

\`\`\`bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Export static files
npm run export

# Deploy to GitHub Pages
npm run deploy

# Lint code
npm run lint

# Type check
npm run type-check
\`\`\`

## 📋 Pre-Deployment Checklist

- [ ] Update personal information in components
- [ ] Test on multiple devices and browsers
- [ ] Verify all links work correctly
- [ ] Check WhatsApp integration
- [ ] Optimize images and assets
- [ ] Test contact form functionality
- [ ] Verify SEO meta tags
- [ ] Test dark/light mode toggle
- [ ] Check mobile responsiveness
- [ ] Validate HTML and accessibility

## 🌐 Domain Configuration

### DNS Records for kamocodes.xyz

**For Vercel:**
\`\`\`
Type: A     Name: @     Value: 76.76.19.61
Type: CNAME Name: www   Value: cname.vercel-dns.com
\`\`\`

**For GitHub Pages:**
\`\`\`
Type: A     Name: @     Value: 185.199.108.153
Type: A     Name: @     Value: 185.199.109.153
Type: A     Name: @     Value: 185.199.110.153
Type: A     Name: @     Value: 185.199.111.153
Type: CNAME Name: www   Value: kamocodes.github.io
\`\`\`

**For Netlify:**
\`\`\`
Type: A     Name: @     Value: 75.2.60.5
Type: CNAME Name: www   Value: your-site-name.netlify.app
\`\`\`

## 🔍 Troubleshooting

### Common Issues:

1. **Build Errors:**
   - Run `npm run type-check` to find TypeScript errors
   - Check `npm run lint` for code quality issues

2. **Images Not Loading:**
   - Ensure images are in the `public` folder
   - Use relative paths starting with `/`

3. **Custom Domain Not Working:**
   - Wait 24-48 hours for DNS propagation
   - Check DNS records with online tools
   - Verify HTTPS certificate is issued

4. **WhatsApp Link Not Working:**
   - Check phone number format: +27698439670
   - Test the generated WhatsApp URL

## 📊 Performance Optimization

- Images are optimized with Next.js Image component
- Fonts are loaded with `font-display: swap`
- CSS is automatically optimized
- JavaScript is code-split and minified
- Static generation for better performance

## 🔒 Security

- All external links use `rel="noopener noreferrer"`
- Form inputs are properly validated
- No sensitive data in client-side code
- HTTPS enforced on all deployments

## 📈 Analytics

The portfolio includes basic analytics tracking:
- Page views are tracked
- No personal data is collected
- Analytics data is stored locally

For advanced analytics, consider adding:
- Google Analytics
- Vercel Analytics
- Plausible Analytics

---

**Need Help?** Contact Kamogelo at kamogelomosia@mail.com or WhatsApp: 069 843 9670
