import React, { useState } from 'react';
import { Briefcase, MapPin, Search, TrendingUp, X } from 'lucide-react';

export default function ModernSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const trendingSearches = [
    'Frontend Developer',
    'UI/UX Designer',
    'Product Manager',
    'Data Analyst',
  ];

  const popularLocations = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Remote'];

  const handleSearch = () => {
    console.log({ searchTerm, location, category });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Main Search Container - Horizontal Layout */}
      <div className="relative">
        <div
          className={`bg-white rounded-full shadow-xl transition-all duration-300 ${
            showSuggestions ? 'shadow-2xl' : ''
          }`}
        >
          <div className="flex items-center px-4 py-2">
            {/* Search Input */}
            <div className="flex items-center flex-1 px-4 py-2">
              <Search className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyPress={handleKeyPress}
                placeholder="Search for position, keyword, company..."
                className="w-full text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200"></div>

            {/* Category Select */}
            <div className="flex items-center flex-1 px-4 py-2">
              <Briefcase className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-base text-gray-700 focus:outline-none cursor-pointer bg-transparent appearance-none pr-8"
              >
                <option value="">Tất cả danh mục</option>
                <option value="tech">Công nghệ thông tin</option>
                <option value="marketing">Marketing & PR</option>
                <option value="sales">Kinh doanh</option>
                <option value="design">Thiết kế</option>
                <option value="finance">Tài chính</option>
                <option value="hr">Nhân sự</option>
              </select>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200"></div>

            {/* Location Select */}
            <div className="flex items-center flex-1 px-4 py-2">
              <MapPin className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-base text-gray-700 focus:outline-none cursor-pointer bg-transparent appearance-none pr-8"
              >
                <option value="">Tất cả địa điểm</option>
                <option value="hanoi">Hà Nội</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="danang">Đà Nẵng</option>
                <option value="haiphong">Hải Phòng</option>
                <option value="cantho">Cần Thơ</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* Search ButtonUppercase */}
            <button
              onClick={handleSearch}
              className="ml-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-full transition-all duration-200 flex items-center justify-center px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="h-5 w-5 mr-2" />
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Trending Searches */}
                <div>
                  <div className="flex items-center mb-3">
                    <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-700">Tìm kiếm phổ biến</span>
                  </div>
                  <div className="space-y-2">
                    {trendingSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchTerm(term)}
                        className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-orange-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Locations */}
                <div>
                  <div className="flex items-center mb-3">
                    <MapPin className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-700">Địa điểm phổ biến</span>
                  </div>
                  <div className="space-y-2">
                    {popularLocations.map((loc, index) => (
                      <button
                        key={index}
                        onClick={() => setLocation(loc.toLowerCase().replace(/[.\s]/g, ''))}
                        className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-orange-200"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span>
            <strong className="text-gray-900">2,847</strong> việc làm mới hôm nay
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          <span>
            <strong className="text-gray-900">15,234</strong> ứng viên đang tìm việc
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
          <span>
            <strong className="text-gray-900">1,200+</strong> companies are hiring
          </span>
        </div>
      </div>
    </div>
  );
}
