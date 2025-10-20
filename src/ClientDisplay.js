import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DefauProfile from './Pictures/DefauProfile.png';
import './ClientDisplay.css';

function ClientDisplay() {
  const [profiles, setProfiles] = useState([]);
  const Back_End_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await axios.get(`${Back_End_URL}/admin-display`);
      const data = Array.isArray(res.data.records) ? res.data.records : [];
      setProfiles(data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  }, [Back_End_URL]); 

  useEffect(() => {
    fetchProfiles();

    const interval = setInterval(fetchProfiles, 5000);
    
    // Cleanup function
    return () => clearInterval(interval);
  }, [fetchProfiles]); 

  return (
    <div className="profiles-container">
      <h2>View detailed profiles of service providers to choose the right professional.</h2>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <div key={profile._id} className="profile-card">
            <div className="profile-set">
              <img src={DefauProfile} alt="Profile" className="profile-img" />
              <div className="profile-info">
                <div className="profile-row">
                  <span className="profile-label">Name:</span>
                  <span className="profile-value">{profile.Name}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Age:</span>
                  <span className="profile-value">{profile.Age}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Address:</span>
                  <span className="profile-value">{profile.Address}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Phone:</span>
                  <span className="profile-value">{profile.PhoneNo}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientDisplay;