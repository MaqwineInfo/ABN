import React, { useState, useEffect, useCallback } from 'react';

// Use a fallback for Link since react-router-dom is not available
const Link = (props) => <a href={props.to} {...props}>{props.children}</a>;

const Users = ({ Icons }) => {
  // Fallback icons (matching AddMember.js for consistency)
  const FallbackIcons = {
    Users: () => (<i className="bi bi-people text-4xl"></i>),
    Search: () => (<i className="bi bi-search text-xl"></i>),
    View: () => (<i className="bi bi-eye text-xl"></i>),
    Edit: () => (<i className="bi bi-pencil-square text-xl"></i>),
    Delete: () => (<i className="bi bi-trash text-xl"></i>),
    Lock: () => (<i className="bi bi-lock text-xl"></i>),
    Profile: () => (<i className="bi bi-person-circle text-2xl"></i>),
    City: () => (<i className="bi bi-building text-2xl"></i>),
    Settings: () => (<i className="bi bi-gear text-2xl"></i>),
    Close: () => (<i className="bi bi-x-lg text-2xl"></i>),
    Check: () => (<i className="bi bi-check-lg text-xl"></i>),
    CheckCircle: () => (<i className="bi bi-check-circle text-2xl mr-3"></i>),
    Info: () => (<i className="bi bi-info-circle text-2xl mr-3"></i>),
    AlertTriangle: () => (<i className="bi bi-exclamation-triangle text-2xl mr-3"></i>),
    XCircle: () => (<i className="bi bi-x-circle text-2xl mr-3"></i>),
    X: () => (<i className="bi bi-x text-2xl"></i>),
    Eye: () => (<i className="bi bi-eye w-5 h-5"></i>),
    EyeSlash: () => (<i className="bi bi-eye-slash w-5 h-5"></i>),
    Filter: () => (<i className="bi bi-funnel text-3xl"></i>),
    Plus: () => (<i className="bi bi-plus-lg w-5 h-5"></i>), // New icon for Add Member
  };

  const IconSet = Icons || FallbackIcons;

  const API_BASE_URL = 'http://localhost:4000/api'; // Base URL for the API

  // State management for Users table
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  // Real data states
  const [users, setUsers] = useState([]); // Stores combined user and business data
  const [allCities, setAllCities] = useState([]); // Stores all cities from API
  const [allChapters, setAllChapters] = useState([]); // Stores all chapters from API (for filter dropdown)
  const [filteredChaptersForForm, setFilteredChaptersForForm] = useState([]); // Chapters filtered by city for the multi-step form

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Change password form data
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Form validation errors for password change
  const [passwordErrors, setPasswordErrors] = useState({});

  // Roles for dropdown
  const roles = ['user', 'admin', 'member']; // Use actual roles from schema

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // Custom Confirmation Dialog State
  const [confirmationDialog, setConfirmationDialog] = useState(null);

  // Function to show toast notification
  const showToast = useCallback((message, severity = 'info') => {
    setToastMessage({ message, severity });
  }, []);

  // Effect to auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Function to show confirmation dialog
  const showConfirmation = useCallback((header, message, acceptCallback, rejectCallback) => {
  setConfirmationDialog({
    header,
    message,
    onConfirm: acceptCallback,
    onCancel: rejectCallback || (() => { }),
  });
}, []);


  // Function to fetch all necessary data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, businessesRes, citiesRes, chaptersRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE_URL}/users`),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/businesses`), // Fetch all businesses
        fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters`)
      ]);

      const usersData = await usersRes.json();
      const businessesData = await businessesRes.json();
      const citiesData = await citiesRes.json();
      const chaptersData = await chaptersRes.json();

      if (!usersRes.ok) throw new Error(usersData.error || 'Failed to fetch users.');
      if (!businessesRes.ok) throw new Error(businessesData.error || 'Failed to fetch businesses.');
      if (!citiesRes.ok) throw new Error(citiesData.error || 'Failed to fetch cities.');
      if (!chaptersRes.ok) throw new Error(chaptersData.error || 'Failed to fetch chapters.');

      // Combine user and business data
      const combinedUsers = usersData.map(user => {
        // Find the business associated with the user
        const business = businessesData.find(b => b.user_id._id === user._id); // Access user_id._id

        const businessProfileStatus = business ? 'Completed' : 'Incompleted';
        // Correctly access city and chapter names from the populated objects
        const userCityName = business && business.city_id ? business.city_id.name : 'N/A';
        const userChapterName = business && business.chapter_id ? business.chapter_id.name : 'N/A';

        return {
          ...user,
          id: user._id, // Use _id as id for consistency with existing code
          name: `${user.first_name} ${user.last_name}`,
          businessProfileStatus,
          businessName: business ? business.business_name : 'Business Not Registered',
          city: userCityName,
          chapter: userChapterName,
          isActive: user.account_status === 'active' || user.account_status === 'approved', // Map account_status to isActive
          // Populate all business fields for view/edit
          business: business || {}, // Store the whole business object or an empty object
          personalPhoneNumber: business?.personal_phone_number || 'N/A',
          officePhoneNumber: business?.office_phone_number || 'N/A',
          email2: business?.email || 'N/A', // Business email
          businessWebsite: business?.web_url || 'N/A',
          businessTagline: business?.tagline || 'N/A',
          descriptionOfBusiness: business?.description || 'N/A',
          businessServices: business?.business_services || 'N/A', // Assuming such fields exist in business schema
          hometownAddress: business?.hometown_address || 'N/A',
          hometownCity: business?.hometown_city || 'N/A',
          hometownDistrict: business?.hometown_district || 'N/A',
          hometownPincode: business?.hometown_pincode || 'N/A',
          residenceAddress: business?.residence_address || 'N/A',
          residenceCity: business?.residence_city || 'N/A',
          residenceDistrict: business?.residence_district || 'N/A',
          residencePincode: business?.residence_pincode || 'N/A',
          officeAddress: business?.office_address || 'N/A',
          officeCity: business?.office_city || 'N/A',
          officeDistrict: business?.office_district || 'N/A',
          officePincode: business?.office_pincode || 'N/A',
          joiningDate: business?.joining_date ? new Date(business.joining_date).toISOString().split('T')[0] : '',
          reference: business?.reference || '',
          // Assuming profilePicture and businessLogo are URLs or base64 strings
          profilePicture: user.profilePicture,
          businessLogo: business?.business_logo,
          businessCardFront: business?.business_card_front,
          businessCardBack: business?.business_card_back,
          portfolioImages: business?.portfolio_images || [],
        };
      });

      setUsers(combinedUsers);
      setAllCities(citiesData);
      setAllChapters(chaptersData); // Store all chapters for the filter dropdown
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      showToast(`Failed to load data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]); // Removed userId from dependency array

  // Fetch data when component mounts
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter users based on search term and new filters
  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCity === '' || user.city === filterCity) &&
    (filterChapter === '' || user.chapter === filterChapter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // --- Multi-step form logic (for editing only) ---
  const [showMultiStepForm, setShowMultiStepForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessServicesData, setBusinessServicesData] = useState(null); // New state to hold business service
  const [formData, setFormData] = useState({
    // Step 1 - Member Details
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    account_status: 'active', // Use account_status as per schema
    role: 'user', // Use role as per schema

    // Step 2 - Business Information
    city_id: '', // Store City ID
    chapter_id: '', // Store Chapter ID
    joiningDate: '', // This will be business.joining_date
    reference: '',
    business_name: '',
    profile_picture: null, // File input for user's profile picture
    business_logo: null, // File input for business logo

    // Step 3 - Add Your Business Services
    tagline: '',
    description: '',
    business_services: '', // Assuming this is the field name

    // Step 4 - Add Visiting Card & Portfolio Info
    business_card_front: null,
    business_card_back: null,
    portfolio_images: [], // Array of files

    // Step 5 - Add Your Hometown Address
    hometown_address: '',
    hometown_city: '',
    hometown_district: '',
    hometown_pincode: '',

    // Step 6 - Add Your Residence Address
    residence_address: '',
    residence_city: '',
    residence_district: '',
    residence_pincode: '',

    // Step 7 - Add Your Office Address
    office_address: '',
    office_city: '',
    office_district: '',
    office_pincode: '',

    // Step 8 - Add Your Contact Information
    personal_phone_number: '',
    office_phone_number: '',
    business_email: '', // Business email, distinct from user email
    web_url: ''
  });

  // Form validation state for multi-step form
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle input changes for multi-step form
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Memoized fetchChapters function to fetch chapters for a specific city
  const fetchChaptersForCity = useCallback(async (selectedCityId) => {
    if (!selectedCityId) {
      setFilteredChaptersForForm([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters/city/${selectedCityId}`);
      if (!response.ok) throw new Error('Failed to fetch chapters.');
      const data = await response.json();
      setFilteredChaptersForForm(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      showToast('Failed to load chapters for the selected city.', 'error');
      setFilteredChaptersForForm([]);
    }
  }, [showToast]);

  // Effect to fetch chapters when selected city in form changes
  useEffect(() => {
  const fetchAndSetChapters = async () => {
    if (formData.city_id) {
      await fetchChaptersForCity(formData.city_id);

      // Set chapter_id only if it's present (e.g., when editing user)
      if (formData.chapter_id) {
        setFormData(prev => ({ ...prev, chapter_id: formData.chapter_id }));
      }
    } else {
      setFilteredChaptersForForm([]);
    }
  };

  fetchAndSetChapters();
}, [formData.city_id, fetchChaptersForCity]);

  // Validate current step for multi-step form
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      case 2:
        if (!formData.city_id) newErrors.city_id = 'City is required';
        if (!formData.chapter_id) newErrors.chapter_id = 'Chapter is required';
        if (!formData.joiningDate) newErrors.joiningDate = 'Joining Date is required';
        if (!formData.business_name.trim()) newErrors.business_name = 'Business Name is required';
        break;
      case 3:
        if (!formData.tagline.trim()) newErrors.tagline = 'Business Tagline is required';
        if (!formData.description.trim()) newErrors.description = 'Business Description is required';
        if (!formData.business_services.trim()) newErrors.business_services = 'Business Services are required';
        break;
      case 4:
        // File inputs are optional, no validation needed here
        break;
      case 5:
        if (!formData.hometown_address.trim()) newErrors.hometown_address = 'Hometown Address is required';
        if (!formData.hometown_city.trim()) newErrors.hometown_city = 'Hometown City is required';
        if (!formData.hometown_district.trim()) newErrors.hometown_district = 'Hometown District is required';
        if (!formData.hometown_pincode.trim()) newErrors.hometown_pincode = 'Hometown Pincode is required';
        else if (!/^\d{6}$/.test(formData.hometown_pincode)) newErrors.hometown_pincode = 'Pincode must be 6 digits long';
        break;
      case 6:
        if (!formData.residence_address.trim()) newErrors.residence_address = 'Residence Address is required';
        if (!formData.residence_city.trim()) newErrors.residence_city = 'Residence City is required';
        if (!formData.residence_district.trim()) newErrors.residence_district = 'Residence District is required';
        if (!formData.residence_pincode.trim()) newErrors.residence_pincode = 'Residence Pincode is required';
        else if (!/^\d{6}$/.test(formData.residence_pincode)) newErrors.residence_pincode = 'Pincode must be 6 digits long';
        break;
      case 7:
        if (!formData.office_address.trim()) newErrors.office_address = 'Office Address is required';
        if (!formData.office_city.trim()) newErrors.office_city = 'Office City is required';
        if (!formData.office_district.trim()) newErrors.office_district = 'Office District is required';
        if (!formData.office_pincode.trim()) newErrors.office_pincode = 'Office Pincode is required';
        else if (!/^\d{6}$/.test(formData.office_pincode)) newErrors.office_pincode = 'Pincode must be 6 digits long';
        break;
      case 8:
        if (!formData.personal_phone_number.trim()) newErrors.personal_phone_number = 'Personal Phone Number is required';
        else if (!/^\d{10}$/.test(formData.personal_phone_number)) newErrors.personal_phone_number = 'Phone number must be 10 digits';
        if (!formData.office_phone_number.trim()) newErrors.office_phone_number = 'Office Phone Number is required';
        else if (!/^\d{10}$/.test(formData.office_phone_number)) newErrors.office_phone_number = 'Phone number must be 10 digits';
        if (!formData.business_email.trim()) newErrors.business_email = 'Business Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.business_email)) newErrors.business_email = 'Business Email address is invalid';
        if (!formData.web_url.trim()) newErrors.web_url = 'Business Website is required';
        else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.web_url)) newErrors.web_url = 'Business Website is invalid';
        break;
      default:
        break;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step for multi-step form
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 8) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Handle previous step for multi-step form
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Helper function to convert file to base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  // Handle multi-step form submission (for editing only)
  const handleSubmit = async () => {
    if (validateStep(8)) {
      showConfirmation(
        'Save Member Changes',
        'Are you sure you want to save changes for this member?',
        async () => {
          setLoading(true);
          setError(null);
          try {
            let userResponse;
            let businessResponse;

            const userPayload = {
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              dob: formData.dateOfBirth,
              account_status: formData.account_status,
              role: formData.role,
            };

            // Handle profile picture upload (if any)
            if (formData.profile_picture instanceof File) {
              userPayload.profilePicture = await toBase64(formData.profile_picture);
            }

            // Update user
            userResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${editingUserId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userPayload),
            });

            const userData = await userResponse.json();
            if (!userResponse.ok) throw new Error(userData.error || `Failed to update user.`);

            const userId = editingUserId;

            // Prepare business payload
            const businessPayload = {
              user_id: userId,
              city_id: formData.city_id,
              chapter_id: formData.chapter_id,
              business_name: formData.business_name,
              personal_phone_number: formData.personal_phone_number,
              office_phone_number: formData.office_phone_number,
              email: formData.business_email,
              web_url: formData.web_url,
              tagline: formData.tagline,
              joining_date: formData.joiningDate,
              description: formData.description,
              reference: formData.reference,
              // services_offered will be handled separately
              office_address: formData.office_address,
              office_city: formData.office_city,
              office_district: formData.office_district,
              office_pincode: formData.office_pincode,
              residence_address: formData.residence_address,
              residence_city: formData.residence_city,
              residence_district: formData.residence_district,
              residence_pincode: formData.residence_pincode,
              hometown_address: formData.hometown_address,
              hometown_city: formData.hometown_city,
              hometown_district: formData.hometown_district,
              hometown_pincode: formData.hometown_pincode,
            };

            // Handle file uploads for business
            if (formData.business_logo instanceof File) {
              businessPayload.business_logo = await toBase64(formData.business_logo);
            }
            if (formData.business_card_front instanceof File) {
              businessPayload.business_card_front = await toBase64(formData.business_card_front);
            }
            if (formData.business_card_back instanceof File) {
              businessPayload.business_card_back = await toBase64(formData.business_card_back);
            }
            if (formData.portfolio_images && formData.portfolio_images.length > 0) {
              businessPayload.portfolio_images = await Promise.all(
                Array.from(formData.portfolio_images).map(file => toBase64(file))
              );
            }

            // Check if business already exists for this user
            const existingBusiness = users.find(u => u.id === userId)?.business;
            if (existingBusiness && existingBusiness._id) {
              // Update business
              businessResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/businesses/${existingBusiness._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(businessPayload),
              });
            } else {
              // Create new business if none exists for the user
              businessResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/businesses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(businessPayload),
              });
            }

            const businessData = await businessResponse.json();
            if (!businessResponse.ok) throw new Error(businessData.error || `Failed to update business.`);

            const businessId = existingBusiness?._id || businessData.business._id;

            // Handle Business Services
            if (formData.business_services) {
                // If a service already exists, update it. Otherwise, create a new one.
                const servicePayload = {
                    business_id: businessId,
                    service_title: formData.business_services,
                };
                if (businessServicesData && businessServicesData.length > 0) {
                    const serviceId = businessServicesData[0]._id;
                    const serviceUpdateRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/business-services/${serviceId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(servicePayload),
                    });
                    if (!serviceUpdateRes.ok) {
                        const errorData = await serviceUpdateRes.json();
                        console.error('Error updating business service:', errorData.error);
                        showToast(`Warning: Member updated, but failed to update service: ${errorData.error}`, 'warn');
                    }
                } else {
                    const serviceCreateRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/business-services`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(servicePayload),
                    });
                    if (!serviceCreateRes.ok) {
                        const errorData = await serviceCreateRes.json();
                        console.error('Error creating business service:', errorData.error);
                        showToast(`Warning: Member updated, but failed to create new service: ${errorData.error}`, 'warn');
                    }
                }
            }


            showToast('Member updated successfully!', 'success');
            setShowSuccess(true);

            // Fetch all data again to update the UI
            await fetchAllData();

            setTimeout(() => {
              setShowSuccess(false);
              setShowMultiStepForm(false);
              setIsEditing(false);
              setEditingUserId(null);
              setCurrentStep(1);
              setFormData({
                firstName: '', lastName: '', email: '', dateOfBirth: '', password: '', confirmPassword: '',
                account_status: 'active', role: 'user',
                city_id: '', chapter_id: '', joiningDate: '', reference: '',
                business_name: '', profile_picture: null, business_logo: null,
                tagline: '', description: '', business_services: '',
                business_card_front: null, business_card_back: null, portfolio_images: [],
                hometown_address: '', hometown_city: '', hometown_district: '', hometown_pincode: '',
                residence_address: '', residence_city: '', residence_district: '', residence_pincode: '',
                office_address: '', office_city: '', office_district: '', office_pincode: '',
                personal_phone_number: '', office_phone_number: '', business_email: '', web_url: ''
              });
              setFormErrors({});
              setBusinessServicesData(null);
            }, 3000);

          } catch (err) {
            console.error("Submission error:", err);
            setError(err.message);
            showToast(`Error: ${err.message}`, 'error');
            setLoading(false);
          }
        },
        () => {
          // Action on confirmation cancel
        }
      );
    }
  };

  // Handle toggling active status
  const handleToggleActive = useCallback((userId, currentAccountStatus) => {
    // Determine the new status based on the current account_status
    // If current is 'active' or 'approved', new status will be 'inactive'. Otherwise, 'active'.
    const newStatus = (currentAccountStatus === 'active' || currentAccountStatus === 'approved') ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';

    showConfirmation(
      `Confirm ${action} user`,
      `Are you sure you want to ${action} this user?`,
      async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_status: newStatus }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || `Failed to ${action} user.`);
          showToast(`User successfully ${action}d!`, 'success');
          await fetchAllData(); // Fetch data again to update UI
        } catch (err) {
          console.error("Toggle active error:", err);
          setError(err.message);
          showToast(`Error toggling status: ${err.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    );
  }, [API_BASE_URL, fetchAllData, showToast, showConfirmation]);

  // Handle deleting a user
  const handleDeleteUser = useCallback((userId) => {
    showConfirmation(
      'Delete User',
      'Are you sure you want to delete this user and their associated business data? This action cannot be undone.',
      async () => {
        setLoading(true);
        setError(null);
        try {
          // Find associated business ID
          const userToDelete = users.find(u => u.id === userId);
          const businessId = userToDelete?.business?._id;

          // Delete user
          const userDeleteRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
          });
          const userDeleteData = await userDeleteRes.json();
          if (!userDeleteRes.ok) throw new Error(userDeleteData.error || 'Failed to delete user.');

          // Delete associated business if it exists
          if (businessId) {
            const businessDeleteRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/businesses/${businessId}`, {
              method: 'DELETE',
            });
            const businessDeleteData = await businessDeleteRes.json();
            if (!businessDeleteRes.ok) console.warn('Failed to delete associated business:', businessDeleteData.error);
          }

          showToast('User and associated business successfully deleted!', 'success');
          await fetchAllData(); // Fetch data again to update UI
        } catch (err) {
          console.error("User delete error:", err);
          setError(err.message);
          showToast(`Error deleting user: ${err.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    );
  }, [API_BASE_URL, fetchAllData, showToast, showConfirmation, users]);

  // Handle changing password
  const handleChangePassword = (userId) => {
    const errors = {};
    if (!passwordData.newPassword) errors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters long';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      showConfirmation(
        'Change Password',
        'Are you sure you want to change this user\'s password?',
        async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/change-password/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newPassword: passwordData.newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to change password.');
            showToast('Password changed successfully!', 'success');
            setShowChangePassword(null);
            setPasswordData({ newPassword: '', confirmPassword: '' });
            await fetchAllData();
          } catch (err) {
            console.error("Error changing password:", err);
            setError(err.message);
            showToast(`Error changing password: ${err.message}`, 'error');
          } finally {
            setLoading(false);
          }
        }
      );
    }
  };

  // Handle editing a user (opens multi-step form)
  const handleEditUser = useCallback(async (user) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setLoading(true);

    let fetchedBusinessServices = '';
    const businessId = user.business?._id;
    if (businessId) {
      try {
        // Fetch all services for the business ID
        const servicesRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/business-services/business/${businessId}`);
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setBusinessServicesData(servicesData); // Store the full service object
          if (servicesData.length > 0) {
            // Join all service titles into a single string for the form input
            fetchedBusinessServices = servicesData.map(service => service.service_title).join(', ');
          }
        } else {
          console.warn('No services found for this business.');
        }
      } catch (err) {
        console.error('Error fetching business services:', err);
      }
    }

    setLoading(false);

    // Map user data to form data
    setFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      dateOfBirth: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      account_status: user.account_status || 'active',
      role: user.role || 'user',
      password: '', // Passwords are not pre-filled for security
      confirmPassword: '',

      // Business fields
      // Ensure that if business.city_id or business.chapter_id are objects, you extract their _id
      city_id: user.business?.city_id?._id || '',
      chapter_id: user.business?.chapter_id?._id || '',
      joiningDate: user.business?.joining_date ? new Date(user.business.joining_date).toISOString().split('T')[0] : '',
      reference: user.business?.reference || '',
      business_name: user.business?.business_name || '',
      profile_picture: null, // Files are not pre-filled
      business_logo: null,
      tagline: user.business?.tagline || '',
      description: user.business?.description || '',
      business_services: fetchedBusinessServices,
      business_card_front: null,
      business_card_back: null,
      portfolio_images: [],
      hometown_address: user.business?.hometown_address || '',
      hometown_city: user.business?.hometown_city || '',
      hometown_district: user.business?.hometown_district || '',
      hometown_pincode: user.business?.hometown_pincode || '',
      residence_address: user.business?.residence_address || '',
      residence_city: user.business?.residence_city || '',
      residence_district: user.business?.residence_district || '',
      residence_pincode: user.business?.residence_pincode || '',
      office_address: user.business?.office_address || '',
      office_city: user.business?.office_city || '',
      office_district: user.business?.office_district || '',
      office_pincode: user.business?.office_pincode || '',
      personal_phone_number: user.business?.personal_phone_number || '',
      office_phone_number: user.business?.office_phone_number || '',
      business_email: user.business?.email || '',
      web_url: user.business?.web_url || '',
    });
    setCurrentStep(1);
    setShowMultiStepForm(true);
  }, [setFormData, setEditingUserId, setIsEditing, setShowMultiStepForm, API_BASE_URL]);

  // Success animation component
  const SuccessAnimation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transform animate-scale-in">
        {/* Animated success icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
              <IconSet.Check className="text-white text-4xl" />
            </div>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-24 h-24 bg-green-300 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Success content */}
        <h3 className="text-3xl font-bold text-gray-800 mb-3 animate-slide-up">🎉 Success!</h3>
        <p className="text-gray-600 mb-6 text-lg animate-slide-up">
          Member account updated successfully.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full animate-progress" style={{ width: '100%' }}></div>
        </div>

        {/* Completion message */}
        <p className="text-sm text-green-600 font-medium animate-fade-in-delay">Redirecting you to the user list...</p>
      </div>
    </div>
  );

  // Desktop step progress indicator
  const DesktopStepIndicator = () => (
    <div className="mb-8 hidden lg:block">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep ? 'bg-blue-500 text-white' :
              step < currentStep ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
              {step < currentStep ? <IconSet.Check /> : step}
            </div>
            {step < 8 && (
              <div className={`h-0.5 w-8 md:w-16 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Step {currentStep}: {
            currentStep === 1 ? 'Member Details' :
              currentStep === 2 ? 'Business Information' :
                currentStep === 3 ? 'Add Your Business Services' :
                  currentStep === 4 ? 'Add Visiting Card & Portfolio Info' :
                    currentStep === 5 ? 'Add Your Hometown Address' :
                      currentStep === 6 ? 'Add Your Residence Address' :
                        currentStep === 7 ? 'Add Your Office Address' :
                          'Add Your Contact Information'
          }
        </h3>
      </div>
    </div>
  );

  // Mobile step indicator
  const MobileStepIndicator = () => (
    <div className="mb-8 lg:hidden text-center">
      <h3 className="text-lg font-semibold text-gray-800">
        Step {currentStep} of 8
      </h3>
    </div>
  );

  // Render form step content for multi-step form
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter first name"
                />
                {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter last name"
                />
                {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter email address"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {formErrors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Status *</label>
                <select
                  value={formData.account_status}
                  onChange={(e) => handleInputChange('account_status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleInputChange('profile_picture', e.target.files[0])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2. Business Information
            </h2>

            {/* City and Chapter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <select
                  value={formData.city_id}
                  onChange={(e) => handleInputChange('city_id', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.city_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select City</option>
                  {allCities.map((city) => (
                    <option key={city._id} value={city._id}>{city.name}</option>
                  ))}
                </select>
                {formErrors.city_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chapter *</label>
                <select
                  value={formData.chapter_id}
                  onChange={(e) => handleInputChange('chapter_id', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.chapter_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Chapter</option>
                  {filteredChaptersForForm.map((chapter) => (
                    <option key={chapter._id} value={chapter._id}>{chapter.name}</option>
                  ))}
                </select>
                {formErrors.chapter_id && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.chapter_id}</p>
                )}
              </div>
            </div>

            {/* Joining Date, Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.joiningDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {formErrors.joiningDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.joiningDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reference"
                />
              </div>
            </div>

            {/* Business Name and Business Logo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.business_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter business name"
                />
                {formErrors.business_name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.business_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('business_logo', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Add Your Business Services</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Tagline *</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.tagline ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter business tagline"
              />
              {formErrors.tagline && <p className="text-red-500 text-sm mt-1">{formErrors.tagline}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="4"
                placeholder="Enter business description"
              />
              {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Services *</label>
              <input
                type="text"
                value={formData.business_services}
                onChange={(e) => handleInputChange('business_services', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.business_services ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter business services"
              />
              {formErrors.business_services && <p className="text-red-500 text-sm mt-1">{formErrors.business_services}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Add Visiting Card & Portfolio Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Card (Front) (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('business_card_front', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Card (Back) (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('business_card_back', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Images (Optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleInputChange('portfolio_images', Array.from(e.target.files))} // Convert FileList to Array
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">You can select multiple images</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Add Your Hometown Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hometown Address *</label>
              <textarea
                value={formData.hometown_address}
                onChange={(e) => handleInputChange('hometown_address', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.hometown_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="3"
                placeholder="Enter hometown address"
              />
              {formErrors.hometown_address && <p className="text-red-500 text-sm mt-1">{formErrors.hometown_address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Town *</label>
                <input
                  type="text"
                  value={formData.hometown_city}
                  onChange={(e) => handleInputChange('hometown_city', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.hometown_city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter city/town"
                />
                {formErrors.hometown_city && <p className="text-red-500 text-sm mt-1">{formErrors.hometown_city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                <input
                  type="text"
                  value={formData.hometown_district}
                  onChange={(e) => handleInputChange('hometown_district', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.hometown_district ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter district"
                />
                {formErrors.hometown_district && <p className="text-red-500 text-sm mt-1">{formErrors.hometown_district}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                value={formData.hometown_pincode}
                onChange={(e) => handleInputChange('hometown_pincode', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.hometown_pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter pincode"
              />
              {formErrors.hometown_pincode && <p className="text-red-500 text-sm mt-1">{formErrors.hometown_pincode}</p>}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Add Your Residence Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Residence Address *</label>
              <textarea
                value={formData.residence_address}
                onChange={(e) => handleInputChange('residence_address', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.residence_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="3"
                placeholder="Enter residence address"
              />
              {formErrors.residence_address && <p className="text-red-500 text-sm mt-1">{formErrors.residence_address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Town *</label>
                <input
                  type="text"
                  value={formData.residence_city}
                  onChange={(e) => handleInputChange('residence_city', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.residence_city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter city/town"
                />
                {formErrors.residence_city && <p className="text-red-500 text-sm mt-1">{formErrors.residence_city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                <input
                  type="text"
                  value={formData.residence_district}
                  onChange={(e) => handleInputChange('residence_district', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.residence_district ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter district"
                />
                {formErrors.residence_district && <p className="text-red-500 text-sm mt-1">{formErrors.residence_district}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                value={formData.residence_pincode}
                onChange={(e) => handleInputChange('residence_pincode', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.residence_pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter pincode"
              />
              {formErrors.residence_pincode && <p className="text-red-500 text-sm mt-1">{formErrors.residence_pincode}</p>}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Add Your Office Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Address *</label>
              <textarea
                value={formData.office_address}
                onChange={(e) => handleInputChange('office_address', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.office_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="3"
                placeholder="Enter office address"
              />
              {formErrors.office_address && <p className="text-red-500 text-sm mt-1">{formErrors.office_address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Town *</label>
                <input
                  type="text"
                  value={formData.office_city}
                  onChange={(e) => handleInputChange('office_city', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.office_city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter city/town"
                />
                {formErrors.office_city && <p className="text-red-500 text-sm mt-1">{formErrors.office_city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                <input
                  type="text"
                  value={formData.office_district}
                  onChange={(e) => handleInputChange('office_district', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.office_district ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter district"
                />
                {formErrors.office_district && <p className="text-red-500 text-sm mt-1">{formErrors.office_district}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                type="text"
                value={formData.office_pincode}
                onChange={(e) => handleInputChange('office_pincode', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.office_pincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter pincode"
              />
              {formErrors.office_pincode && <p className="text-red-500 text-sm mt-1">{formErrors.office_pincode}</p>}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Add Your Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Phone Number *</label>
                <input
                  type="tel"
                  value={formData.personal_phone_number}
                  onChange={(e) => handleInputChange('personal_phone_number', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.personal_phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter personal phone number"
                />
                {formErrors.personal_phone_number && <p className="text-red-500 text-sm mt-1">{formErrors.personal_phone_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Phone Number *</label>
                <input
                  type="tel"
                  value={formData.office_phone_number}
                  onChange={(e) => handleInputChange('office_phone_number', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.office_phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter office phone number"
                />
                {formErrors.office_phone_number && <p className="text-red-500 text-sm mt-1">{formErrors.office_phone_number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Email *</label>
                <input
                  type="email"
                  value={formData.business_email}
                  onChange={(e) => handleInputChange('business_email', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.business_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter business email"
                />
                {formErrors.business_email && <p className="text-red-500 text-sm mt-1">{formErrors.business_email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Website *</label>
                <input
                  type="url"
                  value={formData.web_url}
                  onChange={(e) => handleInputChange('web_url', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.web_url ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter business website"
                />
                {formErrors.web_url && <p className="text-red-500 text-sm mt-1">{formErrors.web_url}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans lg:ml-[250px] lg:mt-[75px] sm:mt-[80px] mt-[80px]">
      {/* Link to Bootstrap Icons CSS */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white max-w-sm w-full
          ${toastMessage.severity === 'success' ? 'bg-green-500' : ''}
          ${toastMessage.severity === 'info' ? 'bg-blue-500' : ''}
          ${toastMessage.severity === 'warn' ? 'bg-yellow-500' : ''}
          ${toastMessage.severity === 'error' ? 'bg-red-500' : ''}
        `}>
          {toastMessage.severity === 'success' && <IconSet.CheckCircle />}
          {toastMessage.severity === 'info' && <IconSet.Info />}
          {toastMessage.severity === 'warn' && <IconSet.AlertTriangle />}
          {toastMessage.severity === 'error' && <IconSet.XCircle />}
          <div className="flex-1">
            <div className="font-bold text-lg">{toastMessage.severity.charAt(0).toUpperCase() + toastMessage.severity.slice(1)}</div>
            <div className="text-sm">{toastMessage.message}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white"
          >
            <IconSet.X />
          </button>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 w-11/12 max-w-md mx-auto">
            <div className="text-2xl font-semibold text-gray-800 pb-4 mb-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold">{confirmationDialog.header}</h3>
              <IconSet.AlertTriangle className="text-red-500 text-3xl" />
            </div>
            <div className="text-gray-700 py-4 text-lg">
              {confirmationDialog.message}
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  confirmationDialog.onCancel();
                  setConfirmationDialog(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmationDialog.onConfirm();
                  setConfirmationDialog(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Header and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <IconSet.Users className="text-blue-500 mr-4 w-4 h-4" />
            <span>User Management</span>
          </h1>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="text-sm sm:text-base text-gray-600 text-center sm:text-right">
              Total Users: <span className="text-blue-600 font-semibold">{users.length}</span> |
              Active: <span className="text-green-600 font-semibold">{users.filter(u => u.account_status === 'active' || u.account_status === 'approved').length}</span> |
              Inactive: <span className="text-red-600 font-semibold">{users.filter(u => u.account_status === 'inactive' || u.account_status === 'rejected').length}</span>
            </div>
            <Link
              to="/addmember"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 shadow-md"
            >
              <IconSet.Plus />
              <span>Add Member</span>
            </Link>
          </div>
        </div>


        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full p-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <IconSet.Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              id="city-filter"
              value={filterCity}
              onChange={(e) => {
                setFilterCity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">All Cities</option>
              {allCities.map(city => (
                <option key={city._id} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <label htmlFor="chapter-filter" className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
            <select
              id="chapter-filter"
              value={filterChapter}
              onChange={(e) => {
                setFilterChapter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">All Chapters</option>
              {allChapters.map(chapter => (
                <option key={chapter._id} value={chapter.name}>{chapter.name}</option>
              ))}
            </select>
          </div>

          {/* Show Entries */}
          <div>
            <label htmlFor="items-per-page" className="block text-sm font-medium text-gray-700 mb-1">Show Entries</label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>


      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading data...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Error: {error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sr.</th>
                <th className="w-48 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="w-48 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Business Name</th>
                <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chapter</th>
                <th className="w-32 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Business Profile Status</th>
                <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="w-40 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-4 text-sm text-gray-800">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3 shadow-sm">
                          {user.first_name ? user.first_name.charAt(0).toUpperCase() : ''}{user.last_name ? user.last_name.charAt(0).toUpperCase() : ''}
                        </div>
                        <div className="text-sm font-medium text-gray-900 truncate" title={user.name}>
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 truncate" title={user.businessName}>
                      {user.businessName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 truncate" title={user.city}>
                      {user.city}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 truncate" title={user.chapter}>
                      {user.chapter}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.businessProfileStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {user.businessProfileStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm flex space-x-1">
                      <button
                        onClick={() => setViewUser(user)}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors duration-150"
                        title="View Details"
                      >
                        <IconSet.View />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors duration-150"
                        title="Edit"
                      >
                        <IconSet.Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                        title="Delete"
                      >
                        <IconSet.Delete />
                      </button>
                      <button
                        onClick={() => setShowChangePassword(user.id)}
                        className="text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-50 transition-colors duration-150"
                        title="Change Password"
                      >
                        <IconSet.Lock />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-500 text-lg">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}


        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
          </div>

          <div className="flex items-center space-x-3">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-600 hover:underline'
                }`}
            >
              <i className="bi bi-chevron-left"></i>
              <span>Previous</span>
            </button>

            {/* Page Input and Total */}
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                  setCurrentPage(page);
                }}
                className="w-12 h-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-500">of {totalPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-600 hover:underline'
                }`}
            >
              <span>Next</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

      </div>

      {/* Multi-step Edit Member Modal */}
      {showMultiStepForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Edit Member</h3>
              <button onClick={() => {
                setShowMultiStepForm(false);
              }} className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors">
                <IconSet.X className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              {/* Conditional rendering for step indicators */}
              <DesktopStepIndicator />
              <MobileStepIndicator />

              <div className="mt-8">
                {renderStepContent()}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between space-x-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg transition-colors ${currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Previous
              </button>

              {currentStep < 8 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success animation for multi-step form submission */}
      {showSuccess && <SuccessAnimation />}


      {/* Change Password Modal (kept as a separate modal) */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <IconSet.Lock className="mr-3 text-blue-500" />
                <span>Change User Password</span>
              </h3>
              <button onClick={() => setShowChangePassword(null)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors">
                <IconSet.X className="text-2xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } transition duration-200`}
                  placeholder="Enter new password"
                />
                {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } transition duration-200`}
                  placeholder="Confirm new password"
                />
                {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowChangePassword(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2 shadow-sm"
              >
                <IconSet.Close />
                <span>Cancel</span>
              </button>
              <button
                onClick={() => handleChangePassword(showChangePassword)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 shadow-md"
              >
                <IconSet.Lock />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <IconSet.View className="mr-3 text-blue-500" />
                User Details - {viewUser.name}
              </h3>
              <button onClick={() => setViewUser(null)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors">
                <IconSet.X className="text-2xl" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                  <IconSet.Profile className="mr-3 text-blue-500" />
                  Personal Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.dob ? new Date(viewUser.dob).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personal Phone Number</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.personalPhoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Email (Business)</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.email2 || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                  <IconSet.City className="mr-3 text-blue-500" />
                  Business Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.businessName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Profile Status</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.businessProfileStatus}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Tagline</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.businessTagline || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.descriptionOfBusiness || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Services</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.businessServices || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Website</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.businessWebsite || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Phone Number</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.officePhoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                  <IconSet.City className="mr-3 text-blue-500" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Hometown Address */}
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                    <h5 className="font-semibold text-gray-700">Hometown Address</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.hometownAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.hometownCity || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.hometownDistrict || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.hometownPincode || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Residence Address */}
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                    <h5 className="font-semibold text-gray-700">Residence Address</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.residenceAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.residenceCity || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.residenceDistrict || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.residencePincode || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
                    <h5 className="font-semibold text-gray-700">Office Address</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.officeAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.officeCity || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.officeDistrict || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <p className="text-gray-800 p-2 bg-white rounded-lg">{viewUser.officePincode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account and Other Information */}
              <div className="lg:col-span-2 space-y-6">
                <h4 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                  <IconSet.Settings className="mr-3 text-blue-500" />
                  Account and Other Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City (Primary)</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.chapter}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.joiningDate ? new Date(viewUser.joiningDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.reference || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-800 p-3 bg-gray-50 rounded-lg font-medium">{viewUser.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${viewUser.account_status === 'active' || viewUser.account_status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {viewUser.account_status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Profile Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${viewUser.businessProfileStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {viewUser.businessProfileStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setViewUser(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2 shadow-sm"
              >
                <IconSet.Close />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Animations for modals */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-fade-in-delay { animation: fade-in 0.5s ease-out 0.5s forwards; }
        .animate-progress { animation: progress 2.5s linear forwards; }
      `}</style>
    </div>
  );
};

export default Users;