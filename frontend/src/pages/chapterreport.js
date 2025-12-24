import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, X, ChevronDown, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
 
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount || 0);
};

const ChapterReport = () => { 
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
     
    const [cities, setCities] = useState([]);
    const [chapters, setChapters] = useState([]);
 
    const [dateRange, setDateRange] = useState('Last 3 Months');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
     
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Sorting State
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
 
    const fetchReportData = async () => {
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

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapter-reports?${params.toString()}`);
            const result = await response.json();

            if (result.success) { 
                if (Array.isArray(result.data)) setReportData(result.data);
                if (result.pagination) {
                    setTotalPages(result.pagination.total_pages);
                    setTotalRecords(result.pagination.total_records);
                }
            } else {
                setReportData([]);
                setTotalRecords(0);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };
 
    useEffect(() => {
        fetchReportData(); 
    }, [dateRange, selectedCity, selectedChapter, currentPage, rowsPerPage, sortConfig]);
 

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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-gray-400 ml-1" />;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="w-3 h-3 text-blue-600 ml-1" />
            : <ArrowDown className="w-3 h-3 text-blue-600 ml-1" />;
    };

    const handleExportCSV = () => { 
        const headers = [
            'Name', 'Mobile', 'Business Name', 'City', 'Chapter',
            'Ref Received', 'Ref Given', 'Business Received',
            'Business Given', 'One-to-One', 'Absent'
        ];
        const rows = reportData.map(m => [
            m.full_name, m.personal_phone_number, m.business_name, m.city_name, m.chapter_name,
            m.reference_received || 0, m.reference_given || 0, m.business_received || 0,
            m.business_given || 0, m.one_to_one_count || 0, m.absent_count || 0
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `chapter_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Table Header Definitions
    const tableHeaders = [
        { label: 'Name', key: 'full_name', align: 'left', className: 'border-r border-gray-200' },
        { label: 'Mobile No', key: 'personal_phone_number', align: 'left', className: '' },
        // Added specific width to Business Name header if needed, but the cell style handles the ellipsis
        { label: 'Business Name', key: 'business_name', align: 'left', className: 'border-r border-gray-200 w-52' },
        { label: 'Ref. Received', key: 'reference_received', align: 'center', className: 'bg-blue-50' },
        { label: 'Ref. Given', key: 'reference_given', align: 'center', className: 'bg-blue-50 border-r border-blue-100' },
        { label: 'Business Received', key: 'business_received', align: 'right', className: 'bg-green-50' },
        { label: 'Business Given', key: 'business_given', align: 'right', className: 'bg-green-50 border-r border-green-100' },
        { label: '1-to-1 Meeting', key: 'one_to_one_count', align: 'center', className: 'bg-yellow-50' },
        { label: 'Absent', key: 'absent_count', align: 'center', className: 'bg-red-50 text-red-600' },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800 lg:ml-64 mt-16">
            
            {/* Header */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chapter Performance Report</h1>
                    <p className="text-gray-500 text-sm mt-1">View business, references, and activity metrics.</p>
                </div>
                {loading && (
                    <div className="flex items-center text-blue-600 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Updating...</span>
                    </div>
                )}
            </div>

            {/* Filters Section */}
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date Range</label>
                        <div className="relative">
                            <select
                                value={dateRange}
                                onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
                                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>This Week</option><option>Last Week</option><option>Last 3 Months</option><option>Last 6 Months</option><option>Last 12 Months</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    {/* City Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
                        <div className="relative">
                            <select
                                value={selectedCity}
                                onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Cities</option>
                                {cities.map((city) => <option key={city._id} value={city.name}>{city.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    {/* Chapter Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Chapter</label>
                        <div className="relative">
                            <select
                                value={selectedChapter}
                                onChange={(e) => { setSelectedChapter(e.target.value); setCurrentPage(1); }}
                                className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Chapters</option>
                                {chapters.map((chap) => <option key={chap._id} value={chap.name}>{chap.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    {/* Clear Filters */}
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
                        {[10, 25, 50, 'All'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleRowsPerPageChange(opt)}
                                className={`px-3 py-1 text-sm ${rowsPerPage === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            >
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
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                {tableHeaders.map((header) => (
                                    <th 
                                        key={header.key}
                                        onClick={() => handleSort(header.key)}
                                        className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${header.className}`}
                                    >
                                        <div className={`flex items-center ${header.align === 'center' ? 'justify-center' : header.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                                            {header.label}
                                            {getSortIcon(header.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.length > 0 ? (
                                reportData.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                                            <div className="flex items-center">
                                                {member.profile_picture ? (
                                                    <img src={`/uploads/${member.profile_picture}`} alt="" className="w-8 h-8 rounded-full mr-3 object-cover bg-gray-100" onError={(e) => {e.target.style.display='none'}} />
                                                ) : (
                                                     <div className="w-8 h-8 rounded-full mr-3 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {member.full_name?.charAt(0)}
                                                     </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                                                    <div className="text-xs text-gray-500">{member.chapter_name}, {member.city_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{member.personal_phone_number}</td>
                                        
                                        {/* --- UPDATED BUSINESS NAME CELL --- */}
                                        <td 
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200 max-w-[200px] truncate"
                                            title={member.business_name} // Show full name on hover
                                        >
                                            {member.business_name}
                                        </td>
                                        {/* ---------------------------------- */}

                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-blue-700 bg-blue-50/30">{member.reference_received}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600 bg-blue-50/30 border-r border-blue-100">{member.reference_given}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-green-700 bg-green-50/30">{formatCurrency(member.business_received)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-600 bg-green-50/30 border-r border-green-100">{formatCurrency(member.business_given)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700 bg-yellow-50/30">{member.one_to_one_count}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-red-600 bg-red-50/30">{member.absent_count}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
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
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <span className="font-medium text-gray-900 px-2">
                            Page {currentPage} of {totalPages || 1}
                        </span>

                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChapterReport;