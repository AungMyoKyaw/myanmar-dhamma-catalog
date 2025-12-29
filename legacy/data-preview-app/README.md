# Myanmar Dhamma Catalog - Data Preview App

A Next.js web application for previewing, searching, and validating the Myanmar Dhamma SQLite database.

## Features

### 📊 Dashboard

- **Database Statistics**: Total records, content types, languages, source pages
- **Recent Items**: Latest 5 content items added to the database
- **Quality Metrics**: Data quality issues and validation status

### 🔍 Browse & Search

- **Browse**: Paginated table view of all content with filtering
- **Search**: Advanced search with filters for speaker, category, and content type
- **Content Details**: View metadata, file URLs, and technical information

### 📈 Analytics

- **Speakers**: View all speakers with content counts and navigation to their content
- **Categories**: Browse content by category with distribution statistics
- **Quality Reports**: Identify and track data quality issues

### ✏️ Content Management

- **Edit Metadata**: Update titles, speakers, categories, descriptions, and other metadata
- **Data Validation**: Automatic quality checks for missing or invalid data
- **Bulk Operations**: Navigate between items for efficient editing workflows

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite with better-sqlite3
- **Icons**: Lucide React

## Database Schema

The app connects to the `dhamma_dataset.db` SQLite database with the following schema:

```sql
dhamma_content (
  id INTEGER PRIMARY KEY,
  title TEXT,
  speaker TEXT,
  content_type TEXT,
  file_url TEXT,
  file_size_estimate INTEGER,
  duration_estimate INTEGER,
  language TEXT,
  category TEXT,
  tags TEXT,
  description TEXT,
  date_recorded TEXT,
  source_page TEXT,
  scraped_date TEXT
)
```

## API Endpoints

- `GET /api/stats` - Database statistics
- `GET /api/content` - Paginated content with filters
- `GET /api/content/[id]` - Single content item
- `PUT /api/content/[id]` - Update content metadata
- `GET /api/quality` - Data quality issues
- `GET /api/search` - Search content
- `GET /api/speakers` - Speaker statistics
- `GET /api/categories` - Category statistics

## Pages

- `/` - Dashboard with overview and statistics
- `/browse` - Browse all content in table format
- `/search` - Advanced search interface
- `/speakers` - Speaker directory and statistics
- `/categories` - Category browser and distribution
- `/quality` - Data quality report and issues
- `/edit/[id]` - Edit content metadata

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000)

## Data Quality Features

The app includes automated quality checks for:

- **Missing Speaker**: Content without speaker information
- **Empty Titles**: Content with missing or very short titles
- **Duplicate Titles**: Multiple content items with identical titles
- **Invalid URLs**: Broken or malformed file URLs
- **Missing Categories**: Content without proper categorization

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── browse/            # Browse page
│   ├── categories/        # Categories page
│   ├── edit/[id]/         # Edit content page
│   ├── quality/           # Quality report page
│   ├── search/            # Search page
│   ├── speakers/          # Speakers page
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── content/           # Content-related components
│   ├── dashboard/         # Dashboard components
│   ├── edit/              # Edit form components
│   ├── layout/            # Layout components
│   ├── quality/           # Quality report components
│   ├── search/            # Search components
│   └── ui/                # shadcn/ui components
└── lib/                   # Utilities and types
    ├── database.ts        # Database connection and queries
    ├── types.ts           # TypeScript type definitions
    └── utils.ts           # Utility functions
```

## Development Notes

- The app uses Server-Side Rendering (SSR) for better performance
- Database queries are optimized with proper indexing
- All API endpoints include error handling and validation
- The UI is responsive and follows modern design principles
- TypeScript ensures type safety throughout the application

## Future Enhancements

- Export functionality for reports and filtered data
- Batch editing capabilities
- Content preview with audio/video player integration
- Advanced analytics and visualizations
- User authentication and role-based access
- API for external integrations
