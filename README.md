# Myanmar Dhamma Catalog 🙏

A comprehensive catalog of Myanmar Buddhist dhamma content, creating structured datasets from Buddhist educational resources.

## 🎯 Overview

This project scrapes metadata from Buddhist content websites (specifically dhammadownload.com) to create a structured dataset of Myanmar dhamma resources including:

- 🎵 Audio teachings and discourses
- 🎥 Video content and lectures  
- 📚 E-books and written materials
- 📖 Abhidhamma texts and commentaries

The goal is to preserve and catalog Myanmar Buddhist educational content in accessible formats (CSV and SQLite database) for researchers, practitioners, and developers.

## ✨ Features

- **Respectful Web Scraping**: Implements proper delays and follows best practices
- **Multiple Output Formats**: Generates both CSV and SQLite database
- **Rich Metadata**: Extracts titles, speakers, content types, categories, and descriptions
- **Comprehensive Analytics**: Provides detailed analysis and quality metrics
- **Data Validation**: Ensures data quality and identifies duplicates
- **TypeScript**: Fully typed codebase for reliability

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/AungMyoKyaw/myanmar-dhamma-catalog.git
cd myanmar-dhamma-catalog

# Install dependencies
npm install
```

### Usage

Run the complete pipeline:

```bash
npm run all
```

Or run individual steps:

```bash
# 1. Scrape content from websites
npm run scrape

# 2. Generate CSV dataset
npm run generate-csv

# 3. Build SQLite database
npm run build-db

# 4. Generate analytics and reports
npm run analytics
```

## 📁 Project Structure

```
myanmar-dhamma-catalog/
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── scraper.ts         # Web scraping logic
│   ├── csvGenerator.ts    # CSV dataset generation
│   ├── sqliteBuilder.ts   # SQLite database creation
│   └── analytics.ts       # Analytics and reporting
├── data/
│   ├── raw/               # Raw scraped data
│   ├── dhamma_dataset.csv # Main CSV dataset
│   ├── dhamma_dataset.db  # SQLite database
│   └── analytics_report.md # Analytics report
├── docs/
│   └── project-plan.md    # Detailed project plan
└── package.json
```

## 📊 Generated Output

### 📥 Dataset Downloads

Download the pre-built datasets:

- **CSV Format**: [`dhamma_dataset.csv`](./data/dhamma_dataset.csv) - Structured spreadsheet format for analysis and import
- **SQLite Database**: [`dhamma_dataset.db`](./data/dhamma_dataset.db) - Queryable database with indexed tables

### CSV Dataset (`data/dhamma_dataset.csv`)
Structured dataset with columns:
- ID, Title, Speaker, Content Type
- File URL, Language, Category
- Description, Source Page, Scraped Date

### SQLite Database (`data/dhamma_dataset.db`)
Queryable database with:
- Indexed tables for fast searching
- Support for complex queries
- Data integrity constraints

### Analytics Report (`data/analytics_report.md`)
Comprehensive analysis including:
- Content distribution statistics
- Speaker and category analysis
- Data quality metrics
- URL pattern analysis

## 🔍 Data Sources

Currently scrapes from:
- `AudioInMyanmar.htm` - Audio teachings
- `VideoInMyanmar.htm` - Video content  
- `EBooksInMyanmar.htm` - Digital books
- `AbhidhammaInMyanmar.htm` - Abhidhamma texts

## 📈 Sample Analytics

```bash
📊 Total Items: 1,247
📑 Content Types: audio (856), ebook (248), video (143)
🎤 Top Speakers: Sayadaw U Pandita (127), Mogok Sayadaw (98)
🌐 Languages: Myanmar (1,247)
✅ Data Quality: 95% complete metadata
```

## 🛠️ Development

### Adding New Sources

1. Add URLs to `baseUrls` in `src/scraper.ts`
2. Update content extraction logic if needed
3. Test with small samples first

### Customizing Output

- Modify CSV headers in `src/csvGenerator.ts`
- Update database schema in `src/sqliteBuilder.ts`
- Add new analytics in `src/analytics.ts`

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run scrape` | Scrape content from websites |
| `npm run generate-csv` | Create CSV dataset from raw data |
| `npm run build-db` | Build SQLite database |
| `npm run analytics` | Generate comprehensive analytics |
| `npm run all` | Run complete pipeline |

## 🙏 Ethical Considerations

This project:
- ✅ Respects robots.txt and website policies
- ✅ Implements respectful scraping delays
- ✅ Does not download actual media files
- ✅ Only extracts publicly available metadata
- ✅ Aims to preserve and organize cultural content

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on GitHub.

## 📞 Support

For questions about Buddhist content or technical issues, please open a GitHub issue.

---

*May this project contribute to the preservation and accessibility of Buddhist teachings for the benefit of all beings.* 🙏
