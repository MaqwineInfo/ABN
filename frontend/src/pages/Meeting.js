import React, { useState, useEffect, useCallback } from 'react';

// Icon set using Bootstrap Icons for consistent styling
const IconSet = {
    Meetings: () => (
        <i className="bi bi-calendar-event w-5 h-5"></i>
    ),
    Plus: () => (
        <i className="bi bi-plus-circle w-5 h-5"></i>
    ),
    Search: () => (
        <i className="bi bi-search w-5 h-5"></i>
    ),
    Calendar: () => (
        <i className="bi bi-calendar w-5 h-5"></i>
    ),
    View: () => (
        <i className="bi bi-eye w-4 h-4"></i>
    ),
    Edit: () => (
        <i className="bi bi-pencil w-4 h-4"></i>
    ),
    Delete: () => (
        <i className="bi bi-trash w-4 h-4"></i>
    ),
    Download: () => (
        <i className="bi bi-download w-4 h-4"></i>
    ),
    Close: () => (
        <i className="bi bi-x-circle w-5 h-5"></i>
    ),
    Reset: () => (
        <i className="bi bi-arrow-clockwise w-4 h-4"></i>
    ),
    Previous: () => (
        <i className="bi bi-chevron-left w-4 h-4"></i>
    ),
    Next: () => (
        <i className="bi bi-chevron-right w-4 h-4"></i>
    ),
    Filter: () => (
        <i className="bi bi-funnel w-5 h-5 text-gray-600"></i>
    ),
    QrCode: () => (
        <i className="bi bi-qr-code text-lg"></i>
    ),
    Excel: () => (
        <i className="bi bi-file-earmark-spreadsheet text-lg"></i>
    )
};

