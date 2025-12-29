#!/usr/bin/env bun
/**
 * Dhamma Download Scraper
 * Scrapes audio, video, and eBook content from dhammadownload.com
 * and builds a SQLite database index.
 */

import { Database } from 'bun:sqlite';
import { load } from 'cheerio';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://www.dhammadownload.com';
const DHAMMADOWNLOAD_URL = 'https://dhammadownload.com';

// Rate limiting
const DELAY_MS = 500;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Category pages to scrape
const CATEGORY_PAGES = {
  // Audio pages
  audioEnglish: `${BASE_URL}/AudioInEnglish.htm`,
  audioMyanmar: `${BASE_URL}/AudioInMyanmar.htm`,
  // Video pages
  videoEnglish: `${BASE_URL}/VideoInEnglish.htm`,
  videoMyanmar: `${BASE_URL}/VideoInMyanmar.htm`,
  // eBook pages
  ebookEnglish: `${BASE_URL}/eBook-English.htm`,
  ebookMyanmar: `${BASE_URL}/eBook-Myanmar.htm`,
  // Abhidhamma pages
  abhidhammaEnglish: `${BASE_URL}/AbhidhammaInEnglish.htm`,
  abhidhammaMyanmar: `${BASE_URL}/AbhidhammaInMyanmar.htm`,
};

// Media file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.wma', '.wav', '.m4a', '.ogg'];
const VIDEO_EXTENSIONS = ['.mp4', '.wmv', '.avi', '.mov', '.mkv', '.flv'];
const EBOOK_EXTENSIONS = ['.pdf', '.epub', '.doc', '.docx'];

class DhammaScraper {
  constructor(dbPath = './dhamma.db') {
    this.dbPath = dbPath;
    this.db = null;
    this.stats = {
      teachers: 0,
      media: 0,
      errors: 0
    };
  }

