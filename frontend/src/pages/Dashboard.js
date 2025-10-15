import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatDistanceToNow, isToday, isTomorrow, parseISO, format, isValid, isBefore, isAfter } from 'date-fns'; // Import new date-fns functions

// MultiSelectDropdown Component (No changes)
const MultiSelectDropdown = ({ options, selectedValues, onSelectChange, placeholder, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleOptionClick = (value) => {
        let newSelectedValues;
        if (selectedValues.includes(value)) {
            newSelectedValues = selectedValues.filter(item => item !== value);
        } else {
            newSelectedValues = [...selectedValues, value];
        }
        onSelectChange(newSelectedValues);
    };

    const handleRemovePill = (valueToRemove) => {
        const newSelectedValues = selectedValues.filter(item => item !== valueToRemove);
        onSelectChange(newSelectedValues);
    };

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div
                className="w-full p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all cursor-pointer min-h-[48px] flex items-center justify-between"
                onClick={handleToggle}
            >
                {/* Display selected pills with truncation */}
                <div className="flex-grow overflow-hidden whitespace-nowrap text-ellipsis">
                    {selectedValues.length === 0 ? (
                        <span className="text-gray-500">{placeholder}</span>
                    ) : (
                        <span className="flex items-center flex-wrap gap-1">
                            {selectedValues.map((value, index) => (
                                <span key={value} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {value}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleRemovePill(value); }}
                                        className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </span>
                    )}
                </div>
                <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {/* Search input for options */}
                    <div className="p-3 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {filteredOptions.length === 0 && (
                        <div className="p-3 text-gray-500">No options found.</div>
                    )}
                    {filteredOptions.map(option => (
                        <div
                            key={option._id}
                            className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleOptionClick(option.name)}
                        >
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                checked={selectedValues.includes(option.name)}
                                readOnly // Managed by parent click
                            />
                            <span className="ml-3 text-gray-800">{option.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// Main App component
const App = () => {
    // State for managing toast messages
    const [toast, setToast] = useState(null);
    const [confirmation, setConfirmation] = useState(null);

    // Function to display a toast message
    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null); // Hide toast after 3 seconds
        }, 3000);
    };

    // Function to show a confirmation dialog
    const showConfirmation = (message, onConfirm) => {
        setConfirmation({ message, onConfirm });
    };


    // Icons component to centralize SVG icons
    const Icons = {
        Search: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /></svg>,
        Calendar: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" /><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" /></svg>,
        Money: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z" /></svg>,
        Team: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002A.274.274 0 0 1 15 13H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>,
        Link: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z" /><path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z" /></svg>,
        Handshake: () => <span>🤝</span>, // Placeholder for Handshake
        Birthday: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" /></svg>,
        View: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" /><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" /></svg>,
        AddMember: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" /></svg>,
        Users: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002A.274.274 0 0 1 15 13H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>,
        Settings: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" /></svg>,
        Meetings: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" /><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" /></svg>
    };

    return (
        <Dashboard
            showToast={showToast}
            showConfirmation={showConfirmation}
            Icons={Icons} // Pass the Icons object directly
            toast={toast} // Pass toast state
            setToast={setToast} // Pass setToast function
            confirmation={confirmation} // Pass confirmation state
            setConfirmation={setConfirmation} // Pass setConfirmation function
        />
    );
};