// Toast Component for notifications
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    let bgColor = '';
    let IconComponent = null;
    let textColor = '';

    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            IconComponent = IconSet.CheckCircle;
            break;
        case 'error':
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            IconComponent = IconSet.XCircle;
            break;
        case 'info':
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
            IconComponent = IconSet.Info;
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            textColor = 'text-white';
            IconComponent = IconSet.AlertTriangle;
            break;
        default:
            bgColor = 'bg-gray-700';
            textColor = 'text-white';
            IconComponent = IconSet.Info;
    }

    return (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-[1000] ${bgColor} ${textColor} animate-slide-in-right`}>
            {IconComponent && <IconComponent className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
                <IconSet.Close className="w-4 h-4" />
            </button>
        </div>
    );
};

// Confirmation Modal Component
const ConfirmationModal = ({ title, message, onConfirm, onCancel, isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full animate-scale-in">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-700">{message}</p>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// Meetings component with full functionality and proper icons
const Meetings = () => {
    // State management
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [viewMeeting, setViewMeeting] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        city_id: '',
        chapter_id: '',
        dateFrom: '',
        dateTo: ''
    });

    // State for export options modal
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [selectedMeetingForExport, setSelectedMeetingForExport] = useState(null);

    // Schedule meeting form data
    const [scheduleData, setScheduleData] = useState({
        title: '',
        city_id: '',
        chapter_id: '',
        date: '',
        start_time: '',
        end_time: '',
        address: '',
        latitude: '',
        longitude: '',
        description: ''
    });

    // API Data states
    const [meetings, setMeetings] = useState([]);
    const [cities, setCities] = useState([]);
    const [allChapters, setAllChapters] = useState([]);
    const [formChapters, setFormChapters] = useState([]);
    const [filterChapters, setFilterChapters] = useState([]);

    // Form validation errors
    const [formErrors, setFormErrors] = useState({});

    // State for Toast notifications
    const [toast, setToast] = useState({ message: '', type: '', id: null });

    // State for Confirmation Modal
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { }
    });

    // Function to show toast messages
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        // Clear any existing toast to ensure new one shows immediately
        if (toast.id) {
            clearTimeout(toast.id);
        }

        const newId = setTimeout(() => {
            setToast({ message: '', type: '', id: null });
        }, duration);

        setToast({ message, type, id: newId });
    }, [toast.id]);

    // Function to show confirmation dialog
    const showConfirmation = useCallback((title, message, onConfirmCallback) => {
        setConfirmation({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirmCallback();
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }));
            }
        });
    }, []);

    // Fetch all chapters (used for both form and filters)
    const fetchAllChapters = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:4000/api/chapters');
            if (!response.ok) throw new Error('Failed to fetch chapters');
            const data = await response.json();

            // Normalize the city_id structure if it's populated
            const normalizedChapters = data.map(chapter => ({
                ...chapter,
                city_id: chapter.city_id?._id || chapter.city_id
            }));

            setAllChapters(normalizedChapters);
            setFilterChapters(normalizedChapters); // Initialize filter chapters with all chapters
        } catch (error) {
            console.error('Error fetching all chapters:', error);
            showToast('Failed to load chapters', 'error');
        }
    }, [showToast]);

    // Fetch cities
    const fetchCities = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:4000/api/cities');
            if (!response.ok) throw new Error('Failed to fetch cities');
            const data = await response.json();
            setCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
            showToast('Failed to load cities', 'error');
        }
    }, [showToast]);

    // Fetch meetings from API and their attendance counts
    const fetchMeetings = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/meetings');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const meetingsData = await response.json();

            // Fetch attendance for each meeting
            const meetingsWithAttendance = await Promise.all(
                meetingsData.map(async (meeting) => {
                    try {
                        const attendanceResponse = await fetch(`http://localhost:4000/api/meeting-attendances/${meeting._id}/total-attendances`);
                        if (!attendanceResponse.ok) {
                            console.warn(`Failed to fetch attendance for meeting ${meeting._id}: ${attendanceResponse.statusText}`);
                            return { ...meeting, totalAttendees: 0 };
                        }
                        const attendanceData = await attendanceResponse.json();
                        return { ...meeting, totalAttendees: attendanceData.totalAttendances || 0 };
                    } catch (error) {
                        console.error(`Error fetching attendance for meeting ${meeting._id}:`, error);
                        return { ...meeting, totalAttendees: 0 };
                    }
                })
            );
            setMeetings(meetingsWithAttendance);
        } catch (error) {
            console.error("Error fetching meetings:", error);
            showToast('Failed to fetch meetings.', 'error');
        }
    };

    // Fetch initial data on component mount
    useEffect(() => {
        fetchMeetings();
        fetchCities();
        fetchAllChapters();
    }, [fetchCities, fetchAllChapters]);

    // Update chapters for filter when city filter changes
    useEffect(() => {
        if (filters.city_id) {
            const chaptersForFilterCity = allChapters.filter(chapter => chapter.city_id === filters.city_id);
            setFilterChapters(chaptersForFilterCity);
            // Reset chapter filter if the selected chapter is no longer in the list
            if (filters.chapter_id && !chaptersForFilterCity.some(c => c._id === filters.chapter_id)) {
                setFilters(prev => ({ ...prev, chapter_id: '' }));
            }
        } else {
            setFilterChapters(allChapters); // Show all chapters if no city is selected in filters
        }
    }, [filters.city_id, allChapters, filters.chapter_id]);

    // Update chapters for schedule form based on selected city
    useEffect(() => {
        if (scheduleData.city_id) {
            const chaptersForFormCity = allChapters.filter(chapter => chapter.city_id === scheduleData.city_id);
            setFormChapters(chaptersForFormCity);

            // Reset chapter selection if invalid
            if (scheduleData.chapter_id && !chaptersForFormCity.some(c => c._id === scheduleData.chapter_id)) {
                setScheduleData(prev => ({ ...prev, chapter_id: '' }));
            }
        } else {
            setFormChapters([]);
        }
    }, [scheduleData.city_id, allChapters, scheduleData.chapter_id]);

    // Filter and search meetings
    const filteredMeetings = meetings.filter(meeting => {
        const matchesSearch = !searchTerm ||
            meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.city_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.chapter_id?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCity = !filters.city_id || meeting.city_id?._id === filters.city_id;
        const matchesChapter = !filters.chapter_id || meeting.chapter_id?._id === filters.chapter_id;

        // Date filtering logic
        const meetingDate = meeting.date ? new Date(meeting.date) : null;
        const filterDateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const filterDateTo = filters.dateTo ? new Date(filters.dateTo) : null;

        if (filterDateFrom) filterDateFrom.setHours(0, 0, 0, 0);
        if (filterDateTo) filterDateTo.setHours(23, 59, 59, 999);

        const matchesDateFrom = !filterDateFrom || (meetingDate && meetingDate >= filterDateFrom);
        const matchesDateTo = !filterDateTo || (meetingDate && meetingDate <= filterDateTo);

        return matchesSearch && matchesCity && matchesChapter && matchesDateFrom && matchesDateTo;
    });

    // Pagination
    const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMeetings = filteredMeetings.slice(startIndex, startIndex + itemsPerPage);

    // Handle schedule form input changes
    const handleScheduleInputChange = (field, value) => {
        setScheduleData({ ...scheduleData, [field]: value });
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: '' });
        }
    };

    // Validate schedule form
    const validateScheduleForm = () => {
        const errors = {};
        if (!scheduleData.title.trim()) errors.title = 'Meeting title is required';
        if (!scheduleData.city_id) errors.city_id = 'City is required';
        if (!scheduleData.chapter_id) errors.chapter_id = 'Chapter is required';
        if (!scheduleData.date) errors.date = 'Date is required';
        if (!scheduleData.start_time) errors.start_time = 'Start time is required';
        if (!scheduleData.end_time) errors.end_time = 'End time is required';
        if (!scheduleData.address.trim()) errors.address = 'Address is required';

        // Time validation: end time must be after start time on the same day
        if (scheduleData.date && scheduleData.start_time && scheduleData.end_time) {
            const startDateTime = new Date(`${scheduleData.date}T${scheduleData.start_time}`);
            const endDateTime = new Date(`${scheduleData.date}T${scheduleData.end_time}`);
            if (endDateTime <= startDateTime) {
                errors.end_time = 'End time must be after start time.';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle schedule meeting submission (Create/Update)
    const handleScheduleMeeting = async () => {
        if (validateScheduleForm()) {
            showConfirmation(
                editingMeeting ? 'Update Meeting' : 'Schedule Meeting',
                `Are you sure you want to ${editingMeeting ? 'update' : 'schedule'} this meeting?`,
                async () => {
                    try {
                        const payload = {
                            ...scheduleData,
                            date: scheduleData.date ? new Date(scheduleData.date).toISOString() : '',
                            start_time: scheduleData.date && scheduleData.start_time ? new Date(`${scheduleData.date}T${scheduleData.start_time}`).toISOString() : '',
                            end_time: scheduleData.date && scheduleData.end_time ? new Date(`${scheduleData.date}T${scheduleData.end_time}`).toISOString() : '',
                            latitude: parseFloat(scheduleData.latitude) || 0,
                            longitude: parseFloat(scheduleData.longitude) || 0,
                        };

                        let response;
                        if (editingMeeting) {
                            response = await fetch(`http://localhost:4000/api/meetings/${editingMeeting._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                            });
                        } else {
                            response = await fetch('http://localhost:4000/api/meetings', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(payload),
                            });
                        }

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                        }

                        const result = await response.json();
                        showToast(result.message || `Meeting ${editingMeeting ? 'updated' : 'scheduled'} successfully!`, 'success');
                        setShowScheduleForm(false);
                        setEditingMeeting(null);
                        setScheduleData({
                            title: '', city_id: '', chapter_id: '', date: '', start_time: '', end_time: '',
                            address: '', latitude: '', longitude: '', description: ''
                        });
                        fetchMeetings(); // Re-fetch meetings to update the list
                    } catch (error) {
                        console.error(`Error ${editingMeeting ? 'updating' : 'scheduling'} meeting:`, error);
                        showToast(`Failed to ${editingMeeting ? 'update' : 'schedule'} meeting: ${error.message}`, 'error');
                    }
                }
            );
        }
    };

    // Handle delete meeting
    const handleDeleteMeeting = (meetingId) => {
        showConfirmation(
            'Delete Meeting',
            'Are you sure you want to delete this meeting? This action cannot be undone.',
            async () => {
                try {
                    const response = await fetch(`http://localhost:4000/api/meetings/${meetingId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    }

                    showToast('Meeting deleted successfully!', 'success');
                    fetchMeetings(); // Re-fetch meetings to update the list
                } catch (error) {
                    console.error("Error deleting meeting:", error);
                    showToast(`Failed to delete meeting: ${error.message}`, 'error');
                }
            }
        );
    };

    // Handle edit meeting
    const handleEditMeeting = (meeting) => {
        setEditingMeeting(meeting);
        setScheduleData({
            title: meeting.title,
            city_id: meeting.city_id?._id || '',
            chapter_id: meeting.chapter_id?._id || '',
            date: meeting.date ? new Date(meeting.date).toISOString().split('T')[0] : '',
            start_time: meeting.start_time ? new Date(meeting.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : '',
            end_time: meeting.end_time ? new Date(meeting.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : '',
            address: meeting.address,
            latitude: meeting.latitude || '',
            longitude: meeting.longitude || '',
            description: meeting.description || ''
        });
        setShowScheduleForm(true);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({ city_id: '', chapter_id: '', dateFrom: '', dateTo: '' });
        setSearchTerm('');
        setCurrentPage(1);
        showToast('Filters reset successfully!', 'success');
    };

    // Helper function to format time for display (e.g., 10:00 AM)
    const formatTimeForDisplay = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Helper function to format date for display (e.g., MM/DD/YYYY)
    const formatDateForDisplay = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString();
    };

    // Handle export button click - opens the export options modal
    const handleExport = (meeting) => {
        setSelectedMeetingForExport(meeting);
        setShowExportOptions(true);
    };

    // Function to download QR code
    const downloadQRCode = () => {
        if (!selectedMeetingForExport || !selectedMeetingForExport.qrCodeDataUrl) {
            showToast('No QR Code available for this meeting.', 'error');
            return;
        }

        const link = document.createElement('a');
        link.href = selectedMeetingForExport.qrCodeDataUrl;
        link.download = `qrcode_${selectedMeetingForExport._id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('QR Code downloaded successfully!', 'success');
        setShowExportOptions(false);
    };

    // Function to download Excel (CSV)
    const downloadExcel = async () => {
        if (!selectedMeetingForExport) return;

        try {
            const response = await fetch(`http://localhost:4000/api/meetings/${selectedMeetingForExport._id}/export-attendance`);
            if (!response.ok) {
                throw new Error('CSV Download Failed.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_meeting_${selectedMeetingForExport._id}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showToast('Attendance data downloaded successfully!', 'success');
            setShowExportOptions(false);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            showToast(`CSV Download Failed: ${error.message}`, 'error');
        }
    };


    // Basic styling for the body and root element, including Bootstrap Icons CSS
    useEffect(() => {
        document.body.style.fontFamily = '"Inter", sans-serif';
        document.body.style.margin = '0';
        document.body.style.backgroundColor = '#f3f4f6'; // Light gray background
        const style = document.createElement('style');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            .animate-slide-in-right {
                animation: slideInRight 0.3s ease-out forwards;
            }
            .animate-scale-in {
                animation: scaleIn 0.3s ease-out forwards;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Add Bootstrap Icons CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
        document.head.appendChild(link);

        return () => {
            // Clean up the added link when the component unmounts
            document.head.removeChild(link);
        };
    }, []);

    return (
        <div className="min-h-screen p-4 sm:p-6 font-sans lg:ml-[250px] lg:mt-[40px] sm:mt-[75px] mt-[50px]">
            {/* Header with Add Meeting Button */}
            <div className="flex justify-between items-center lg:mb-6 mb-4 px-[10px] flex-wrap gap-3 mt-[10px]">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <IconSet.Meetings />
                    <span className="ml-2 mt-[8px] sm:mt-[10px] lg:mt-[12px]">Meetings</span>
                </h1>

                <button
                    onClick={() => {
                        setEditingMeeting(null);
                        setShowScheduleForm(true);
                        setScheduleData({
                            title: '', city_id: '', chapter_id: '', date: '', start_time: '', end_time: '',
                            address: '', latitude: '', longitude: '', description: ''
                        });
                        setFormErrors({});
                    }}
                    className="mt-4 px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-sm sm:text-base text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                    <IconSet.Plus />
                    <span>Schedule Meeting</span>
                </button>
            </div>


            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:mb-[10px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <IconSet.Filter />
                    <span className="ml-2">Filters & Search</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search meetings..."
                                className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="absolute left-2 top-2.5 text-gray-400">
                                <IconSet.Search />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <select
                            value={filters.city_id}
                            onChange={(e) => {
                                setFilters({ ...filters, city_id: e.target.value, chapter_id: '' });
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city._id} value={city._id}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                        <select
                            value={filters.chapter_id}
                            onChange={(e) => setFilters({ ...filters, chapter_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Chapters</option>
                            {filterChapters.map(chapter => (
                                <option key={chapter._id} value={chapter._id}>{chapter.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <IconSet.Reset />
                        <span>Reset Filters</span>
                    </button>
                    <div className="text-sm text-gray-600 flex items-center">
                        Showing {filteredMeetings.length} of {meetings.length} meetings
                    </div>
                </div>
            </div>

            {/* Meetings Table - Fixed Layout */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Meetings List</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="p-1 border border-gray-300 rounded text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                    </div>
                </div>

                {/* Table container with horizontal scroll */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedMeetings.map((meeting, index) => (
                                <tr key={meeting._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <div className="truncate max-w-xs">{meeting.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateForDisplay(meeting.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {meeting.city_id?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {meeting.chapter_id?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {`${formatTimeForDisplay(meeting.start_time)} - ${formatTimeForDisplay(meeting.end_time)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {meeting.totalAttendees}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setViewMeeting(meeting)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                                title="View Details"
                                            >
                                                <IconSet.View />
                                            </button>
                                            <button
                                                onClick={() => handleEditMeeting(meeting)}
                                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                                title="Edit"
                                            >
                                                <IconSet.Edit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMeeting(meeting._id)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <IconSet.Delete />
                                            </button>
                                            <button
                                                onClick={() => handleExport(meeting)}
                                                className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                                                title="Export"
                                            >
                                                <IconSet.Download />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMeetings.length)} of {filteredMeetings.length} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <IconSet.Previous />
                            <span>Previous</span>
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded text-sm ${currentPage === i + 1
                                    ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}

                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span>Next</span>
                            <IconSet.Next />
                        </button>
                    </div>
                </div>
            </div>

            {/* Schedule Meeting Modal */}
            {showScheduleForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <IconSet.Calendar />
                                <span className="ml-2">
                                    {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                                </span>
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Title Field - First */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title *</label>
                                <input
                                    type="text"
                                    value={scheduleData.title}
                                    onChange={(e) => handleScheduleInputChange('title', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter meeting title"
                                />
                                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                            </div>

                            {/* City and Chapter Dropdowns Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <select
                                        value={scheduleData.city_id}
                                        onChange={(e) => handleScheduleInputChange('city_id', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.city_id ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select city</option>
                                        {cities.map(city => (
                                            <option key={city._id} value={city._id}>{city.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.city_id && <p className="text-red-500 text-sm mt-1">{formErrors.city_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chapter *</label>
                                    <select
                                        value={scheduleData.chapter_id}
                                        onChange={(e) => handleScheduleInputChange('chapter_id', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.chapter_id ? 'border-red-500' : 'border-gray-300'}`}
                                        disabled={!scheduleData.city_id || formChapters.length === 0}
                                    >
                                        <option value="">{formChapters.length === 0 ? "No chapters available" : "Select chapter"}</option>
                                        {formChapters.map(chapter => (
                                            <option key={chapter._id} value={chapter._id}>
                                                {chapter.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.chapter_id && <p className="text-red-500 text-sm mt-1">{formErrors.chapter_id}</p>}
                                </div>
                            </div>

                            {/* Date and Time Selectors */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={scheduleData.date}
                                        onChange={(e) => handleScheduleInputChange('date', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.date ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                                    <input
                                        type="time"
                                        value={scheduleData.start_time}
                                        onChange={(e) => handleScheduleInputChange('start_time', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.start_time ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formErrors.start_time && <p className="text-red-500 text-sm mt-1">{formErrors.start_time}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                                    <input
                                        type="time"
                                        value={scheduleData.end_time}
                                        onChange={(e) => handleScheduleInputChange('end_time', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.end_time ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formErrors.end_time && <p className="text-red-500 text-sm mt-1">{formErrors.end_time}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                <textarea
                                    value={scheduleData.address}
                                    onChange={(e) => handleScheduleInputChange('address', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.address ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    rows="3"
                                    placeholder="Enter meeting address"
                                />
                                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                            </div>

                            {/* Latitude and Longitude Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={scheduleData.latitude}
                                        onChange={(e) => handleScheduleInputChange('latitude', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="23.0225 (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={scheduleData.longitude}
                                        onChange={(e) => handleScheduleInputChange('longitude', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="72.5714 (optional)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={scheduleData.description}
                                    onChange={(e) => handleScheduleInputChange('description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows="3"
                                    placeholder="Enter meeting description (optional)"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowScheduleForm(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <IconSet.Close />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleScheduleMeeting}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                            >
                                <IconSet.Calendar />
                                <span>{editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Meeting Modal */}
            {viewMeeting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full animate-scale-in">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <IconSet.View />
                                <span className="ml-2">Meeting Details</span>
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <p className="text-gray-800">{viewMeeting.title}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                                    <p className="text-gray-800">
                                        {formatDateForDisplay(viewMeeting.date)} • {formatTimeForDisplay(viewMeeting.start_time)} - {formatTimeForDisplay(viewMeeting.end_time)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <p className="text-gray-800">{viewMeeting.city_id?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chapter</label>
                                    <p className="text-gray-800">{viewMeeting.chapter_id?.name || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <p className="text-gray-800">{viewMeeting.address}</p>
                                </div>
                                {viewMeeting.description && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <p className="text-gray-800">{viewMeeting.description}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <p className="text-gray-800">{viewMeeting.latitude}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <p className="text-gray-800">{viewMeeting.longitude}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Attendees</label>
                                    <p className="text-gray-800">{viewMeeting.totalAttendees}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${viewMeeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : viewMeeting.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {viewMeeting.status}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">QR Code</label>
                                    {viewMeeting.qrCodeDataUrl ? (
                                        <img src={viewMeeting.qrCodeDataUrl} alt="QR Code" className="w-32 h-32 border border-gray-300 rounded p-2" />
                                    ) : (
                                        <p className="text-gray-600">No QR Code available.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setViewMeeting(null)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                            >
                                <IconSet.Close />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Options Modal */}
            {showExportOptions && selectedMeetingForExport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full animate-scale-in">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <IconSet.Download />
                                <span className="ml-2">Export Options</span>
                            </h3>
                        </div>

                        <div className="p-6 space-y-4 text-center">
                            <p className="text-gray-700 mb-4">
                                Choose an export format for: <br />
                                <span className="font-medium text-indigo-600">{selectedMeetingForExport.title}</span>
                            </p>

                            <button
                                onClick={downloadQRCode}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mb-2"
                            >
                                <IconSet.QrCode />
                                <span>Download QR Code</span>
                            </button>

                            <button
                                onClick={downloadExcel}
                                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <IconSet.Excel />
                                <span>Download Excel</span>
                            </button>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowExportOptions(false)}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                            >
                                <IconSet.Close />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '', id: null })} />
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={confirmation.onCancel}
            />
        </div>
    );
};

export default Meetings;
