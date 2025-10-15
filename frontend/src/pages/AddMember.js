import React, { useState, useEffect, useCallback } from 'react';
 
const AddMember = () => { 
  const Icons = {
    CheckCircle: () => (<i className="bi bi-check-circle-fill text-xl mr-3"></i>),
    Info: () => (<i className="bi bi-info-circle-fill text-xl mr-3"></i>),
    AlertTriangle: () => (<i className="bi bi-exclamation-triangle-fill text-xl mr-3"></i>),
    XCircle: () => (<i className="bi bi-x-circle-fill text-xl mr-3"></i>),
    X: () => (<i className="bi bi-x text-xl"></i>),
    Eye: () => (<i className="bi bi-eye w-5 h-5"></i>),
    EyeSlash: () => (<i className="bi bi-eye-slash w-5 h-5"></i>),
    Check: () => (<i className="bi bi-check-lg w-5 h-5"></i>),
  };
 
  const [currentStep, setCurrentStep] = useState(1);
  const [cities, setCities] = useState([]); 
  const [filteredChapters, setFilteredChapters] = useState([]); 
  const [userId, setUserId] = useState(null);  

  const [members, setMembers] = useState({ 
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
  });

  const [formData, setFormData] = useState({
    // Steps 2 to 8 
    city: '', 
    chapter: '',  
    joiningDate: '',
    reference: '',
    businessProfile: null, 
    businessLogo: null,  
    businessName: '',

    // Step 3  
    businessTagline: '',
    descriptionOfBusiness: '',
    businessServices: '',  

    // Step 4  
    businessCardFront: null,
    businessCardBack: null,
    portfolioImages: [],

    // Step 5 
    hometownAddress: '',
    hometownCity: '',
    hometownDistrict: '',
    hometownPincode: '',

    // Step 6 - Add Your Residence Address
    residenceAddress: '',
    residenceCity: '',
    residenceDistrict: '',
    residencePincode: '',

    // Step 7 - Add Your Office Address
    officeAddress: '',
    officeCity: '',
    officeDistrict: '',
    officePincode: '',

    // Step 8 - Add Your Contact Information
    personalPhoneNumber: '',
    officePhoneNumber: '',
    email2: '',  
    businessWebsite: ''
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState(null);
  // Custom Confirmation Dialog State
  const [confirmationDialog, setConfirmationDialog] = useState(null);

  // showToast function memoized to prevent re-renders
  const showToast = useCallback((message, severity = 'info') => {
    setToastMessage({ message, severity });
  }, []); // Empty dependency array means this function is created once

  // Effect to auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // showConfirmation function
  const showConfirmation = (header, message, acceptCallback, rejectCallback) => {
    setConfirmationDialog({
      header,
      message,
      onConfirm: acceptCallback,
      onCancel: rejectCallback || (() => { }),
    });
  };

  // Memoized fetchChapters function to fetch chapters for a specific city
  const fetchChaptersForCity = useCallback(async (selectedCityId) => {
    if (!selectedCityId) {
      setFilteredChapters([]);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters/city/${selectedCityId}`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const data = await response.json();
      setFilteredChapters(data); // Set the chapters for the selected city
    } catch (error) {
      console.error('Error fetching chapters:', error);
      showToast('Failed to load chapters', 'error');
      setFilteredChapters([]);
    }
  }, [showToast]);

  // Fetch cities only once on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities/`);
        const data = await response.json();
        // Only update if data is different to prevent infinite re-renders
        setCities(currentCities => {
          if (JSON.stringify(currentCities) === JSON.stringify(data)) {
            return currentCities;
          }
          return data;
        });
      } catch (error) {
        console.error('Error fetching cities:', error);
        showToast('Failed to load cities', 'error');
      }
    };
    fetchCities();
  }, [showToast]); // showToast is now a stable reference

  // Effect to fetch chapters when the selected city changes
  useEffect(() => {
    if (formData.city) {
      const selectedCity = cities.find(city => city.name === formData.city);
      if (selectedCity) {
        fetchChaptersForCity(selectedCity._id);
      } else {
        setFilteredChapters([]); // If city not found, clear chapters
      }
    } else {
      setFilteredChapters([]); // If no city is selected, clear chapters
    }
    setFormData(prev => ({ ...prev, chapter: '' })); // Reset chapter when city changes
  }, [formData.city, cities, fetchChaptersForCity, setFormData]);


  // Helper function to convert file to Base64 string
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null); // Resolve null if no file
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle input changes (for both members and formData)
  const handleInputChange = (stateName, field, value) => {
    if (stateName === 'members') {
      setMembers({ ...members, [field]: value });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Handle file input changes
  const handleFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  // Handle multiple file input changes (for portfolioImages)
  const handleMultipleFilesChange = (field, files) => {
    setFormData({ ...formData, [field]: Array.from(files) });
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!members.firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!members.lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!members.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(members.email)) newErrors.email = 'Email address is invalid';
        if (!members.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
        if (!members.password) newErrors.password = 'Password is required';
        else if (members.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (members.password !== members.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
      case 2:
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.chapter) newErrors.chapter = 'Chapter is required';
        if (!formData.joiningDate) newErrors.joiningDate = 'Joining Date is required';
        if (!formData.businessName.trim()) newErrors.businessName = 'Business Name is required';
        break;
      case 3:
        if (!formData.businessTagline.trim()) newErrors.businessTagline = 'Business Tagline is required';
        if (!formData.descriptionOfBusiness.trim()) newErrors.descriptionOfBusiness = 'Description of Business is required';
        if (!formData.businessServices.trim()) newErrors.businessServices = 'Business Services is required';
        break;
      case 4:
        // File inputs are optional, so no validation here
        break;
      case 5:
        if (!formData.hometownAddress.trim()) newErrors.hometownAddress = 'Hometown Address is required';
        if (!formData.hometownCity.trim()) newErrors.hometownCity = 'City/Village is required';
        if (!formData.hometownPincode.trim()) newErrors.hometownPincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.hometownPincode)) newErrors.hometownPincode = 'Pincode must be 6 digits';
        break;
      case 6:
        if (!formData.residenceAddress.trim()) newErrors.residenceAddress = 'Residential Address is required';
        if (!formData.residenceCity.trim()) newErrors.residenceCity = 'City/Village is required';
        if (!formData.residencePincode.trim()) newErrors.residencePincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.residencePincode)) newErrors.residencePincode = 'Pincode must be 6 digits';
        break;
      case 7:
        if (!formData.officeAddress.trim()) newErrors.officeAddress = 'Office Address is required';
        if (!formData.officeCity.trim()) newErrors.officeCity = 'City/Village is required';
        if (!formData.officePincode.trim()) newErrors.officePincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.officePincode)) newErrors.officePincode = 'Pincode must be 6 digits';
        break;
      case 8:
        if (!formData.personalPhoneNumber.trim()) newErrors.personalPhoneNumber = 'Personal Phone Number is required';
        else if (!/^\d{10}$/.test(formData.personalPhoneNumber)) newErrors.personalPhoneNumber = 'Phone number must be 10 digits';
        if (!formData.officePhoneNumber.trim()) newErrors.officePhoneNumber = 'Office Phone Number is required';
        else if (!/^\d{10}$/.test(formData.officePhoneNumber)) newErrors.officePhoneNumber = 'Phone number must be 10 digits';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        // Step 1: Create User
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: members.firstName,
              last_name: members.lastName,
              email: members.email,
              dob: members.dateOfBirth,
              password: members.password,
              role: "member" // Set 'member' as default role
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
          }

          const userData = await response.json();
          setUserId(userData.user._id); // Store user ID
          setCurrentStep(currentStep + 1);
          showToast('Member details saved successfully!', 'success');
        } catch (error) {
          console.error('Error creating user:', error);
          showToast(`Error: ${error.message}`, 'error');
        }
      } else if (currentStep < 8) {
        setCurrentStep(currentStep + 1);
        showToast(`Step ${currentStep + 1} completed!`, 'success');
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission (Final step: Create Business)
  const handleSubmit = async () => {
    if (validateStep(8)) {
      showConfirmation(
        'Create Member Account',
        'Are you sure you want to create this member account with the provided information?',
        async () => {
          try {
            // Convert files to Base64
            const businessProfileBase64 = await convertFileToBase64(formData.businessProfile);
            const businessLogoBase64 = await convertFileToBase64(formData.businessLogo);
            const businessCardFrontBase64 = await convertFileToBase64(formData.businessCardFront);
            const businessCardBackBase64 = await convertFileToBase64(formData.businessCardBack);
            const portfolioImagesBase64 = await Promise.all(
              formData.portfolioImages.map(file => convertFileToBase64(file))
            );

            // Find city and chapter IDs
            const selectedCity = cities.find(city => city.name === formData.city);
            const selectedChapter = filteredChapters.find(chapter => chapter.name === formData.chapter);

            // Create business data object
            const businessData = {
              user_id: userId, // User ID obtained from Step 1
              city_id: selectedCity ? selectedCity._id : null,
              chapter_id: selectedChapter ? selectedChapter._id : null,
              business_name: formData.businessName,
              personal_phone_number: formData.personalPhoneNumber,
              office_phone_number: formData.officePhoneNumber,
              email: formData.email2, // Business email
              web_url: formData.businessWebsite,
              tagline: formData.businessTagline,
              profile_picture: businessProfileBase64,
              business_logo: businessLogoBase64,
              joining_date: formData.joiningDate,
              description: formData.descriptionOfBusiness,
              services_offered: formData.businessServices, // New field
              reference: formData.reference,
              business_card_front: businessCardFrontBase64,
              business_card_back: businessCardBackBase64,
              portfolio_images: portfolioImagesBase64.filter(Boolean), // Filter out empty strings
              office_address: formData.officeAddress,
              office_city: formData.officeCity,
              office_district: formData.officeDistrict,
              office_pincode: formData.officePincode,
              office_latitude: 0, // Dummy value
              office_longitude: 0, // Dummy value
              residence_address: formData.residenceAddress,
              residence_city: formData.residenceCity,
              residence_district: formData.residenceDistrict,
              residence_pincode: formData.residencePincode,
              residence_latitude: 0, // Dummy value
              residence_longitude: 0, // Dummy value
              hometown_address: formData.hometownAddress,
              hometown_city: formData.hometownCity,
              hometown_district: formData.hometownDistrict,
              hometown_pincode: formData.hometownPincode,
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/businesses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(businessData),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to create business');
            }

            // Show success animation
            setShowSuccess(true);
            showToast('Member account created successfully!', 'success');

            // Hide success animation after 3 seconds and reset form
            setTimeout(() => {
              setShowSuccess(false);
              setCurrentStep(1);
              setMembers({ // Reset member details
                firstName: '', lastName: '', email: '', dateOfBirth: '', password: '', confirmPassword: '',
              });
              setFormData({ // Reset business details
                city: '', chapter: '', joiningDate: '', reference: '', businessProfile: null, businessLogo: null, businessName: '',
                businessTagline: '', descriptionOfBusiness: '', businessServices: '',
                businessCardFront: null, businessCardBack: null, portfolioImages: [],
                hometownAddress: '', hometownCity: '', hometownDistrict: '', hometownPincode: '',
                residenceAddress: '', residenceCity: '', residenceDistrict: '', residencePincode: '',
                officeAddress: '', officeCity: '', officeDistrict: '', officePincode: '',
                personalPhoneNumber: '', officePhoneNumber: '', email2: '', businessWebsite: ''
              });
              setErrors({}); // Clear errors on successful submission
              setUserId(null); // Reset user ID
            }, 3000);
          } catch (error) {
            console.error("Error submitting form:", error);
            showToast(`Error: ${error.message}`, 'error');
          }
        },
        () => {
          showToast('Member account creation cancelled.', 'info');
        }
      );
    }
  };

  // Enhanced Success Animation Component with center screen animation
  const SuccessAnimation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl transform animate-scale-in">
        {/* Animated Success Icon */}
        <div className="relative">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
              <Icons.Check className="text-white text-4xl" />
            </div>
          </div>
          {/* Ripple Effect */}
          <div className="absolute inset-0 w-24 h-24 bg-green-300 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Success Content */}
        <h3 className="text-3xl font-bold text-gray-800 mb-3 animate-slide-up">🎉 Success!</h3>
        <p className="text-gray-600 mb-6 text-lg animate-slide-up">Member account has been created successfully.</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full animate-progress" style={{ width: '100%' }}></div>
        </div>

        {/* Completion Message */}
        <p className="text-sm text-green-600 font-medium animate-fade-in-delay">Redirecting you back to form...</p>
      </div>
    </div>
  );

  // Step progress indicator for desktop
  const DesktopStepIndicator = () => (
    <div className="mb-8 hidden lg:block">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep ? 'bg-blue-500 text-white' :
                step < currentStep ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
              }`}>
              {step < currentStep ? <Icons.Check /> : step}
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
                currentStep === 3 ? 'Add Your Business services' :
                  currentStep === 4 ? 'Add Visiting Card And Portfolio Information' :
                    currentStep === 5 ? 'Add Your Hometown Address' :
                      currentStep === 6 ? 'Add Your Residence Address' :
                        currentStep === 7 ? 'Add Your Office Address' :
                          'Add Your Contact Information'
          }
        </h3>
      </div>
    </div>
  );

  // Step indicator for mobile
  const MobileStepIndicator = () => (
    <div className="mb-8 lg:hidden text-center">
      <h3 className="text-lg font-semibold text-gray-800">
        Step {currentStep} of 8
      </h3>
    </div>
  );

  // Render form step content
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
                  value={members.firstName}
                  onChange={(e) => handleInputChange('members', 'firstName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={members.lastName}
                  onChange={(e) => handleInputChange('members', 'lastName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={members.email}
                  onChange={(e) => handleInputChange('members', 'email', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={members.dateOfBirth}
                  onChange={(e) => handleInputChange('members', 'dateOfBirth', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={members.password}
                    onChange={(e) => handleInputChange('members', 'password', e.target.value)}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Icons.EyeSlash /> : <Icons.Eye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={members.confirmPassword}
                    onChange={(e) => handleInputChange('members', 'confirmPassword', e.target.value)}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <Icons.EyeSlash /> : <Icons.Eye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('formData', 'city', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city._id} value={city.name}>{city.name}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chapter *</label>
                <select
                  value={formData.chapter}
                  onChange={(e) => handleInputChange('formData', 'chapter', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.chapter ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={!formData.city} // Disable until city is selected
                >
                  <option value="">Select Chapter</option>
                  {filteredChapters.map(chapter => ( // Use filtered chapters
                    <option key={chapter._id} value={chapter.name}>{chapter.name}</option>
                  ))}
                </select>
                {errors.chapter && <p className="text-red-500 text-sm mt-1">{errors.chapter}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleInputChange('formData', 'joiningDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.joiningDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.joiningDate && <p className="text-red-500 text-sm mt-1">{errors.joiningDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('formData', 'reference', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter reference"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('businessProfile', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('businessLogo', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('formData', 'businessName', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter business name"
                />
                {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Tagline *</label>
              <input
                type="text"
                value={formData.businessTagline}
                onChange={(e) => handleInputChange('formData', 'businessTagline', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.businessTagline ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter business tagline"
              />
              {errors.businessTagline && <p className="text-red-500 text-sm mt-1">{errors.businessTagline}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description of Business</label>
              <textarea
                value={formData.descriptionOfBusiness}
                onChange={(e) => handleInputChange('formData', 'descriptionOfBusiness', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Enter business description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Services *</label>
              <input
                type="text"
                value={formData.businessServices}
                onChange={(e) => handleInputChange('formData', 'businessServices', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.businessServices ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter business services"
              />
              {errors.businessServices && <p className="text-red-500 text-sm mt-1">{errors.businessServices}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Card (Front)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('businessCardFront', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Card (Back)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('businessCardBack', e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMultipleFilesChange('portfolioImages', e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">You can select multiple images</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hometown Address</label>
              <textarea
                value={formData.hometownAddress}
                onChange={(e) => handleInputChange('formData', 'hometownAddress', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.hometownAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="3"
                placeholder="Enter hometown address"
              />
              {errors.hometownAddress && <p className="text-red-500 text-sm mt-1">{errors.hometownAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Village</label>
                <input
                  type="text"
                  value={formData.hometownCity}
                  onChange={(e) => handleInputChange('formData', 'hometownCity', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.hometownCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter city/village"
                />
                {errors.hometownCity && <p className="text-red-500 text-sm mt-1">{errors.hometownCity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  value={formData.hometownDistrict}
                  onChange={(e) => handleInputChange('formData', 'hometownDistrict', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                value={formData.hometownPincode}
                onChange={(e) => handleInputChange('formData', 'hometownPincode', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.hometownPincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter pincode"
              />
              {errors.hometownPincode && <p className="text-red-500 text-sm mt-1">{errors.hometownPincode}</p>}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address</label>
              <textarea
                value={formData.residenceAddress}
                onChange={(e) => handleInputChange('formData', 'residenceAddress', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.residenceAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="3"
                placeholder="Enter residential address"
              />
              {errors.residenceAddress && <p className="text-red-500 text-sm mt-1">{errors.residenceAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Village</label>
                <input
                  type="text"
                  value={formData.residenceCity}
                  onChange={(e) => handleInputChange('formData', 'residenceCity', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.residenceCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter city/village"
                />
                {errors.residenceCity && <p className="text-red-500 text-sm mt-1">{errors.residenceCity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  value={formData.residenceDistrict}
                  onChange={(e) => handleInputChange('formData', 'residenceDistrict', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                value={formData.residencePincode}
                onChange={(e) => handleInputChange('formData', 'residencePincode', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.residencePincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter pincode"
              />
              {errors.residencePincode && <p className="text-red-500 text-sm mt-1">{errors.residencePincode}</p>}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Address</label>
              <textarea
                value={formData.officeAddress}
                onChange={(e) => handleInputChange('formData', 'officeAddress', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.officeAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows="3"
                placeholder="Enter office address"
              />
              {errors.officeAddress && <p className="text-red-500 text-sm mt-1">{errors.officeAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City/Village</label>
                <input
                  type="text"
                  value={formData.officeCity}
                  onChange={(e) => handleInputChange('formData', 'officeCity', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.officeCity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter city/village"
                />
                {errors.officeCity && <p className="text-red-500 text-sm mt-1">{errors.officeCity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  value={formData.officeDistrict}
                  onChange={(e) => handleInputChange('formData', 'officeDistrict', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
              <input
                type="text"
                value={formData.officePincode}
                onChange={(e) => handleInputChange('formData', 'officePincode', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.officePincode ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter pincode"
              />
              {errors.officePincode && <p className="text-red-500 text-sm mt-1">{errors.officePincode}</p>}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Phone Number *</label>
                <input
                  type="tel"
                  value={formData.personalPhoneNumber}
                  onChange={(e) => handleInputChange('formData', 'personalPhoneNumber', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.personalPhoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter personal phone number"
                />
                {errors.personalPhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.personalPhoneNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Phone Number *</label>
                <input
                  type="tel"
                  value={formData.officePhoneNumber}
                  onChange={(e) => handleInputChange('formData', 'officePhoneNumber', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.officePhoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter office phone number"
                />
                {errors.officePhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.officePhoneNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email2}
                  onChange={(e) => handleInputChange('formData', 'email2', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter alternative email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Website</label>
                <input
                  type="url"
                  value={formData.businessWebsite}
                  onChange={(e) => handleInputChange('formData', 'businessWebsite', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter business website"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-sans lg:ml-[400px] lg:mt-[100px] sm:mt-[100px] mt-[50px]">
      {/* Link to Bootstrap Icons CSS */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg text-white max-w-sm w-full
          ${toastMessage.severity === 'success' ? 'bg-green-500' : ''}
          ${toastMessage.severity === 'info' ? 'bg-blue-500' : ''}
          ${toastMessage.severity === 'warn' ? 'bg-yellow-500' : ''}
          ${toastMessage.severity === 'error' ? 'bg-red-500' : ''}
        `}>
          {toastMessage.severity === 'success' && <Icons.CheckCircle />}
          {toastMessage.severity === 'info' && <Icons.Info />}
          {toastMessage.severity === 'warn' && <Icons.AlertTriangle />}
          {toastMessage.severity === 'error' && <Icons.XCircle />}
          <div className="flex-1">
            <div className="font-bold text-lg">{toastMessage.severity.charAt(0).toUpperCase() + toastMessage.severity.slice(1)}</div>
            <div className="text-sm">{toastMessage.message}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white"
          >
            <Icons.X />
          </button>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 w-11/12 max-w-md mx-auto">
            <div className="text-2xl font-semibold text-gray-800 pb-4 mb-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold">{confirmationDialog.header}</h3>
              <Icons.AlertTriangle className="text-red-500 text-3xl" />
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

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Conditional rendering for step indicators */}
        <DesktopStepIndicator />
        <MobileStepIndicator />

        <div className="mt-8">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
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
              Create Member Account
            </button>
          )}
        </div>
      </div>

      {/* Success animation */}
      {showSuccess && <SuccessAnimation />}

      {/* Tailwind CSS Custom Styles for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
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

export default AddMember;
