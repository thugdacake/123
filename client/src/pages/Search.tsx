import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import TrackItem from "@/components/TrackItem";
import { apiRequest } from "@/lib/utils";
import { debounce } from "@/lib/utils";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/search?q=${encodeURIComponent(query)}`);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data || []);
      setIsSearching(false);
      
      // Add to recent searches
      if (searchTerm.trim() && !recentSearches.includes(searchTerm)) {
        const updatedSearches = [searchTerm, ...recentSearches].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      }
    },
    onError: () => {
      setIsSearching(false);
    }
  });
  
  // Load recent searches from local storage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);
  
  // Debounced search handler
  const debouncedSearch = debounce((term: string) => {
    if (term.trim().length > 1) {
      setIsSearching(true);
      searchMutation.mutate(term);
    } else {
      setSearchResults([]);
    }
  }, 500);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      searchMutation.mutate(searchTerm);
    }
  };
  
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    searchMutation.mutate(term);
  };
  
  return (
    <div id="search-screen" className="screen px-5 pt-2 pb-20">
      <div className="screen-header mb-6">
        <h2 className="font-heading font-semibold text-xl mb-1">Buscar</h2>
        <p className="text-sm text-gray-400">Encontre suas músicas favoritas</p>
      </div>
      
      <div className="search-container mb-6">
        <form onSubmit={handleSearch} className="search-input-group relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            id="search-input" 
            placeholder="Buscar músicas..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-tokyo-darkHighlight text-white border-0 focus:outline-none focus:ring-2 focus:ring-tokyo-pink"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button 
            type="submit"
            disabled={!searchTerm.trim() || isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-md bg-tokyo-pink text-white text-sm disabled:opacity-50"
          >
            {isSearching ? "..." : "Buscar"}
          </button>
        </form>
        
        {isSearching ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-tokyo-pink rounded-full border-t-transparent animate-spin"></div>
            <p className="mt-2 text-sm text-gray-400">Buscando...</p>
          </div>
        ) : (
          <div id="search-results" className="track-list space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((track) => (
                <TrackItem 
                  key={track.id} 
                  track={track} 
                />
              ))
            ) : searchTerm ? (
              <div className="text-center py-4 text-sm text-gray-400">
                Nenhum resultado encontrado para "{searchTerm}"
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {!searchTerm && recentSearches.length > 0 && (
        <div id="recent-searches" className="section">
          <h3 className="font-heading font-semibold mb-3">Buscas Recentes</h3>
          <div className="recent-searches-list space-y-2">
            {recentSearches.map((term, index) => (
              <div 
                key={index} 
                className="recent-search-item p-3 bg-tokyo-darkElevated rounded-lg flex items-center cursor-pointer hover:bg-tokyo-darkHighlight"
                onClick={() => handleRecentSearchClick(term)}
              >
                <SearchIcon className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">{term}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