// Dashboard component with fixed useEffect dependencies
const Dashboard = ({ showToast, showConfirmation, Icons, toast, setToast, confirmation, setConfirmation }) => {
    const [filterData, setFilterData] = useState({
        city: [], // Changed to array for multiple selection
        chapter: [], // Changed to array for multiple selection
        dateRange: '2023-01-01 to 2025-07-21'
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '2025-06-21',
        endDate: '2025-07-21'
    });
    // Moved state and their setters into Dashboard component
    const [cities, setCities] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);

    // New state variables for aggregated data
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [totalReferences, setTotalReferences] = useState(0);
    const [totalMeetings, setTotalMeetings] = useState(0);


    // Memoized fetchChapters function
    const fetchChapters = useCallback(async (selectedCityNames) => {
        if (!selectedCityNames || selectedCityNames.length === 0) {
            setChapters([]);
            return;
        }

        try {
            // Get IDs for selected city names
            const selectedCityIds = selectedCityNames
                .map(cityName => cities.find(city => city.name === cityName)?._id)
                .filter(Boolean); // Filter out undefined/null

            if (selectedCityIds.length === 0) {
                setChapters([]);
                return;
            }

            // Fetch chapters for each selected city and combine them
            const chapterPromises = selectedCityIds.map(cityId =>
                fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters/city/${cityId}`).then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch chapters for city ${cityId}`);
                    return res.json();
                })
            );

            const chaptersArrays = await Promise.all(chapterPromises);
            const combinedChapters = chaptersArrays.flat(); // Flatten the array of arrays
            const uniqueChapters = Array.from(new Map(combinedChapters.map(chapter => [chapter._id, chapter])).values()); // Get unique chapters
            
            setChapters(uniqueChapters);
        } catch (error) {
            console.error('Error fetching chapters:', error);
            showToast('Failed to load chapters', 'error');
            setChapters([]);
        }
    }, [setChapters, showToast, cities]); // Added cities to dependencies

    // Fetch cities only once on component mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities/`);
                const data = await response.json();
                // Only update if data is different
                setCities(currentCities => {
                    if (JSON.stringify(currentCities) === JSON.stringify(data)) return currentCities;
                    return data;
                });
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };
        fetchCities();
    }, [setCities]);

    // Fetch chapters when city selection changes
    useEffect(() => {
        fetchChapters(filterData.city);
    }, [filterData.city, fetchChapters]);

    // Fetch upcoming birthdays only once
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const fetchUpcomingBirthdays = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/upcoming-birthdays`);
                if (!res.ok) throw new Error('Failed to fetch upcoming birthdays');
                const data = await res.json();

                const enriched = data.map((user) => {
                    const dob = new Date(user.dob);
                    const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                    if (nextBirthday < today) {
                        nextBirthday.setFullYear(today.getFullYear() + 1);
                    }
                    const daysUntil = Math.floor((nextBirthday - today) / (1000 * 60 * 60 * 24));
                    return { ...user, daysUntil };
                });

                setUpcomingBirthdays(enriched);
            } catch (err) {
                console.error("Error fetching upcoming birthdays:", err);
            }
        };
        fetchUpcomingBirthdays();
    }, []);

    // Fetch upcoming meetings only once
    useEffect(() => {
        const fetchUpcomingMeetings = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/meetings/upcoming-meetings`);
                if (!res.ok) throw new Error('Failed to fetch upcoming meetings');
                const data = await res.json();
                setUpcomingMeetings(data);
            } catch (err) {
                console.error("Error fetching upcoming meetings:", err);
            }
        };
        fetchUpcomingMeetings();
    }, []);

    // Initial data fetches (without filters) - Runs only once on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Business Revenue
                const resRevenue = await fetch(`${process.env.REACT_APP_API_BASE_URL}/business-exchanges/total-revenue`);
                const dataRevenue = await resRevenue.json();
                setTotalRevenue(dataRevenue.totalRevenue || 0);

                // Members
                const resMembers = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/total-members`);
                const dataMembers = await resMembers.json();
                setTotalMembers(dataMembers.totalMembers || 0);

                // References
                const resRefs = await fetch(`${process.env.REACT_APP_API_BASE_URL}/reference-passes/total-passes`);
                const dataRefs = await resRefs.json();
                setTotalReferences(dataRefs.totalReferencePasses || 0);

                // Meetings
                const resMeetings = await fetch(`${process.env.REACT_APP_API_BASE_URL}/personal-meetings/total-meetings`);
                const dataMeetings = await resMeetings.json();
                setTotalMeetings(dataMeetings.totalPersonalMeetings || 0);
            } catch (err) {
                console.error("Error fetching initial dashboard data:", err);
                // No showToast here, as this is for initial load
            }
        };
        fetchInitialData();
    }, []); // Empty dependency array ensures it runs only once on mount


    // Function to format time range
    const formatTimeRange = (start, end) => {
        if (!start || !end) return "Time not available";

        const startParsed = new Date(start);
        const endParsed = new Date(end);

        if (!isValid(startParsed) || !isValid(endParsed)) {
            return "Invalid time";
        }

        const startFormatted = format(startParsed, 'hh:mm a');
        const endFormatted = format(endParsed, 'hh:mm a');

        return `${startFormatted} to ${endFormatted}`;
    };


    // Function to update date range
    const updateDateRange = () => {
        setFilterData({ ...filterData, dateRange: `${dateRange.startDate} to ${dateRange.endDate}` });
        setShowDatePicker(false);
    };

    // Handlers for multi-select dropdowns
    const handleCitySelectChange = (newSelectedCities) => {
        setFilterData(prev => ({
            ...prev,
            city: newSelectedCities,
            chapter: [] // Clear chapters when city selection changes
        }));
    };

    const handleChapterSelectChange = (newSelectedChapters) => {
        setFilterData(prev => ({
            ...prev,
            chapter: newSelectedChapters
        }));
    };


    // Function to handle search
    const handleSearch = async () => {
        // MODIFICATION: Check if a city is selected before searching
        if (filterData.city.length === 0) {
            showToast("Please select at least one city to apply filters.", "error");
            return; // Stop the function if no city is selected
        }

        const selectedCityIds = filterData.city
            .map(cityName => cities.find(city => city.name === cityName)?._id)
            .filter(Boolean);

        const selectedChapterIds = filterData.chapter
            .map(chapterName => chapters.find(ch => ch.name === chapterName)?._id)
            .filter(Boolean);

        const [startDate, endDate] = filterData.dateRange.split(' to ');

        const queryParams = new URLSearchParams();
        if (startDate && endDate) {
            queryParams.append("startDate", startDate);
            queryParams.append("endDate", endDate);
        }

        // Only append cityId and chapterId if selections are made
        if (selectedCityIds.length > 0) {
            queryParams.append("cityId", selectedCityIds.join(',')); // Join IDs with comma
        }
        if (selectedChapterIds.length > 0) {
            queryParams.append("chapterId", selectedChapterIds.join(',')); // Join IDs with comma
        }

        const qs = queryParams.toString();
        console.log("Query Parameters being sent:", qs);

        // Determine if any city or chapter filter is applied
        const hasCityOrChapterFilter = selectedCityIds.length > 0 || selectedChapterIds.length > 0;

        try {
            // Business Revenue
            // If no city or chapter is selected, and only date range is applied, set revenue to 0
            if (!hasCityOrChapterFilter && startDate && endDate) {
                setTotalRevenue(0);
            } else {
                const resRevenue = await fetch(`${process.env.REACT_APP_API_BASE_URL}/business-exchanges/total-revenue?${qs}`);
                const dataRevenue = await resRevenue.json();
                setTotalRevenue(dataRevenue.totalRevenue || 0);
            }

            // Members
            // If no city or chapter is selected, and only date range is applied, set members to 0
            if (!hasCityOrChapterFilter && startDate && endDate) {
                setTotalMembers(0);
            } else {
                const resMembers = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/total-members?${qs}`);
                const dataMembers = await resMembers.json();
                setTotalMembers(dataMembers.totalMembers || 0);
            }

            // References
            // If no city or chapter is selected, and only date range is applied, set references to 0
            if (!hasCityOrChapterFilter && startDate && endDate) {
                setTotalReferences(0);
            } else {
                const resRefs = await fetch(`${process.env.REACT_APP_API_BASE_URL}/reference-passes/total-passes?${qs}`);
                const dataRefs = await resRefs.json();
                setTotalReferences(dataRefs.totalReferencePasses || 0);
            }

            // Meetings
            // If no city or chapter is selected, and only date range is applied, set meetings to 0
            if (!hasCityOrChapterFilter && startDate && endDate) {
                setTotalMeetings(0);
            } else {
                const resMeetings = await fetch(`${process.env.REACT_APP_API_BASE_URL}/personal-meetings/total-meetings?${qs}`);
                const dataMeetings = await resMeetings.json();
                setTotalMeetings(dataMeetings.totalPersonalMeetings || 0);
            }

            showToast("Data filtered successfully", "success");
        } catch (err) {
            console.error("Error filtering dashboard data:", err);
            showToast("Failed to fetch filtered data", "error");
            // Set all to 0 on error
            setTotalRevenue(0);
            setTotalMembers(0);
            setTotalReferences(0);
            setTotalMeetings(0);
        }
    };


    // Function to get birthday label
    const getLabel = (daysUntil) => {
        if (daysUntil === 0) return 'Today!';
        if (daysUntil === 1) return 'Tomorrow!';
        if (daysUntil > 1) return `In ${daysUntil} days`;
        return '';
    };


    return (
        <div className="min-h-screen p-4 sm:p-6 font-sans lg:ml-[250px] ">
            {/* Filter Data Section */}
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:mt-[75px] sm:mt-[75px] mt-[75px]">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <Icons.Search />
                        <span className="ml-2">Filter data</span>
                    </h2>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* City Dropdown */}
                        <MultiSelectDropdown
                            label="City"
                            placeholder="Select cities..."
                            options={cities}
                            selectedValues={filterData.city}
                            onSelectChange={handleCitySelectChange}
                        />

                        {/* Chapter Dropdown */}
                        <MultiSelectDropdown
                            label="Chapters"
                            placeholder="Select chapters..."
                            options={chapters}
                            selectedValues={filterData.chapter}
                            onSelectChange={handleChapterSelectChange}
                        />

                        {/* Date Range Picker */}
                        <div className="relative">
                            <label htmlFor="date-range-button" className="block text-sm font-medium text-gray-700 mb-2">Date range</label>
                            <button
                                id="date-range-button"
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-between"
                            >
                                {/* Format date range here */}
                                <span>
                                    {filterData.dateRange.split(' to ')[0] && format(parseISO(filterData.dateRange.split(' to ')[0]), 'dd-MM-yyyy')}
                                    {' to '}
                                    {filterData.dateRange.split(' to ')[1] && format(parseISO(filterData.dateRange.split(' to ')[1]), 'dd-MM-yyyy')}
                                </span>
                                <Icons.Calendar />
                            </button>

                            {/* Single Calendar Date Range Picker Modal */}
                            {showDatePicker && (
                                <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-80">
                                    <div className="space-y-4">
                                        <div className="text-center mb-4">
                                            <h4 className="text-sm font-medium text-gray-700">Select Date Range</h4>
                                        </div>

                                        {/* Single Calendar Interface */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label htmlFor="start-date" className="block text-xs font-medium text-gray-600 mb-1">From</label>
                                                    <input
                                                        type="date"
                                                        id="start-date"
                                                        value={dateRange.startDate}
                                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="end-date" className="block text-xs font-medium text-gray-600 mb-1">To</label>
                                                    <input
                                                        type="date"
                                                        id="end-date"
                                                        value={dateRange.endDate}
                                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick Select Options */}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <button
                                                    onClick={() => {
                                                        const today = new Date();
                                                        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                                                        setDateRange({
                                                            startDate: lastWeek.toISOString().split('T')[0],
                                                            endDate: today.toISOString().split('T')[0]
                                                        });
                                                    }}
                                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                                >
                                                    Last 7 days
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const today = new Date();
                                                        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                                                        setDateRange({
                                                            startDate: lastMonth.toISOString().split('T')[0],
                                                            endDate: today.toISOString().split('T')[0]
                                                        });
                                                    }}
                                                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                                                >
                                                    Last 30 days
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={updateDateRange}
                                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => setShowDatePicker(false)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Icons.Search />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards - simplified without gradients */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Business Revenue Card */}
                        <div className="bg-red-50 rounded-lg p-6 border border-red-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Business Revenue</p>
                                    <p className="text-2xl font-bold text-gray-800">₹ {totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
                                    <Icons.Money />
                                </div>
                            </div>
                        </div>

                        {/* Members Card */}
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Members</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalMembers.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                    <Icons.Team />
                                </div>
                            </div>
                        </div>

                        {/* References Card */}
                        <div className="bg-green-50 rounded-lg p-6 border border-green-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">References</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalReferences.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                    <Icons.Link />
                                </div>
                            </div>
                        </div>

                        {/* One-To-One Meetings Card */}
                        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">One-To-One Meetings</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalMeetings.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
                                    <Icons.Meetings />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Birthdays and Events Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Birthdays */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Icons.Birthday />
                            <span className="ml-2">Upcoming Birthdays (Next 31 Days)</span>
                        </h3>

                        <div className="space-y-3">
                            {upcomingBirthdays.length === 0 ? (
                                <p className="text-gray-500">No upcoming birthdays</p>
                            ) : (
                                upcomingBirthdays.map((user) => {
                                    const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
                                    const fullName = `${user.first_name} ${user.last_name}`;
                                    const dobDate = new Date(user.dob).toLocaleDateString();

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                                {initials}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{fullName}</p>
                                                <p className="text-sm text-gray-500">Birthday: {dobDate}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-blue-500">
                                                    {getLabel(user.daysUntil)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            onClick={() => showToast("Redirecting to View All Birthdays...", 'success')}
                            className="w-full mt-4 px-4 py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Icons.View />
                            <span>View All Birthdays</span>
                        </button>
                    </div>


                    {/* Upcoming Events and Meetings */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Icons.Calendar />
                            <span className="ml-2">Upcoming Events & Meetings</span>
                        </h3>
                        <div className="space-y-3">
                            {upcomingMeetings.map((event) => (
                                <EventCard
                                    key={event._id}  
                                    event={event}
                                    formatTimeRange={formatTimeRange}
                                    Icons={Icons}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => showToast('Redirecting to View All Events...', 'success')}
                            className="w-full mt-4 px-4 py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                        >
                            <Icons.View />
                            <span>View All Events</span>
                        </button>
                    </div>
                </div>

                
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {toast.message}
                </div>
            )}

            {/* Confirmation Dialog (Modal) */}
            {confirmation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <p className="text-lg font-semibold mb-4">{confirmation.message}</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    confirmation.onConfirm();
                                    setConfirmation(null);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setConfirmation(null)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable Event Card Component
const EventCard = ({ event, formatTimeRange, Icons }) => {
    const eventDate = parseISO(event.date);
    const startTime = parseISO(event.start_time);
    const endTime = parseISO(event.end_time);
    const now = new Date();

    const getMeetingStatus = () => { 
        const meetingStartDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());
        const meetingEndDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endTime.getHours(), endTime.getMinutes(), endTime.getSeconds());

        if (isBefore(now, meetingStartDateTime)) {
            // Meeting is in the future
            if (isToday(eventDate)) return 'Today';
            if (isTomorrow(eventDate)) return 'Tomorrow';
            return formatDistanceToNow(eventDate, { addSuffix: true });
        } else if (isAfter(now, meetingStartDateTime) && isBefore(now, meetingEndDateTime)) { 
            return 'Started';
        } else if (isAfter(now, meetingEndDateTime)) { 
            return 'Ended';
        }
        return ''; 
    };


    return (
        <div className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                {event.type === 'meeting' ? <Icons.Meetings /> : <Icons.Calendar />}
            </div>
            <div className="flex-1">
                <p className="font-medium text-gray-800">{event.title}</p>
                <p className="text-sm text-gray-600">
                    {event.city_id?.name || 'Unknown City'} • {event.chapter_id?.name || 'Unknown Chapter'}
                </p>
                <p className="text-sm font-medium text-blue-500">
                    {getMeetingStatus()}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-blue-500">
                    {format(eventDate, 'dd-MM-yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                    {formatTimeRange(event.start_time, event.end_time)}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                    {event.status}
                </span>
            </div>
        </div>
    );
};

export default App;