  initDatabase() {
    this.db = new Database(this.dbPath);
    
    // Create tables
    this.db.run(`
      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        language TEXT NOT NULL,
        source_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_myanmar TEXT,
        title TEXT,
        description TEXT,
        page_url TEXT UNIQUE,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        title_myanmar TEXT,
        type TEXT NOT NULL,
        format TEXT,
        language TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        file_size INTEGER,
        duration TEXT,
        description TEXT,
        date_recorded TEXT,
        location TEXT,
        teacher_id INTEGER,
        category_id INTEGER,
        source_page TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        teacher_id INTEGER,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS media_collections (
        media_id INTEGER,
        collection_id INTEGER,
        track_number INTEGER,
        PRIMARY KEY (media_id, collection_id),
        FOREIGN KEY (media_id) REFERENCES media(id),
        FOREIGN KEY (collection_id) REFERENCES collections(id)
      )
    `);

    // Create indexes
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_media_type ON media(type)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_media_language ON media(language)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_media_teacher ON media(teacher_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_media_category ON media(category_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers(name)`);

    // Prepare statements
    this.stmts = {
      insertCategory: this.db.prepare(`
        INSERT OR IGNORE INTO categories (name, type, language, source_url)
        VALUES (?, ?, ?, ?)
      `),
      getCategory: this.db.prepare(`
        SELECT id FROM categories WHERE name = ?
      `),
      insertTeacher: this.db.prepare(`
        INSERT OR IGNORE INTO teachers (name, name_myanmar, title, page_url)
        VALUES (?, ?, ?, ?)
      `),
      getTeacher: this.db.prepare(`
        SELECT id FROM teachers WHERE page_url = ? OR name = ?
      `),
      insertMedia: this.db.prepare(`
        INSERT OR IGNORE INTO media (title, type, format, language, url, description, date_recorded, location, teacher_id, category_id, source_page)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `),
      insertCollection: this.db.prepare(`
        INSERT OR IGNORE INTO collections (name, teacher_id, type)
        VALUES (?, ?, ?)
      `),
      getCollection: this.db.prepare(`
        SELECT id FROM collections WHERE name = ? AND teacher_id = ?
      `)
    };

    console.log('✓ Database initialized');
  }

  async fetchPage(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DhammaCatalog/1.0; +https://github.com/aungmyokyaw/myanmar-dhamma-catalog)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9,my;q=0.8',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      return load(html);
    } catch (error) {
      console.error(`✗ Failed to fetch ${url}: ${error.message}`);
      this.stats.errors++;
      return null;
    }
  }

  getMediaType(url) {
    const ext = path.extname(url).toLowerCase();
    if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
    if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
    if (EBOOK_EXTENSIONS.includes(ext)) return 'ebook';
    return null;
  }

  getFormat(url) {
    return path.extname(url).toLowerCase().replace('.', '');
  }

  parseMediaInfo(text) {
    // Try to extract date from text (various formats)
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(\d{1,2}\s*-\s*\d{1,2}\s*-\s*\d{2,4})/
    ];
    
    let date = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        date = match[1];
        break;
      }
    }

    // Try to extract location
    const locationPatterns = [
      /(?:at\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*(?:Singapore|Australia|Malaysia|Myanmar|USA|UK))/i,
      /(BBT|BDMS|BSV)[,\s]+(\w+)/i,
    ];
    
    let location = null;
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        location = match[0];
        break;
      }
    }

    return { date, location };
  }

  async scrapeTeacherPage(url, teacherName, language, type) {
    console.log(`  → Scraping teacher: ${teacherName}`);
    
    const $ = await this.fetchPage(url);
    if (!$) return [];

    const mediaItems = [];
    let currentCollection = null;

    // Find all links on the page
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      const fullUrl = href.startsWith('http') ? href : 
                      href.startsWith('/') ? `${BASE_URL}${href}` :
                      `${DHAMMADOWNLOAD_URL}/${href}`;

      const mediaType = this.getMediaType(fullUrl);
      if (!mediaType) return;

      // Only process media that matches expected type (or any for mixed pages)
      if (type !== 'abhidhamma' && mediaType !== type) return;

      const linkText = $(el).text().trim();
      const parentText = $(el).parent().text().trim();

      // Extract info from surrounding text
      const { date, location } = this.parseMediaInfo(parentText);

      // Try to find collection/disc name
      const discMatch = parentText.match(/(?:Disc|MP3 Disc|MP4 Disc)\s*(\d+)/i);
      if (discMatch) {
        currentCollection = `Disc ${discMatch[1]}`;
      }

      const title = linkText || path.basename(fullUrl, path.extname(fullUrl));

      mediaItems.push({
        title: title,
        type: mediaType,
        format: this.getFormat(fullUrl),
        language: language,
        url: fullUrl,
        date_recorded: date,
        location: location,
        collection: currentCollection,
        source_page: url
      });
    });

    return mediaItems;
  }

  async scrapeCategoryPage(categoryKey, url) {
    const [type, lang] = categoryKey.replace(/([A-Z])/g, ' $1').trim().toLowerCase().split(' ');
    const language = lang === 'english' ? 'english' : 'myanmar';
    const mediaType = type === 'ebook' ? 'ebook' : type;

    console.log(`\n📁 Scraping ${type} (${language})...`);
    
    const $ = await this.fetchPage(url);
    if (!$) return;

    // Insert category
    this.stmts.insertCategory.run(categoryKey, mediaType, language, url);
    const category = this.stmts.getCategory.get(categoryKey);

    // Find teacher links
    const teacherLinks = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      
      if (!href || !text) return;
      
      // Skip navigation and utility links
      if (href.includes('index.htm') || 
          href.includes('contact.htm') ||
          href.includes('facebook.com') ||
          href.includes('Suggestion') ||
          href.includes('usefullinks') ||
          href.includes('live.htm') ||
          href.includes('news') ||
          href.includes('Contribute')) return;

      // Check if it's a teacher/content page
      if (href.endsWith('.htm') && 
          !href.includes('InEnglish.htm') && 
          !href.includes('InMyanmar.htm') &&
          text.length > 3) {
        
        const fullUrl = href.startsWith('http') ? href :
                        href.startsWith('/') ? `${BASE_URL}${href}` :
                        `${BASE_URL}/${href}`;

        teacherLinks.push({
          name: text,
          url: fullUrl
        });
      }
    });

    // Also find direct media links on category page
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      const fullUrl = href.startsWith('http') ? href :
                      href.startsWith('/') ? `${BASE_URL}${href}` :
                      `${DHAMMADOWNLOAD_URL}/${href}`;

      const detectedType = this.getMediaType(fullUrl);
      if (!detectedType) return;

      const linkText = $(el).text().trim();
      const title = linkText || path.basename(fullUrl, path.extname(fullUrl));

      try {
        this.stmts.insertMedia.run(
          title,
          detectedType,
          this.getFormat(fullUrl),
          language,
          fullUrl,
          null, // description
          null, // date_recorded
          null, // location
          null, // teacher_id
          category?.id || null,
          url
        );
        this.stats.media++;
      } catch (e) {
        // Ignore duplicate entries
      }
    });

    // Scrape each teacher page
    for (const teacher of teacherLinks) {
      await sleep(DELAY_MS);

      // Insert teacher
      this.stmts.insertTeacher.run(teacher.name, null, null, teacher.url);
      const teacherRow = this.stmts.getTeacher.get(teacher.url, teacher.name);

      if (teacherRow) {
        this.stats.teachers++;
      }

      // Scrape teacher's content
      const mediaItems = await this.scrapeTeacherPage(
        teacher.url, 
        teacher.name, 
        language, 
        mediaType
      );

      // Insert media items
      for (const item of mediaItems) {
        try {
          this.stmts.insertMedia.run(
            item.title,
            item.type,
            item.format,
            item.language,
            item.url,
            null, // description
            item.date_recorded,
            item.location,
            teacherRow?.id || null,
            category?.id || null,
            item.source_page
          );
          this.stats.media++;
        } catch (e) {
          // Ignore duplicate entries
        }
      }

      console.log(`    ✓ Found ${mediaItems.length} items`);
    }
  }

  async run() {
    console.log('🙏 Dhamma Download Scraper\n');
    console.log('═'.repeat(50));
    
    this.initDatabase();
    
    const startTime = Date.now();

    for (const [key, url] of Object.entries(CATEGORY_PAGES)) {
      await this.scrapeCategoryPage(key, url);
      await sleep(DELAY_MS);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '═'.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Teachers: ${this.stats.teachers}`);
    console.log(`   Media items: ${this.stats.media}`);
    console.log(`   Errors: ${this.stats.errors}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Database: ${this.dbPath}`);
    console.log('═'.repeat(50));

    // Run optimization
    console.log('\n🔧 Optimizing database...');
    this.db.exec('ANALYZE');
    
    this.db.close();
    console.log('✓ Done! 🙏');
  }
}

// Query helper functions for the database
class DhammaQuery {
  constructor(dbPath = './dhamma.db') {
    this.db = new Database(dbPath, { readonly: true });
  }

