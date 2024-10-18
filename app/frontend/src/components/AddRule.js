// AddRule.js
import React, { useState } from 'react';
import { useRules } from '../context/RulesContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AddRule.css';

const requiredAttributes = ['name', 'age', 'department', 'salary', 'spend', 'experience'];

const AddRule = () => {
  const [ruleText, setRuleText] = useState('');
  const { addRule } = useRules();

  // Function to validate the rule format
  const validateRule = (rule) => {
    const regex = /^\((\w+)\s*(>|<|=|>=|<=)\s*([0-9]+|'.+?')\)$/; // For simple rules
    const complexRegex = /^\(?(((\((\w+)\s*(>|<|=|>=|<=)\s*([0-9]+|'.+?')\))\s*(AND|OR)\s*)+(\((\w+)\s*(>|<|=|>=|<=)\s*([0-9]+|'.+?')\)))+\)?$/; // For complex rules
    return regex.test(rule) || complexRegex.test(rule);
  };

  // Function to validate if required attributes are present in the rule
  const validateAttributes = (rule) => {
    const ruleLowerCase = rule.toLowerCase();
    return requiredAttributes.some(attr => ruleLowerCase.includes(attr));
  };

  const handleAddRule = async () => {
    // Check if the rule is empty
    if (ruleText.trim() === '') {
      toast.error('Rule cannot be empty.');
      return;
    }

    // Validate the rule before adding
    if (!validateRule(ruleText)) {
      toast.error('Invalid rule format. Please use correct parentheses and conditions.');
      return;
    }

    // Validate if required attributes are present in the rule
    if (!validateAttributes(ruleText)) {
      toast.error(`Rule must include all required attributes: ${requiredAttributes.join(', ')}.`);
      return;
    }

    try {
      await addRule(ruleText);
      toast.success('Rule added successfully!');
      setRuleText('');
    } catch (error) {
      toast.error('Error adding rule');
    }
  };

  return (
    <div className="add-rule-container">
      <h2>Add Rule</h2>
      <div className="input-group">
        <input
          type="text"
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          placeholder="Enter rule (e.g., (age > 30))"
        />
        <button onClick={handleAddRule}>Add Rule</button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddRule;
