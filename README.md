# Myanmar Dhamma Catalog

**Live Site**: https://aungmyokyaw.github.io/myanmar-dhamma-catalog/

A scraper and SQLite database builder for [dhammadownload.com](https://www.dhammadownload.com) - a comprehensive collection of Theravada Buddhist dhamma talks, videos, and ebooks.

## Features

- 🎧 Scrapes audio content (MP3, WMA)
- 🎬 Scrapes video content (MP4, WMV)
- 📚 Scrapes ebooks (PDF)
- 🗄️ Builds a SQLite database with full-text search
- 🔍 Search across all content
- 👨‍🏫 Organized by teachers/speakers

## Requirements

- [Bun](https://bun.sh) runtime (uses Bun's native SQLite)

## Installation

```bash
bun install
```

## Usage

### Run the Scraper

```bash
bun run scrape
# or
bun scraper.js
```

This will create a `dhamma.db` SQLite database in the current directory.

### View Statistics

```bash
bun run stats
# or
bun scraper.js --stats
```

### Search Content

```bash
bun scraper.js --search "meditation"
bun scraper.js --search "vipassana"
```

### List Teachers

```bash
bun run teachers
# or
bun scraper.js --teachers
```

### Custom Database Path

```bash
bun scraper.js --db /path/to/custom.db
```

## Database Schema

### Tables

- **categories** - Content categories (Audio/Video/eBook in English/Myanmar)
- **teachers** - Buddhist teachers and speakers
- **media** - All media items (audio, video, ebooks)
- **collections** - Series or disc collections
- **media_collections** - Many-to-many mapping for collections

### Example Queries

```sql
-- Search for content
SELECT * FROM media WHERE title LIKE '%meditation%';

-- Get all audio by language
SELECT * FROM media WHERE type = 'audio' AND language = 'english';

-- Get all content by a teacher
SELECT m.*
FROM media m
JOIN teachers t ON m.teacher_id = t.id
WHERE t.name LIKE '%U Jotika%';

-- Get statistics
SELECT type, language, COUNT(*) as count
FROM media
GROUP BY type, language;
```

## API Usage

```javascript
import { DhammaQuery } from './scraper.js';

const query = new DhammaQuery('./dhamma.db');

// Search
const results = query.search('meditation');

// Get by type
const audio = query.getByType('audio', 'english');

// Get teachers
const teachers = query.getTeachers();

// Get statistics
const stats = query.getStats();

query.close();
```

## Statistics (as of latest scrape)

- **Total Media Items**: ~29,000
- **Audio**: ~21,400
- **Video**: ~6,300
- **eBooks**: ~1,100
- **Teachers**: ~210+
- **Languages**: English & Myanmar

## Data Source

This scraper collects publicly available Buddhist dhamma content from [dhammadownload.com](https://www.dhammadownload.com), which provides free access to these resources for the benefit of all beings.

The website explicitly states:

> "ယ္ခု ဓမ္မဒေါင်းလုပ် website မှ တရားတော်များ၏ URL Link များကို မိမိတို့၏ ကိုယ်ပိုင် website မှ တိုက်ရိုက် ပြန်လည် Link လုပ်၍ အသုံးပြုလိုပါက ခွင့်ပြူပါကြောင်း အသိပေးအပ်ပါသည်။"
>
> (Translation: "We hereby grant permission to directly link to the dhamma content URLs from this website on your own website.")

## License

MIT

## Acknowledgments

🙏 Sadhu! Sadhu! Sadhu! 🙏

With deep gratitude to all the venerable teachers whose dhamma teachings are preserved and shared on dhammadownload.com, and to the dedicated volunteers who maintain the website for the benefit of all beings.

May all beings be happy! May all beings be free from suffering!