  // Search media by text (simple LIKE search)
  search(query, limit = 50) {
    const searchPattern = `%${query}%`;
    return this.db.prepare(`
      SELECT m.*, t.name as teacher_name, c.name as category_name
      FROM media m
      LEFT JOIN teachers t ON m.teacher_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.title LIKE ? OR m.description LIKE ?
      LIMIT ?
    `).all(searchPattern, searchPattern, limit);
  }

  // Get all media by type
  getByType(type, language = null, limit = 100) {
    if (language) {
      return this.db.prepare(`
        SELECT m.*, t.name as teacher_name
        FROM media m
        LEFT JOIN teachers t ON m.teacher_id = t.id
        WHERE m.type = ? AND m.language = ?
        LIMIT ?
      `).all(type, language, limit);
    }
    return this.db.prepare(`
      SELECT m.*, t.name as teacher_name
      FROM media m
      LEFT JOIN teachers t ON m.teacher_id = t.id
      WHERE m.type = ?
      LIMIT ?
    `).all(type, limit);
  }

  // Get all teachers
  getTeachers() {
    return this.db.prepare(`
      SELECT t.*, COUNT(m.id) as media_count
      FROM teachers t
      LEFT JOIN media m ON m.teacher_id = t.id
      GROUP BY t.id
      ORDER BY media_count DESC
    `).all();
  }

