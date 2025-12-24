import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, X, ChevronDown, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const AttendanceReport = () => {
  // --- State ---
  const [reportData, setReportData] = useState([]);
  const [meetingDates, setMeetingDates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [cities, setCities] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Filter State
  const [dateRange, setDateRange] = useState('Last 3 Months');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

  // Pagination State
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [sortConfig, setSortConfig] = useState({ key: 'business_name', direction: 'asc' });
 
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`);
        if (response.ok) setCities(await response.json());
      } catch (err) { console.error("Error fetching cities:", err); }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters`);
        if (response.ok) setChapters(await response.json());
      } catch (err) { console.error("Error fetching chapters:", err); }
    };
    fetchChapters();
  }, []);
 
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('dateRange', dateRange);
      params.append('page', currentPage);
      params.append('limit', rowsPerPage === 'All' ? 10000 : rowsPerPage);
 
      params.append('sortBy', sortConfig.key);
      params.append('sortOrder', sortConfig.direction);

      if (selectedCity) params.append('city', selectedCity);
      if (selectedChapter) params.append('chapter', selectedChapter);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/attendance-reports?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data || []);
        setMeetingDates(result.meeting_dates || []);
        if (result.pagination) {
          setTotalPages(result.pagination.total_pages);
          setTotalRecords(result.pagination.total_records);
        }
      } else {
        setReportData([]);
        setMeetingDates([]);
      }
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on changes
  useEffect(() => {
    fetchAttendanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedCity, selectedChapter, currentPage, rowsPerPage, sortConfig]);

  // --- Handlers ---
  const handleClearFilters = () => {
    setDateRange('Last 3 Months');
    setSelectedCity('');
    setSelectedChapter('');
    setCurrentPage(1);
    setSortConfig({ key: 'business_name', direction: 'asc' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newLimit) => {
    setRowsPerPage(newLimit);
    setCurrentPage(1);
  };

  // --- Sorting Handler ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- Helper to render Sort Icon ---
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600 ml-1" />
      : <ArrowDown className="w-3 h-3 text-blue-600 ml-1" />;
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Mobile', 'Business', ...meetingDates];
    const rows = reportData.map(m => [
      m.name, m.mobile, m.business,
      ...meetingDates.map(date => m.attendance[date] || '-')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800 lg:ml-64 mt-16">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chapter Attendance Report</h1>
          <p className="text-gray-500 text-sm mt-1">View and export member attendance records.</p>
        </div>
        {loading && (
          <div className="flex items-center text-blue-600 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Updating...</span>
          </div>
        )}
      </div>

      {/* Filters Section (Standard) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Range</label>
            <div className="relative">
              <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>This Week</option><option>Last Week</option><option>Last 3 Months</option><option>Last 4 Months</option><option>Last 6 Months</option><option>Last 9 Months</option><option>Last 12 Months</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
            <div className="relative">
              <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Cities</option>
                {cities.map((city) => <option key={city._id} value={city.name}>{city.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          {/* Chapter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Chapter</label>
            <div className="relative">
              <select value={selectedChapter} onChange={(e) => { setSelectedChapter(e.target.value); setCurrentPage(1); }} className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Chapters</option>
                {chapters.map((chap) => <option key={chap._id} value={chap.name}>{chap.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          {/* Clear */}
          <div>
            <button onClick={handleClearFilters} className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded transition-colors">
              <X className="w-4 h-4" /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Show rows:</span>
          <div className="flex bg-white border border-gray-300 rounded overflow-hidden">
            {[12, 25, 50, 'All'].map((opt) => (
              <button key={opt} onClick={() => handleRowsPerPageChange(opt)} className={`px-3 py-1 text-sm ${rowsPerPage === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Download Excel
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* --- SORTABLE COLUMNS --- */}

                {/* Name */}
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Name {getSortIcon('name')}
                  </div>
                </th>

                {/* Mobile */}
                <th
                  onClick={() => handleSort('mobile')}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Mobile {getSortIcon('mobile')}
                  </div>
                </th>

                {/* Business Name */}
                <th
                  onClick={() => handleSort('business_name')}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Business Name {getSortIcon('business_name')}
                  </div>
                </th>

                {/* Dynamic Date Columns (Not Sortable) */}
                {meetingDates.map((date) => (
                  <th key={date} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[80px]">
                    {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    <br />
                    <span className="text-[10px] font-normal text-gray-400">
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.length > 0 ? (
                reportData.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-200">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {member.mobile}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                      {member.business}
                    </td>
                    {meetingDates.map((date) => {
                      const status = member.attendance && member.attendance[date];
                      return (
                        <td key={date} className="px-2 py-3 whitespace-nowrap text-center">
                          {status ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${status === 'P' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {status}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={meetingDates.length + 3} className="px-4 py-8 text-center text-gray-500">
                    {loading ? "Loading data..." : "No members found matching your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer and Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex items-center justify-between">
          <div>
            Showing {reportData.length > 0 ? ((currentPage - 1) * (rowsPerPage === 'All' ? totalRecords : rowsPerPage)) + 1 : 0} to {Math.min(currentPage * (rowsPerPage === 'All' ? totalRecords : rowsPerPage), totalRecords)} of {totalRecords} results
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-medium text-gray-900 px-2">Page {currentPage} of {totalPages || 1}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;