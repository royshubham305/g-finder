# G-Finder

A modern React-based search interface that uses Google Custom Search API to find direct download links with advanced search operators.

## Features

- **Embedded Google Search Results** - No redirects, results display directly in the interface
- **Advanced File Type Filtering** - Search for specific content types (movies, books, music, software, images)
- **Comprehensive Search Options** - Exact phrases, site filtering, date ranges, and term exclusion
- **Real-time Query Preview** - See the generated search query as you type
- **Direct Download Focus** - Optimized for finding direct download links and file directories
- **Modern UI** - Clean, responsive design with smooth animations

## Setup

### Prerequisites

1. **Google Cloud Console Account** - You'll need a Google account and access to Google Cloud Console
2. **Custom Search Engine** - Set up a Google Custom Search Engine
3. **API Key** - Generate a Google Custom Search API key

### Google Custom Search Setup

1. **Create a Custom Search Engine:**
   - Go to [Google Custom Search](https://cse.google.com/)
   - Click "Add" to create a new search engine
   - Enter `*` in "Sites to search" to search the entire web
   - Give it a name and create the engine
   - Note down your **Search Engine ID (CX)**

2. **Get an API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Custom Search API"
   - Go to "Credentials" and create an API key
   - Restrict the API key to "Custom Search API" for security

3. **Add in src/components/SearchInterface:**
   - Run the application
   

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. **Select File Type** - Choose from predefined categories or select "Other" for general search
2. **Enter Search Query** - Type your search terms in the main input field
3. **Advanced Options** (optional):
   - Exact phrases that must appear
   - Terms to exclude from results
   - Specific sites to search within
   - Date range filtering
4. **Search** - Click the search button or press Enter
5. **View Results** - Results appear directly in the interface with direct download links highlighted

## Search Tips

- Use **OR** to include either term: `python OR javascript`
- Use **-** to exclude terms: `jaguar -car`
- Use **"quotes"** for exact phrases: `"index of"`
- Search within number range: `python book 2015..2020`
- For better file results, the system automatically adds `intitle:index.of` for directory listings

## API Limits

Google Custom Search API has the following limits:
- **Free tier**: 100 queries per day
- **Paid tier**: Up to 10,000 queries per day (additional charges apply)

## Security Notes

- API keys are stored in localStorage for convenience
- In production, consider using environment variables or secure key management
- Restrict your API key to specific domains in Google Cloud Console

## Technologies Used

- **React** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google APIs** - Search functionality
- **Vite** - Build tool

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
