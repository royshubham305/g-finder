import React, { useState, useEffect } from 'react';
import { Search, Copy, Trash2, Settings, Lightbulb, Film, Book, Music, HardDrive, Image, Star, ExternalLink } from 'lucide-react';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface GoogleSearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

const SearchInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [fileType, setFileType] = useState('');
  const [exactPhrase, setExactPhrase] = useState('');
  const [excludeTerms, setExcludeTerms] = useState('');
  const [customSite, setCustomSite] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('Search anything');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-filled API credentials
  const apiKey = 'api_key';
  const searchEngineId = 'cse_id';

  const fileTypes = [
    { value: 'mkv|mp4|avi|mov|mpg|wmv|divx|mpeg', label: 'TV/Movies/Video', icon: Film, placeholder: 'The.Blacklist.S01' },
    { value: 'MOBI|CBZ|CBR|CBC|CHM|EPUB|FB2|LIT|LRF|ODT|PDF|PRC|PDB|PML|RB|RTF|TCR|DOC|DOCX', label: 'Books', icon: Book, placeholder: '1985' },
    { value: 'mp3|wav|ac3|ogg|flac|wma|m4a|aac|mod', label: 'Music', icon: Music, placeholder: 'K.Flay discography' },
    { value: 'exe|iso|dmg|tar|7z|bz2|gz|rar|zip|apk', label: 'Software/ISO/DMG/Games', icon: HardDrive, placeholder: 'GTA V' },
    { value: 'jpg|png|bmp|gif|tif|tiff|psd', label: 'Images', icon: Image, placeholder: 'Donald Trump' },
    { value: '-1', label: 'Other', icon: Star, placeholder: 'Search anything' }
  ];

  const sites = [
    { id: 'wikipedia', value: 'wikipedia.org', label: 'Wikipedia' },
    { id: 'youtube', value: 'youtube.com', label: 'YouTube' },
    { id: 'github', value: 'github.com', label: 'GitHub' },
    { id: 'stackoverflow', value: 'stackoverflow.com', label: 'StackOverflow' },
    { id: 'gov', value: '.gov', label: 'Government (.gov)' },
    { id: 'edu', value: '.edu', label: 'Education (.edu)' }
  ];

  const dateRangeMap = { d: 1, w: 7, m: 30, y: 365 } as const;

  const updateQuery = () => {
    const parts = [];
    
    if (query) parts.push(query);
    if (exactPhrase) parts.push(`"${exactPhrase}"`);
    
    if (fileType && fileType !== "-1") {
      if (fileType === "") {
        parts.push('intitle:index.of');
      } else {
        parts.push(`+(${fileType})`);
        parts.push('intitle:index.of');
      }
    }
    
    if (excludeTerms) {
      const terms = excludeTerms.split(',').map(term => term.trim()).filter(term => term);
      terms.forEach(term => parts.push(`-${term}`));
    }
    
    if (selectedSites.length > 0) {
      if (selectedSites.length === 1) {
        parts.push(`site:${selectedSites[0]}`);
      } else {
        const siteQuery = selectedSites.map(site => `site:${site}`).join(' OR ');
        parts.push(`(${siteQuery})`);
      }
    }
    
    if (customSite) parts.push(`site:${customSite}`);
    
    if (dateRange) {
      const date = new Date();
      const daysAgo = dateRangeMap[dateRange as keyof typeof dateRangeMap] || 0;
      date.setDate(date.getDate() - daysAgo);
      parts.push(`after:${date.toISOString().split('T')[0]}`);
    }
    
    parts.push('-inurl:(jsp|pl|php|html|aspx|htm|cf|shtml)');
    parts.push('-inurl:(listen77|mp3raid|mp3toss|mp3drug|index_of|index-of|wallywashis|downloadmana)');
    
    setGeneratedQuery(parts.join(' '));
  };

  useEffect(() => {
    updateQuery();
  }, [query, fileType, exactPhrase, excludeTerms, selectedSites, customSite, dateRange]);

  const handleFileTypeSelect = (type: typeof fileTypes[0]) => {
    setFileType(type.value);
    setPlaceholder(`Search anything e.g ${type.placeholder}`);
  };

  const handleSiteToggle = (siteValue: string) => {
    setSelectedSites(prev => 
      prev.includes(siteValue) 
        ? prev.filter(s => s !== siteValue)
        : [...prev, siteValue]
    );
  };

  const performSearch = async () => {
    if (!generatedQuery.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(generatedQuery)}`;
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data: GoogleSearchResponse = await response.json();
      
      if (data.items) {
        setSearchResults(data.items);
      } else {
        setSearchResults([]);
        setError('No results found for your search query');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Failed to perform search');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyQuery = async () => {
    try {
      await navigator.clipboard.writeText(generatedQuery);
      // Show success feedback - you could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const clearForm = () => {
    setQuery('');
    setFileType('');
    setExactPhrase('');
    setExcludeTerms('');
    setCustomSite('');
    setDateRange('');
    setSelectedSites([]);
    setPlaceholder('Search anything');
    setSearchResults([]);
    setError('');
  };

  const openInGoogle = () => {
    if (!generatedQuery.trim()) return;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(generatedQuery)}`;
    window.open(googleUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl p-8 text-center">
          <img src="https://i.ibb.co/r2zFGgL6/gfinder.png" alt="G-Finder Logo" className="mx-auto mb-4 h-16 w-auto" />
          <h1 className="text-3xl font-bold mb-2">G-Finder</h1>
          <p className="text-blue-100">Find direct download links using Google Custom Search API</p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-b-xl shadow-lg p-6">
          {/* File Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Choose File Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {fileTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => handleFileTypeSelect(type)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                      fileType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span className="text-xs font-medium text-center">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Search Input */}
          <div className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
              <button
                onClick={performSearch}
                disabled={isLoading || !generatedQuery.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors duration-200"
          >
            <Settings size={16} />
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exact Phrase</label>
                  <input
                    type="text"
                    value={exactPhrase}
                    onChange={(e) => setExactPhrase(e.target.value)}
                    placeholder="Words in exact order"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Terms</label>
                  <input
                    type="text"
                    value={excludeTerms}
                    onChange={(e) => setExcludeTerms(e.target.value)}
                    placeholder="Words to exclude (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Specific Sites</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                  {sites.map((site) => (
                    <label key={site.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site.value)}
                        onChange={() => handleSiteToggle(site.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{site.label}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={customSite}
                  onChange={(e) => setCustomSite(e.target.value)}
                  placeholder="Or enter custom site (e.g., example.com)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any time</option>
                  <option value="d">Past 24 hours</option>
                  <option value="w">Past week</option>
                  <option value="m">Past month</option>
                  <option value="y">Past year</option>
                </select>
              </div>
            </div>
          )}

          {/* Query Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Generated Search Query</label>
            <div className="bg-gray-100 border rounded-lg p-4 font-mono text-sm min-h-[80px] max-h-48 overflow-y-auto whitespace-pre-wrap">
              {generatedQuery || 'Your search query will appear here as you type...'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={copyQuery}
              disabled={!generatedQuery}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy size={16} />
              <span>Copy Query</span>
            </button>
            <button
              onClick={performSearch}
              disabled={!generatedQuery || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={16} />
              <span>Search</span>
            </button>
            <button
              onClick={openInGoogle}
              disabled={!generatedQuery}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink size={16} />
              <span>Open in Google</span>
            </button>
            <button
              onClick={clearForm}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Search Results */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h2>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-2">
                      <a href={result.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {result.title}
                      </a>
                    </h3>
                    <p className="text-green-700 text-sm mb-2">{result.displayLink}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{result.snippet}</p>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && searchResults.length === 0 && generatedQuery && !error && (
              <div className="text-center py-8 text-gray-500">
                <p>No results found. Try adjusting your search terms.</p>
              </div>
            )}

            {!generatedQuery && (
              <div className="text-center py-8 text-gray-500">
                <p>Enter a search query above to see results here.</p>
              </div>
            )}
          </div>

          {/* Search Tips */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 className="flex items-center text-blue-800 font-semibold mb-4">
              <Lightbulb size={20} className="mr-2" />
              Search Tips
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div>Use <code className="bg-blue-100 px-2 py-1 rounded font-mono">OR</code> to include either term: <code className="bg-blue-100 px-2 py-1 rounded font-mono">python OR javascript</code></div>
              <div>Use <code className="bg-blue-100 px-2 py-1 rounded font-mono">-</code> to exclude terms: <code className="bg-blue-100 px-2 py-1 rounded font-mono">jaguar -car</code></div>
              <div>Use <code className="bg-blue-100 px-2 py-1 rounded font-mono">"quotes"</code> for exact phrases: <code className="bg-blue-100 px-2 py-1 rounded font-mono">"index of"</code></div>
              <div>Search within number range: <code className="bg-blue-100 px-2 py-1 rounded font-mono">python book 2015..2020</code></div>
              <div>For better results with file types, the system automatically adds <code className="bg-blue-100 px-2 py-1 rounded font-mono">intitle:index.of</code> for directory listings</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-600">
          <p>G-Finder &copy; 2026 | Use these operators to enhance your search experience</p>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
