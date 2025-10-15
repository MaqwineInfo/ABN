import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from 'primereact/editor';

const CustomToast = ({ message, severity, onClose }) => {
  if (!message) return null;

  const bgColor = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warn: 'bg-yellow-500',
    error: 'bg-red-500',
  }[severity] || 'bg-gray-500';

  const Icon = {
    success: 'bi bi-check-circle-fill',
    info: 'bi bi-info-circle-fill',
    warn: 'bi bi-exclamation-triangle-fill',
    error: 'bi bi-x-circle-fill',
  }[severity] || 'bi bi-info-circle-fill';

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${bgColor} flex items-center space-x-3`}>
      <i className={`${Icon} text-xl font-bold`}></i>
      <div className="flex-1">
        <div className="font-bold text-lg">{severity.charAt(0).toUpperCase() + severity.slice(1)}</div>
        <div className="text-sm">{message}</div>
      </div>
      <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white">
        <i className="bi bi-x-lg w-6 h-6"></i>
      </button>
    </div>
  );
};

const CustomConfirmDialog = ({ isOpen, header, message, onAccept, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 w-11/12 max-w-md mx-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">{header}</h3>
          <button onClick={onReject} className="text-gray-400 hover:text-gray-600">
            <i className="bi bi-x-lg w-6 h-6"></i>
          </button>
        </div>
        <div className="text-gray-700 py-4 text-lg flex items-center">
          <i className="bi bi-exclamation-triangle-fill text-red-500 text-3xl mr-3 font-bold"></i>
          <span>{message}</span>
        </div>
        <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onReject}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <i className="bi bi-x-lg w-5 h-5"></i>
            <span>Cancel</span>
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const CityChapterModal = ({ isOpen, onClose, type, data, cities, onSave, isSaving }) => {
  const [name, setName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (data) {
      setName(data.name || '');
      if (type === 'chapter') {
        setSelectedCityId(data.city_id || '');
      }
      setIsActive(data.status === 'active');
    } else {
      setName('');
      setSelectedCityId('');
      setIsActive(true);
    }
  }, [isOpen, data, type]);

  const handleSave = () => {
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      status: isActive ? 'active' : 'inactive',
    };

    if (type === 'chapter') {
      if (!selectedCityId) return;
      payload.city_id = selectedCityId;
    }

    onSave(payload, data ? 'edit' : 'add', data ? data._id : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {data ? `Edit ${type === 'city' ? 'City' : 'Chapter'}` : `Add New ${type === 'city' ? 'City' : 'Chapter'}`}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bi bi-x-lg w-6 h-6"></i>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor={`${type}-name`} className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'city' ? 'City Name' : 'Chapter Name'}
            </label>
            <input
              type="text"
              id={`${type}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type === 'city' ? 'city' : 'chapter'} name`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all duration-200"
            />
          </div>

          {type === 'chapter' && (
            <div>
              <label htmlFor="chapter-city" className="block text-sm font-medium text-gray-700 mb-1">
                Select City
              </label>
              <select
                id="chapter-city"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all duration-200"
              >
                <option value="">Select city</option>
                {cities.filter(city => city.status === 'active').map(city => (
                  <option key={city._id} value={city._id}>{city.name}</option>
                ))}
              </select>
            </div>
          )}

          {data && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`${type}-status`}
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
              />
              <label htmlFor={`${type}-status`} className="text-sm font-medium text-gray-700">
                {isActive ? 'Active' : 'Inactive'}
              </label>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || (type === 'chapter' && !selectedCityId)}
            className={`px-5 py-2 rounded-lg transition-colors shadow-md ${(isSaving || !name.trim() || (type === 'chapter' && !selectedCityId)) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
          >
            {isSaving ? (
              <i className="bi bi-arrow-clockwise animate-spin h-5 w-5 text-white"></i>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsApp = () => {
  const [toastMessage, setToastMessage] = useState(null);
  const [toastSeverity, setToastSeverity] = useState('info');
  const [confirmDialogState, setConfirmDialogState] = useState({
    isOpen: false,
    header: '',
    message: '',
    onAccept: () => { },
    onReject: () => { },
  });
  const [activeTab, setActiveTab] = useState('management');
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSavingCity, setIsSavingCity] = useState(false);
  const [isDeletingCity, setIsDeletingCity] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [isSavingChapter, setIsSavingChapter] = useState(false);
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [isLoadingPrivacyPolicy, setIsLoadingPrivacyPolicy] = useState(false);
  const [isSavingPrivacyPolicy, setIsSavingPrivacyPolicy] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [isLoadingTermsAndConditions, setIsLoadingTermsAndConditions] = useState(false);
  const [isSavingTermsAndConditions, setIsSavingTermsAndConditions] = useState(false);
  const [ruleBook, setRuleBook] = useState('');
  const [isLoadingRuleBook, setIsLoadingRuleBook] = useState(false);
  const [isSavingRuleBook, setIsSavingRuleBook] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);

  const showToast = useCallback((message, severity = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const showConfirmation = useCallback((header, message, acceptCallback, rejectCallback) => {
    setConfirmDialogState({
      isOpen: true,
      header,
      message,
      onAccept: () => {
        acceptCallback();
        setConfirmDialogState({ ...confirmDialogState, isOpen: false });
      },
      onReject: () => {
        if (rejectCallback) rejectCallback();
        setConfirmDialogState({ ...confirmDialogState, isOpen: false });
      },
    });
  }, [confirmDialogState]);


  // API Fetch Functions
  const fetchCities = useCallback(async () => {
    setIsLoadingCities(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      showToast(`Failed to fetch cities: ${error.message}. Please ensure your backend server is running.`, 'error');
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, [showToast]);

  const fetchChapters = useCallback(async () => {
    setIsLoadingChapters(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      showToast(`Failed to fetch chapters: ${error.message}. Please ensure your backend server is running.`, 'error');
      setChapters([]);
    } finally {
      setIsLoadingChapters(false);
    }
  }, [showToast]);

  const fetchPrivacyPolicy = useCallback(async () => {
    setIsLoadingPrivacyPolicy(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/privacy-policy`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPrivacyPolicy(data.data.content);
    } catch (error) {
      console.error('Error fetching Privacy Policy:', error);
      showToast(`Failed to fetch Privacy Policy: ${error.message}. Please ensure your backend server is running.`, 'error');
      setPrivacyPolicy(`<p>Error loading Privacy Policy content. Please try again later.</p>`);
    } finally {
      setIsLoadingPrivacyPolicy(false);
    }
  }, [showToast]);

  const fetchTermsAndConditions = useCallback(async () => {
    setIsLoadingTermsAndConditions(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/terms-and-conditions`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTermsAndConditions(data.content);
    } catch (error) {
      console.error('Error fetching Terms and Conditions:', error);
      showToast(`Failed to fetch Terms and Conditions: ${error.message}. Please ensure your backend server is running.`, 'error');
      setTermsAndConditions(`<p>Error loading Terms and Conditions content. Please try again later.</p>`);
    } finally {
      setIsLoadingTermsAndConditions(false);
    }
  }, [showToast]);

  const fetchRuleBook = useCallback(async () => {
    setIsLoadingRuleBook(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/rule-book`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRuleBook(data.content);
    } catch (error) {
      console.error('Error fetching Rule Book:', error);
      showToast(`Failed to fetch Rule Book: ${error.message}. Please ensure your backend server is running.`, 'error');
      setRuleBook(`<p>Error loading Rule Book content. Please try again later.</p>`);
    } finally {
      setIsLoadingRuleBook(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCities();
    fetchChapters();
    fetchPrivacyPolicy();
    fetchTermsAndConditions();
    fetchRuleBook();
  }, [fetchCities, fetchChapters, fetchPrivacyPolicy, fetchTermsAndConditions, fetchRuleBook]);


  // City Management Handlers
  const handleAddCityClick = () => {
    setEditingCity(null);
    setShowCityModal(true);
  };

  const handleEditCityClick = (city) => {
    setEditingCity(city);
    setShowCityModal(true);
  };

  const handleSaveCity = async (cityData, actionType, cityId = null) => {
    setIsSavingCity(true);
    try {
      let response;
      if (actionType === 'add') {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cityData),
        });
      } else {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities/${cityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cityData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${actionType} city`);
      }

      await fetchCities();
      showToast(`City ${actionType === 'add' ? 'added' : 'updated'} successfully!`, 'success');
      setShowCityModal(false);
    } catch (error) {
      console.error('Error saving city:', error);
      showToast(`Error saving city: ${error.message}`, 'error');
    } finally {
      setIsSavingCity(false);
    }
  };

  const handleDeleteCity = (cityId, cityName) => {
    showConfirmation(
      'Delete City',
      `Are you sure you want to delete "${cityName}"? This action cannot be undone.`,
      async () => {
        setIsDeletingCity(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/cities/${cityId}`, { method: 'DELETE' });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete city');
          }

          await fetchCities();
          showToast('City deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting city:', error);
          showToast(`Error deleting city: ${error.message}`, 'error');
        } finally {
          setIsDeletingCity(false);
        }
      }
    );
  };


  // Chapter Management Handlers
  const handleAddChapterClick = () => {
    setEditingChapter(null);
    setShowChapterModal(true);
  };

  const handleEditChapterClick = (chapter) => {
    setEditingChapter(chapter);
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (chapterData, actionType, chapterId = null) => {
    setIsSavingChapter(true);
    try {
      let response;
      if (actionType === 'add') {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chapterData),
        });
      } else {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters/${chapterId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chapterData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${actionType} chapter`);
      }

      await fetchChapters();
      showToast(`Chapter ${actionType === 'add' ? 'added' : 'updated'} successfully!`, 'success');
      setShowChapterModal(false);
    } catch (error) {
      console.error('Error saving chapter:', error);
      showToast(`Error saving chapter: ${error.message}`, 'error');
    } finally {
      setIsSavingChapter(false);
    }
  };

  const handleDeleteChapter = (chapterId, chapterName) => {
    showConfirmation(
      'Delete Chapter',
      `Are you sure you want to delete "${chapterName}"? This action cannot be undone.`,
      async () => {
        setIsDeletingChapter(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chapters/${chapterId}`, { method: 'DELETE' });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete chapter');
          }

          await fetchChapters();
          showToast('Chapter deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting chapter:', error);
          showToast(`Error deleting chapter: ${error.message}`, 'error');
        } finally {
          setIsDeletingChapter(false);
        }
      }
    );
  };


  // Content Management Handlers
  const handleSavePrivacyPolicy = () => {
    showConfirmation(
      'Save Privacy Policy',
      'Are you sure you want to save the privacy policy changes?',
      async () => {
        setIsSavingPrivacyPolicy(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/privacy-policy`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: privacyPolicy, status: 'active' }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save Privacy Policy');
          }

          showToast('Privacy Policy saved successfully!', 'success');
        } catch (error) {
          console.error('Error saving Privacy Policy:', error);
          showToast(`Error saving Privacy Policy: ${error.message}`, 'error');
        } finally {
          setIsSavingPrivacyPolicy(false);
        }
      }
    );
  };

  const handleSaveTermsAndConditions = () => {
    showConfirmation(
      'Save Terms & Conditions',
      'Are you sure you want to save the terms and conditions changes?',
      async () => {
        setIsSavingTermsAndConditions(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/terms-and-conditions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: termsAndConditions, status: 'active' }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save Terms & Conditions');
          }

          showToast('Terms & Conditions saved successfully!', 'success');
        } catch (error) {
          console.error('Error saving Terms & Conditions:', error);
          showToast(`Error saving Terms & Conditions: ${error.message}`, 'error');
        } finally {
          setIsSavingTermsAndConditions(false);
        }
      }
    );
  };

  const handleSaveRuleBook = () => {
    showConfirmation(
      'Save Rule Book',
      'Are you sure you want to save the rule book changes?',
      async () => {
        setIsSavingRuleBook(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/rule-book`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: ruleBook, status: 'active' }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save Rule Book');
          }

          showToast('Rule Book saved successfully!', 'success');
        } catch (error) {
          console.error('Error saving Rule Book:', error);
          showToast(`Error saving Rule Book: ${error.message}`, 'error');
        } finally {
          setIsSavingRuleBook(false);
        }
      }
    );
  };

  const renderTableContent = (data, isLoading, type) => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={type === 'chapter' ? 4 : 3} className="text-center py-8 text-gray-500">
            <i className="bi bi-arrow-clockwise animate-spin h-8 w-8 mx-auto mb-2 text-sky-500 font-bold"></i>
            Loading {type}s...
          </td>
        </tr>
      );
    }
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={type === 'chapter' ? 4 : 3} className="text-center py-8 text-gray-500">
            No {type}s found.
          </td>
        </tr>
      );
    }
    return data.map((item) => (
      <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {item.name}
        </td>
        {type === 'chapter' && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item.city_id ? item.city_id.name : 'N/A'}
          </td>
        )}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
          <button
            onClick={() => (type === 'city' ? handleEditCityClick(item) : handleEditChapterClick(item))}
            title={`Edit ${type}`}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <i className="bi bi-pencil-square w-4 h-4 font-bold"></i>
          </button>
          <button
            onClick={() => (type === 'city' ? handleDeleteCity(item._id, item.name) : handleDeleteChapter(item._id, item.name))}
            title={`Delete ${type}`}
            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={type === 'city' ? isDeletingCity : isDeletingChapter}
          >
            {type === 'city' && isDeletingCity || type === 'chapter' && isDeletingChapter ? (
              <i className="bi bi-arrow-clockwise animate-spin h-5 w-5 font-bold"></i>
            ) : (
              <i className="bi bi-trash3 w-4 h-4 font-bold"></i>
            )}
          </button>
        </td>
      </tr>
    ));
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <CustomToast message={toastMessage} severity={toastSeverity} onClose={() => setToastMessage(null)} />
      <CustomConfirmDialog
        isOpen={confirmDialogState.isOpen}
        header={confirmDialogState.header}
        message={confirmDialogState.message}
        onAccept={confirmDialogState.onAccept}
        onReject={confirmDialogState.onReject}
      />
      <CityChapterModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
        type="city"
        data={editingCity}
        cities={cities}
        onSave={handleSaveCity}
        isSaving={isSavingCity}
      />
      <CityChapterModal
        isOpen={showChapterModal}
        onClose={() => setShowChapterModal(false)}
        type="chapter"
        data={editingChapter}
        cities={cities}
        onSave={handleSaveChapter}
        isSaving={isSavingChapter}
      />

      <div className="bg-white rounded-lg shadow-md lg:ml-[250px] lg:mt-[75px] sm:mt-[80px] mt-[80px]">
        <div className="border-b border-gray-200">
          <nav className="flex flex-col sm:flex-row sm:space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('management')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors text-center sm:text-left flex items-center space-x-2 ${activeTab === 'management'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none`}
            >
              <i className="bi bi-gear-fill w-5 h-5 font-bold"></i>
              <span>City & Chapter Management</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors text-center sm:text-left flex items-center space-x-2 ${activeTab === 'privacy'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none`}
            >
              <i className="bi bi-file-earmark-lock-fill w-5 h-5 font-bold"></i>
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors text-center sm:text-left flex items-center space-x-2 ${activeTab === 'terms'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none`}
            >
              <i className="bi bi-file-earmark-text-fill w-5 h-5 font-bold"></i>
              <span>Terms & Conditions</span>
            </button>
            <button
              onClick={() => setActiveTab('rulebook')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors text-center sm:text-left flex items-center space-x-2 ${activeTab === 'rulebook'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } focus:outline-none`}
            >
              <i className="bi bi-book-fill w-5 h-5 font-bold"></i>
              <span>Rule Book</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'management' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* City Management Section */}
              <div className="space-y-6 bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <i className="bi bi-building-fill-add mr-2 text-sky-600 w-5 h-5 font-bold"></i>
                    Cities Management
                  </h2>
                  <button
                    onClick={handleAddCityClick}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                    disabled={isSavingCity}
                  >
                    <i className="bi bi-plus-lg w-5 h-5 font-bold"></i>
                    <span>Add City</span>
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">City Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {renderTableContent(cities, isLoadingCities, 'city')}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chapters Management Section */}
              <div className="space-y-6 bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <i className="bi bi-geo-alt-fill mr-2 text-sky-600 w-5 h-5 font-bold"></i>
                    Chapters Management
                  </h2>
                  <button
                    onClick={handleAddChapterClick}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                    disabled={isSavingChapter}
                  >
                    <i className="bi bi-plus-lg w-5 h-5 font-bold"></i>
                    <span>Add Chapter</span>
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Chapter Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {renderTableContent(chapters, isLoadingChapters, 'chapter')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Privacy Policy Editor</h2>
              {isLoadingPrivacyPolicy ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="bi bi-arrow-clockwise animate-spin h-8 w-8 mx-auto mb-2 text-sky-500 font-bold"></i>
                  Loading Privacy Policy...
                </div>
              ) : (
                <div className="card border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <Editor
                    value={privacyPolicy}
                    onTextChange={(e) => setPrivacyPolicy(e.htmlValue)}
                    style={{ height: '320px' }}
                  />
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePrivacyPolicy}
                  className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                  disabled={isSavingPrivacyPolicy}
                >
                  {isSavingPrivacyPolicy ? (
                    <i className="bi bi-arrow-clockwise animate-spin h-5 w-5 text-white font-bold"></i>
                  ) : (
                    'Save Privacy Policy'
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Terms and Conditions Editor</h2>
              {isLoadingTermsAndConditions ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="bi bi-arrow-clockwise animate-spin h-8 w-8 mx-auto mb-2 text-sky-500 font-bold"></i>
                  Loading Terms and Conditions...
                </div>
              ) : (
                <div className="card border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <Editor
                    value={termsAndConditions}
                    onTextChange={(e) => setTermsAndConditions(e.htmlValue)}
                    style={{ height: '320px' }}
                  />
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveTermsAndConditions}
                  className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                  disabled={isSavingTermsAndConditions}
                >
                  {isSavingTermsAndConditions ? (
                    <i className="bi bi-arrow-clockwise animate-spin h-5 w-5 text-white font-bold"></i>
                  ) : (
                    'Save Terms & Conditions'
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rulebook' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Rule Book Editor</h2>
              {isLoadingRuleBook ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="bi bi-arrow-clockwise animate-spin h-8 w-8 mx-auto mb-2 text-sky-500 font-bold"></i>
                  Loading Rule Book...
                </div>
              ) : (
                <div className="card border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <Editor
                    value={ruleBook}
                    onTextChange={(e) => setRuleBook(e.htmlValue)}
                    style={{ height: '320px' }}
                  />
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveRuleBook}
                  className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                  disabled={isSavingRuleBook}
                >
                  {isSavingRuleBook ? (
                    <i className="bi bi-arrow-clockwise animate-spin h-5 w-5 text-white font-bold"></i>
                  ) : (
                    'Save Rule Book'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
