import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../App.css'; // Update the path to point to the correct location


const User = () => {
  const { text_id } = useParams();
  const [text, setText] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user/?text_id=${text_id}`, { withCredentials: true });
        if (response.data.status === 'success') {
          setText(response.data.text);
        } else {
          setMessage(response.data.reason);
        }
      } catch (error) {
        setMessage('An error occurred.');
      }
    };

    fetchText();
  }, [text_id]);

  return (
    <div>
      <h2>admin Text</h2>
      <h1>In this page job going to get uploaded job from admin</h1>
      {text ? <p>{text.text}</p> : <p>{message}</p>}
    </div>
  );
};

export default User;
