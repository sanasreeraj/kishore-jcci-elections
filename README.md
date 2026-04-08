# Kishore JCCI Elections Website

Next.js campaign website for Ch Kishore Kumar (JCCI Election 2026-27).

## Project Structure

```text
website/
	public/
		assets/
			airforce-logo.png
			ballot-number.png
			jcci-logo.png
			jcma-logo.png
			kishore-standing.png
	src/
		app/
			globals.css
			layout.tsx
			page.module.css
			page.tsx
		components/
			campaign-site.tsx
		lib/
			search.ts
			site-data.ts
	next.config.ts
	package.json
```

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Notes

- Framework: Next.js (App Router)
- Styling: CSS Modules + global theme tokens
- Data source: file-based content and CSV parsing
- Build output: static prerendered pages
