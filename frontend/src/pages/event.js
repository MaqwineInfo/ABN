import React, { useState, useEffect, useCallback } from 'react';

// Icon set using Bootstrap Icons for consistent styling
const IconSet = {
    Events: () => (
        <i className="bi bi-calendar-check w-5 h-5"></i>
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
    )
};

// Toast Component for notifications
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    let bgColor = '';
    let IconComponent = null;
    let textColor = '';

    // No need for a switch for this simplified version, but keeping the structure
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

// Events component with full functionality and proper icons
const Events = () => {
    // State management
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [viewEvent, setViewEvent] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        city: '',
        dateFrom: '',
        dateTo: ''
    });

    // Event form data
    const [eventData, setEventData] = useState({
        title: '',
        subtitle: '',
        description: '',
        startDate: '',
        endDate: '',
        location: {
            venue: '',
            address: '',
            city: '',
            latitude: '',
            longitude: ''
        }
    });

    // API Data states
    const [events, setEvents] = useState([]);
    const [cities, setCities] = useState([]);

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

    // Fetch cities (used for filter and form)
    const fetchCities = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCities(data);
        } catch (error) {
            console.error('Error fetching cities:', error);
            showToast('Failed to load cities', 'error');
        }
    }, [showToast]);

    // Fetch events from API
    const fetchEvents = async () => {
        try {
            // Fetch all events to enable client-side filtering as intended by the original code logic.
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events?limit=1000`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            // The API returns an object { data: [...] }, so extract the 'data' property.
            // Provide a fallback to an empty array to prevent errors.
            setEvents(responseData.data || []);
        } catch (error) {
            console.error("Error fetching events:", error);
            showToast('Failed to fetch events.', 'error');
        }
    };

    // Fetch initial data on component mount
    useEffect(() => {
        fetchEvents();
        fetchCities();
    }, [fetchCities]);

    // Filter and search events
    const filteredEvents = events.filter(event => {
        const matchesSearch = !searchTerm ||
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (event.location?.city && event.location.city.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCity = !filters.city || event.location.city === filters.city;

        const eventDate = event.startDate ? new Date(event.startDate) : null;
        const filterDateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const filterDateTo = filters.dateTo ? new Date(filters.dateTo) : null;

        if (filterDateFrom) filterDateFrom.setHours(0, 0, 0, 0);
        if (filterDateTo) filterDateTo.setHours(23, 59, 59, 999);

        const matchesDateFrom = !filterDateFrom || (eventDate && eventDate >= filterDateFrom);
        const matchesDateTo = !filterDateTo || (eventDate && eventDate <= filterDateTo);

        return matchesSearch && matchesCity && matchesDateFrom && matchesDateTo;
    });

    // Pagination
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

    // Handle form input changes
    const handleEventInputChange = (field, value) => {
        if (field.startsWith('location.')) {
            const locationField = field.split('.')[1];
            setEventData({
                ...eventData,
                location: {
                    ...eventData.location,
                    [locationField]: value
                }
            });
        } else {
            setEventData({ ...eventData, [field]: value });
        }
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: '' });
        }
    };

    // Validate event form
    const validateEventForm = () => {
        const errors = {};
        if (!eventData.title.trim()) errors.title = 'Event title is required';
        if (!eventData.description.trim()) errors.description = 'Description is required';
        if (!eventData.startDate) errors.startDate = 'Start date is required';
        if (!eventData.endDate) errors.endDate = 'End date is required';
        if (!eventData.location.city) errors['location.city'] = 'City is required';
        if (!eventData.location.address.trim()) errors['location.address'] = 'Address is required';

        if (eventData.startDate && eventData.endDate) {
            const startDateTime = new Date(eventData.startDate);
            const endDateTime = new Date(eventData.endDate);
            if (endDateTime <= startDateTime) {
                errors.endDate = 'End date/time must be after start date/time.';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle schedule event submission (Create/Update)
    const handleScheduleEvent = async () => {
        if (validateEventForm()) {
            showConfirmation(
                editingEvent ? 'Update Event' : 'Schedule Event',
                `Are you sure you want to ${editingEvent ? 'update' : 'schedule'} this event?`,
                async () => {
                    try {
                        let response;
                        if (editingEvent) {
                            response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${editingEvent._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(eventData),
                            });
                        } else {
                            response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(eventData),
                            });
                        }

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                        }

                        const result = await response.json();
                        showToast(result.message || `Event ${editingEvent ? 'updated' : 'scheduled'} successfully!`, 'success');
                        setShowScheduleForm(false);
                        setEditingEvent(null);
                        setEventData({
                            title: '', subtitle: '', description: '', startDate: '', endDate: '',
                            location: { venue: '', address: '', city: '', latitude: '', longitude: '' }
                        });
                        fetchEvents(); // Re-fetch events to update the list
                    } catch (error) {
                        console.error(`Error ${editingEvent ? 'updating' : 'scheduling'} event:`, error);
                        showToast(`Failed to ${editingEvent ? 'update' : 'schedule'} event: ${error.message}`, 'error');
                    }
                }
            );
        }
    };

    // Handle delete event
    const handleDeleteEvent = (eventId) => {
        showConfirmation(
            'Delete Event',
            'Are you sure you want to delete this event? This action cannot be undone.',
            async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/events/${eventId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    }

                    showToast('Event deleted successfully!', 'success');
                    fetchEvents(); // Re-fetch events to update the list
                } catch (error) {
                    console.error("Error deleting event:", error);
                    showToast(`Failed to delete event: ${error.message}`, 'error');
                }
            }
        );
    };

    // Handle edit event
    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEventData({
            title: event.title,
            subtitle: event.subtitle || '',
            description: event.description || '',
            startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
            location: {
                venue: event.location?.venue || '',
                address: event.location?.address || '',
                city: event.location?.city || '',
                latitude: event.location?.latitude || '',
                longitude: event.location?.longitude || ''
            }
        });
        setShowScheduleForm(true);
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({ city: '', dateFrom: '', dateTo: '' });
        setSearchTerm('');
        setCurrentPage(1);
        showToast('Filters reset successfully!', 'success');
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

    // Helper function to format time for display (e.g., 10:00 AM)
    const formatTimeForDisplay = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Basic styling for the body and root element, including Bootstrap Icons CSS
    useEffect(() => {
        document.body.style.fontFamily = '"Inter", sans-serif';
        document.body.style.margin = '0';
        document.body.style.backgroundColor = '#f3f4f6';
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

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    return (
        <div className="min-h-screen p-4 sm:p-6 font-sans lg:ml-[250px] lg:mt-[40px] sm:mt-[75px] mt-[50px]">
            {/* Header with Add Event Button */}
            <div className="flex justify-between items-center lg:mb-6 mb-4 px-[10px] flex-wrap gap-3 mt-[10px]">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <IconSet.Events />
                    <span className="ml-2 mt-[8px] sm:mt-[10px] lg:mt-[12px]">Events</span>
                </h1>

                <button
                    onClick={() => {
                        setEditingEvent(null);
                        setShowScheduleForm(true);
                        setEventData({
                            title: '', subtitle: '', description: '', startDate: '', endDate: '',
                            location: { venue: '', address: '', city: '', latitude: '', longitude: '' }
                        });
                        setFormErrors({});
                    }}
                    className="mt-4 px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-sm sm:text-base text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                    <IconSet.Plus />
                    <span>Create Event</span>
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:mb-[10px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <IconSet.Filter />
                    <span className="ml-2">Filters & Search</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search events..."
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
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city._id} value={city.name}>{city.name}</option>
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
                        Showing {filteredEvents.length} of {events.length} events
                    </div>
                </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Events List</h2>
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

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedEvents.map((event, index) => (
                                <tr key={event._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        <div className="truncate max-w-xs">{event.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateForDisplay(event.startDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {event.location?.city || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {`${formatTimeForDisplay(event.startDate)} - ${formatTimeForDisplay(event.endDate)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setViewEvent(event)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                                title="View Details"
                                            >
                                                <IconSet.View />
                                            </button>
                                            <button
                                                onClick={() => handleEditEvent(event)}
                                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                                title="Edit"
                                            >
                                                <IconSet.Edit />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event._id)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <IconSet.Delete />
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
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length} results
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

            {/* Schedule/Edit Event Modal */}
            {showScheduleForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <IconSet.Calendar />
                                <span className="ml-2">
                                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                                </span>
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Title Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                                <input
                                    type="text"
                                    value={eventData.title}
                                    onChange={(e) => handleEventInputChange('title', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter event title"
                                />
                                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                            </div>

                            {/* Subtitle Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Subtitle</label>
                                <input
                                    type="text"
                                    value={eventData.subtitle}
                                    onChange={(e) => handleEventInputChange('subtitle', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter event subtitle (optional)"
                                />
                            </div>

                            {/* Description Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <textarea
                                    value={eventData.description}
                                    onChange={(e) => handleEventInputChange('description', e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    rows="3"
                                    placeholder="Enter event description"
                                />
                                {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                            </div>

                            {/* Start/End Date Time Selectors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={eventData.startDate}
                                        onChange={(e) => handleEventInputChange('startDate', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formErrors.startDate && <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={eventData.endDate}
                                        onChange={(e) => handleEventInputChange('endDate', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formErrors.endDate && <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>}
                                </div>
                            </div>

                            {/* Location fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                    <select
                                        value={eventData.location.city}
                                        onChange={(e) => handleEventInputChange('location.city', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors['location.city'] ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select city</option>
                                        {cities.map(city => (
                                            <option key={city._id} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                    {formErrors['location.city'] && <p className="text-red-500 text-sm mt-1">{formErrors['location.city']}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <input
                                        type="text"
                                        value={eventData.location.address}
                                        onChange={(e) => handleEventInputChange('location.address', e.target.value)}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${formErrors['location.address'] ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter event address"
                                    />
                                    {formErrors['location.address'] && <p className="text-red-500 text-sm mt-1">{formErrors['location.address']}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                                    <input
                                        type="text"
                                        value={eventData.location.venue}
                                        onChange={(e) => handleEventInputChange('location.venue', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter venue name (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={eventData.location.latitude}
                                        onChange={(e) => handleEventInputChange('location.latitude', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="23.0225 (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={eventData.location.longitude}
                                        onChange={(e) => handleEventInputChange('location.longitude', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="72.5714 (optional)"
                                    />
                                </div>
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
                                onClick={handleScheduleEvent}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                            >
                                <IconSet.Calendar />
                                <span>{editingEvent ? 'Update Event' : 'Create Event'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Event Modal */}
            {viewEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full animate-scale-in">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <IconSet.View />
                                <span className="ml-2">Event Details</span>
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <p className="text-gray-800">{viewEvent.title}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                                    <p className="text-gray-800">{viewEvent.subtitle || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="text-gray-800">{viewEvent.description}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <p className="text-gray-800">
                                        {formatDateForDisplay(viewEvent.startDate)} - {formatDateForDisplay(viewEvent.endDate)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Time</label>
                                    <p className="text-gray-800">
                                        {formatTimeForDisplay(viewEvent.startDate)} - {formatTimeForDisplay(viewEvent.endDate)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <p className="text-gray-800">
                                        {viewEvent.location?.venue && `${viewEvent.location.venue}, `}
                                        {viewEvent.location?.address},
                                        {viewEvent.location?.city || 'N/A'},
                                        {viewEvent.location?.state || 'N/A'},
                                        {viewEvent.location?.country || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <p className="text-gray-800">{viewEvent.location?.latitude || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <p className="text-gray-800">{viewEvent.location?.longitude || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setViewEvent(null)}
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

export default Events;

