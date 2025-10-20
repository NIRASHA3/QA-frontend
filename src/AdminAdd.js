import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DefauProfile from './Pictures/DefauProfile.png';
import PropTypes from 'prop-types';



import './AdminAdd.css';

function AdminAdd({ show, onClose, onLogin }) {


  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const navigate = useNavigate();

const Back_End_URL=process.env.REACT_APP_BACKEND_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    console.log("Sending  data:", { name,age,address,phoneNo });
      const res = await axios.post(`${Back_End_URL}/add`, {
        name,
        age,
        address,
        phoneNo
      });
      console.log("Successful Adding:", res.data);
      navigate("/see-profile");
    } catch (err) {
      console.error("Adding failed:", err.response ? err.response.data : err);
      alert("Adding failed. Try again.");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (


    <div className="backdrop">
      <div className="modal">
        <h3>Add Profile</h3>
        <div className="NewClz">
          <img id="IMG1" src={DefauProfile} alt="profile icon" />
          <form onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
              />
            </label>

            <label>
              <span>Age</span>
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="input"
              />
            </label>

            <label>
              <span>Address:</span>
              <textarea
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="input"
              />
            </label>

            <label>
              <span>PhoneNO:</span>
              <input
                type="tel"
                placeholder="PhoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
                className="input"
              />
            </label>

            <button type="submit" className="buttonX">
              Add
            </button>
            <button type="button" onClick={handleCancel} className="buttonX">
              Cancel
            </button>
          </form>
        </div>
    </div>
    </div>


  );
}

export default AdminAdd;

AdminAdd.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onLogin: PropTypes.func,
};
