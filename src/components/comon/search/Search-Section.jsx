import React, { useState, useEffect } from 'react';
import './SearchSection.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/firebaseConfig'; // Ensure this points to your Firebase config file
import { collection, query, where, getDocs } from 'firebase/firestore';

const SearchSection = ({ showSearch = true, onSearch = false, newsearch = false,  width = '70%' }) => {
  const navigate = useNavigate();

  // Initialize selectedMode from sessionStorage
  const storedMode = sessionStorage.getItem('selectedOption') || 'flight'; // Default to 'flight' if not set
  const [selectedMode, setSelectedMode] = useState(storedMode);

  // States for form inputs
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [travelClass, setTravelClass] = useState('');

  useEffect(() => {
    // Load data from sessionStorage and set initial states when the component mounts
    const storedFrom = sessionStorage.getItem('from') || '';
    const storedTo = sessionStorage.getItem('to') || '';
    const storedDeparture = sessionStorage.getItem('departure') || '';
    const storedArrival = sessionStorage.getItem('arrival') || '';
    const storedClass = sessionStorage.getItem('travelClass') || '';

    setFrom(storedFrom);
    setTo(storedTo);
    setDeparture(storedDeparture);
    setArrival(storedArrival);
    setTravelClass(storedClass);

    // Define a function to update selectedMode from sessionStorage
    const updateSelectedMode = () => {
      const mode = sessionStorage.getItem('selectedOption');
      if (mode && mode !== selectedMode) {
        setSelectedMode(mode); // Update the state if the sessionStorage value has changed
        // Clear sessionStorage if selectedOption changes
        sessionStorage.removeItem('from');
        sessionStorage.removeItem('to');
        sessionStorage.removeItem('departure');
        sessionStorage.removeItem('arrival');
        sessionStorage.removeItem('travelClass');
      }
    };

    // Run the update function on mount to ensure the initial value is set
    updateSelectedMode();

    // Use an interval to periodically check for changes in sessionStorage
    const interval = setInterval(() => {
      updateSelectedMode(); // Check if selectedOption has changed
    }, 1000); // Check every second

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [selectedMode]); // Dependency on selectedMode ensures the effect runs when it changes

  // Save input data to sessionStorage
  const handleInputChange = (field, value) => {
    // Update the input state
    if (field === 'from') setFrom(value);
    if (field === 'to') setTo(value);
    if (field === 'departure') setDeparture(value);
    if (field === 'arrival') setArrival(value);
    if (field === 'travelClass') setTravelClass(value);

    // Save the updated value to sessionStorage
    sessionStorage.setItem(field, value);
  };

  const handleSearch = async (event) => {
    event.preventDefault(); // Prevent form submit behavior
    if ((from && to) || departure) {
      await fetchSearchResults();
    }
    onSearch({ from, to, departure, travelClass }); // Send search data back to parent
  };

  const fetchSearchResults = async (event) => {
    event?.preventDefault(); // Prevent form submit behavior if event is passed

    try {
      const travelCollectionRef = collection(db, selectedMode); // Firebase collection based on selectedMode
      let searchQuery = query(travelCollectionRef);

      // Adding filters to the query based on the user input
      if (from) {
        searchQuery = query(searchQuery, where('source', '>=', from.toLowerCase()), where('source', '<=', from.toLowerCase() + '\uf8ff'));
      }
      if (to) {
        searchQuery = query(searchQuery, where('destination', '>=', to.toLowerCase()), where('destination', '<=', to.toLowerCase() + '\uf8ff'));
      }
      if (departure) {
        const selectedDate = new Date(departure); // Convert the selected departure date to a Date object
        selectedDate.setHours(0, 0, 0, 0); // Normalize the time to 00:00
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999); // Set the end of the day time

        searchQuery = query(
          searchQuery,
          where('departureTime', '>=', selectedDate.getTime()), // Filter by departure date
          where('departureTime', '<=', endOfDay.getTime()) // Filter by the end of the day
        );
      }
      if (selectedMode === 'flight' && travelClass) {
        searchQuery = query(searchQuery, where('travelClass', '==', travelClass));
      }

      const querySnapshot = await getDocs(searchQuery);
      const results = querySnapshot.docs.map(doc => doc.data());

      console.log('Search Results:', results); // Handle search results (e.g., display them in parent component)

    } catch (error) {
      console.error('Error fetching search results from Firebase:', error);
    }
  };

  const search = (event) => {
    event.preventDefault(); // Prevent form submission and page refresh
    sessionStorage.setItem('from', from);
    sessionStorage.setItem('to', to);
    sessionStorage.setItem('departure', departure);
    sessionStorage.setItem('arrival', arrival);
    sessionStorage.setItem('travelClass', travelClass);

    navigate(`/${selectedMode}`, { state: { from, to, departure, travelClass } }); // Pass state to the next page
  };

  return (
    <div className="search-container" style={{ width: width }} >
      {/* Search Fields */}
      <div className="search-fields">
        <div className="field-group">
          <label>From</label>
          <input
            type="text"
            placeholder="Enter city or airport"
            value={from}
            onChange={(e) => handleInputChange('from', e.target.value.toUpperCase())}
          />
        </div>
        <div className="field-group">
          <label>To</label>
          <input
            type="text"
            placeholder="Enter city or airport"
            value={to}
            onChange={(e) => handleInputChange('to', e.target.value.toUpperCase())}
          />
        </div>
        <div className="field-group">
          <label>Departure</label>
          <input
            type="date"
            value={departure}
            onChange={(e) => handleInputChange('departure', e.target.value.toUpperCase())}
          />
        </div>

        {/* Conditionally render fields based on selected mode */}
        {selectedMode === 'flight' && (
          <>
            <div className="field-group">
              <label>Arrival</label>
              <input
                type="date"
                value={arrival}
                onChange={(e) => handleInputChange('arrival', e.target.value.toUpperCase())}
              />
            </div>
            <div className="field-group">
              <label>Class</label>
              <select
                value={travelClass}
                onChange={(e) => handleInputChange('travelClass', e.target.value.toUpperCase())}
              >
                <option value="">Select Class</option>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </>
        )}

        {selectedMode === 'train' && (
          <>
            <div className="field-group">
              <label>Class</label>
              <select
                value={travelClass}
                onChange={(e) => handleInputChange('travelClass', e.target.value.toUpperCase())}
              >
                <option value="">Select Class</option>
                <option value="first_ac">First AC</option>
                <option value="second_ac">Second AC</option>
                <option value="third_ac">Third AC</option>
                <option value="sleeper">Sleeper</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Small Search Button */}
      {newsearch && (
        <button className="search-btn-small" onClick={fetchSearchResults}>
          Search
        </button>
      )}

      {/* Main Search Button */}
      {showSearch && (
        <button className="search-btn" onClick={search}>
          Search
        </button>
      )}
    </div>
  );
};

export default SearchSection;