  // Get media by teacher
  getByTeacher(teacherId, type = null) {
    if (type) {
      return this.db.prepare(`
        SELECT * FROM media WHERE teacher_id = ? AND type = ?
        ORDER BY title
      `).all(teacherId, type);
    }
    return this.db.prepare(`
      SELECT * FROM media WHERE teacher_id = ?
      ORDER BY type, title
    `).all(teacherId);
  }

  // Get statistics
  getStats() {
    return {
      totalMedia: this.db.prepare('SELECT COUNT(*) as count FROM media').get().count,
      totalTeachers: this.db.prepare('SELECT COUNT(*) as count FROM teachers').get().count,
      byType: this.db.prepare(`
        SELECT type, COUNT(*) as count FROM media GROUP BY type
      `).all(),
      byLanguage: this.db.prepare(`
        SELECT language, COUNT(*) as count FROM media GROUP BY language
      `).all()
    };
  }

  close() {
    this.db.close();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Dhamma Download Scraper

Usage:
  node scraper.js              Run the scraper
  node scraper.js --stats      Show database statistics
  node scraper.js --search <q> Search the database
  node scraper.js --teachers   List all teachers
  node scraper.js --help       Show this help

Options:
  --db <path>    Database path (default: ./dhamma.db)
`);
    return;
  }

  const dbIndex = args.indexOf('--db');
  const dbPath = dbIndex !== -1 ? args[dbIndex + 1] : './dhamma.db';

  if (args.includes('--stats')) {
    if (!fs.existsSync(dbPath)) {
      console.error('Database not found. Run scraper first.');
      return;
    }
    const query = new DhammaQuery(dbPath);
    const stats = query.getStats();
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Media: ${stats.totalMedia}`);
    console.log(`   Total Teachers: ${stats.totalTeachers}`);
    console.log('\n   By Type:');
    stats.byType.forEach(r => console.log(`     ${r.type}: ${r.count}`));
    console.log('\n   By Language:');
    stats.byLanguage.forEach(r => console.log(`     ${r.language}: ${r.count}`));
    query.close();
    return;
  }

  if (args.includes('--search')) {
    const searchIndex = args.indexOf('--search');
    const searchQuery = args[searchIndex + 1];
    if (!searchQuery) {
      console.error('Please provide a search query');
      return;
    }
    if (!fs.existsSync(dbPath)) {
      console.error('Database not found. Run scraper first.');
      return;
    }
    const query = new DhammaQuery(dbPath);
    const results = query.search(searchQuery);
    console.log(`\n🔍 Search results for "${searchQuery}":\n`);
    results.forEach(r => {
      console.log(`  ${r.type.toUpperCase()} | ${r.title}`);
      console.log(`    URL: ${r.url}`);
      if (r.teacher_name) console.log(`    Teacher: ${r.teacher_name}`);
      console.log('');
    });
    query.close();
    return;
  }

  if (args.includes('--teachers')) {
    if (!fs.existsSync(dbPath)) {
      console.error('Database not found. Run scraper first.');
      return;
    }
    const query = new DhammaQuery(dbPath);
    const teachers = query.getTeachers();
    console.log('\n👨‍🏫 Teachers:\n');
    teachers.forEach(t => {
      console.log(`  ${t.name} (${t.media_count} items)`);
    });
    query.close();
    return;
  }

  // Default: run scraper
  const scraper = new DhammaScraper(dbPath);
  await scraper.run();
}

main().catch(console.error);

export { DhammaScraper, DhammaQuery };
