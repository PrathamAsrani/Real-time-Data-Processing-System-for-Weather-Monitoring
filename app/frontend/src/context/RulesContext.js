import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const RulesContext = createContext();

// Custom hook to use the context
export const useRules = () => useContext(RulesContext);

// Provider component
export const RulesProvider = ({ children }) => {
  const [rules, setRules] = useState([]);

  // Fetch rules from the backend
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/rules');
        setRules(response.data.rules);
      } catch (error) {
        console.error('Error fetching rules:', error);
      }
    };
    fetchRules();
  }, []);

  // Add a new rule
  const addRule = async (ruleText) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/add-rules', {
        rule_text: ruleText,
      });
      // Add the new rule to the list
      setRules((prevRules) => [...prevRules, { id: response.data.id, rule_text: ruleText }]);
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  // Provide state and actions to children
  return (
    <RulesContext.Provider value={{ rules, addRule }}>
      {children}
    </RulesContext.Provider>
  );
};
