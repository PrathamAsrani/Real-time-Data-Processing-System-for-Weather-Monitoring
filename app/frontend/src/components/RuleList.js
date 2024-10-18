import React, { useState, useEffect } from 'react';
import { useRules } from '../context/RulesContext';
import axios from 'axios';
import '../styles/RuleList.css';

const RuleList = () => {
  const { rules } = useRules();
  const [selectedRule, setSelectedRule] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState(null); // State to hold the selected rule ID
  const [evaluationResult, setEvaluationResult] = useState('');
  const [validUsers, setValidUsers] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [editMode, setEditMode] = useState(false); // New state for edit mode
  const [editedRuleText, setEditedRuleText] = useState(''); // State for edited rule text


  const fetchRules = async () => {
    try {
      await axios.get('http://127.0.0.1:8000/rules');
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };
  // Fetch rules from the backend when the component mounts
  useEffect(() => {
    fetchRules();
  }, []);

  // Handler for when a rule is selected from the dropdown
  const handleSelectRule = (event) => {
    const ruleText = event.target.value;
    const ruleId = rules.find((rule) => rule.rule_text === ruleText)?.id; // Get the ID of the selected rule
    setSelectedRule(ruleText);
    setSelectedRuleId(ruleId); // Update the selected rule ID
    setEditedRuleText(ruleText); // Set the edited text to the selected rule
    setEditMode(false); // Reset edit mode when selecting a new rule
  };

  // Function to handle checkbox change for merging rules
  const handleCheckboxChange = (ruleId, ruleText, isChecked) => {
    if (isChecked) {
      setSelectedRuleId(ruleId)
      setSelectedRules((prevSelectedRules) => [...prevSelectedRules, { id: ruleId, text: ruleText }]);
    } else {
      setSelectedRuleId(null)
      setSelectedRules((prevSelectedRules) => prevSelectedRules.filter((rule) => rule.id !== ruleId));
    }
  };

  // Parsing and building JSON structure from rule text
  function parseCondition(condition) {
    const match = condition.match(/(\w+)\s*(>|<|=|>=|<=)\s*([0-9]+|'.+?')/);
    if (match) {
      const field = match[1];
      const operator = match[2];
      let value = match[3];
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else {
        value = parseInt(value, 10);
      }
      return { field, operator, value };
    }
    return null;
  }

  function splitByTopLevelOperator(expression) {
    let level = 0;
    let operator = null;
    let subexpressions = [];
    let start = 0;

    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') {
        level++;
      } else if (expression[i] === ')') {
        level--;
      } else if (level === 0) {
        if (expression.slice(i, i + 3) === 'AND') {
          operator = 'AND';
          subexpressions.push(expression.slice(start, i).trim());
          start = i + 3;
          i += 2;
        } else if (expression.slice(i, i + 2) === 'OR') {
          operator = 'OR';
          subexpressions.push(expression.slice(start, i).trim());
          start = i + 2;
          i += 1;
        }
      }
    }

    subexpressions.push(expression.slice(start).trim());
    return { operator, subexpressions };
  }

  function buildJson(expression) {
    if (expression.startsWith('(') && expression.endsWith(')')) {
      expression = expression.slice(1, -1).trim();
    }

    if (!expression.includes('AND') && !expression.includes('OR')) {
      return parseCondition(expression);
    }

    const { operator, subexpressions } = splitByTopLevelOperator(expression);
    const jsonSubexpressions = subexpressions.map(subexp => buildJson(subexp));

    return { [operator]: jsonSubexpressions };
  }

  // Function to evaluate the selected rule
  const evaluateRule = async () => {
    if (!selectedRule) {
      setEvaluationResult('Please select a rule to evaluate.');
      return;
    }
    setValidUsers([]);

    try {
      const parsedRules = buildJson(selectedRule);
      console.log('Parsed Rules:', parsedRules);

      // Send the parsed rule to the backend
      const response = await axios.post('http://127.0.0.1:8000/evaluate', { rules: parsedRules });
      const { message, valid_users } = response.data;
      setEvaluationResult(`Evaluation Result: ${message}`);
      setValidUsers(valid_users);
    } catch (error) {
      console.error('Error evaluating rule:', error);
      setEvaluationResult('Error evaluating rule.');
    }
  };

  const mergeSelectedRules = () => {
    if (selectedRules.length < 2) {
      setEvaluationResult('Please select at least 2 rules to merge.');
      return;
    }

    let mergedRule = '';
    for (let i = 0; i < selectedRules.length; i++) {
      mergedRule += `${selectedRules[i].text}`; // Wrap each rule in parentheses
      if (i < selectedRules.length - 1) {
        mergedRule += ' OR '; // Add ' OR ' for all but the last rule
      }
    }
    mergedRule = '(' + mergedRule + ')';
    setSelectedRule(mergedRule);
    console.log('Merged Rule:', mergedRule);

    // Call the evaluate function after merging
    evaluateRule(); // This should evaluate the merged rule
  };

  const saveEditedRule = async () => {
    if (!editedRuleText) {
      setEvaluationResult('Rule text cannot be empty.');
      return;
    }

    try {
      console.log("selectedRuleId : \t", selectedRuleId)
      // Change to PATCH request
      const response = await axios.patch(`http://127.0.0.1:8000/rules/${selectedRuleId}`, { rule_text: editedRuleText });
      console.log('Updated rule response:', response.data);
      setSelectedRule(editedRuleText); // Update the selected rule text
      setEditMode(false); // Exit edit mode
      setEvaluationResult('Rule updated successfully.');
      fetchRules();
      // Optionally, you can refresh the rules list here by calling fetchRules again
    } catch (error) {
      console.error('Error updating rule:', error);
      setEvaluationResult('Error updating rule.');
    }
  };

  return (
    <div>
      <h2>Rules List</h2>

      <label htmlFor="ruleSelect">Select a rule to evaluate: </label>
      <select id="ruleSelect" onChange={handleSelectRule} value={selectedRule}>
        <option value="">--Select a rule--</option>
        {rules.map((rule) => (
          <option key={rule.id} value={rule.rule_text}>
            {rule.rule_text}
          </option>
        ))}
      </select>

      <button onClick={evaluateRule} style={{ marginLeft: '10px' }} disabled={!selectedRule}>
        Evaluate
      </button>

      <h3>Select rules to merge:</h3>
      {rules.map((rule) => (
        <div key={rule.id} className="checkbox-container">
          <input
            type="checkbox"
            id={`rule-${rule.id}`}
            className="checkbox"
            onChange={(e) => handleCheckboxChange(rule.id, rule.rule_text, e.target.checked)}
          />
          <label htmlFor={`rule-${rule.id}`} className="custom-checkbox"></label>
          <label htmlFor={`rule-${rule.id}`}>{rule.rule_text}</label>
        </div>
      ))}

      <button onClick={mergeSelectedRules} style={{ marginTop: '10px' }}>
        Merge Selected Rules
      </button>

      {editMode ? (
        <div>
          <h3>Edit Rule</h3>
          <textarea
            value={editedRuleText}
            onChange={(e) => { setEditedRuleText(e.target.value) }}
            rows="4"
            cols="50"
          />
          <button onClick={saveEditedRule}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setEditMode(true)} style={{ marginTop: '10px', marginBottom: '20px' }}>
          Edit Selected Rule
        </button>
      )}

      {evaluationResult && (
        <div>
          <h3>{evaluationResult}</h3>
        </div>
      )}

      {validUsers.length > 0 && (
        <div>
          <h3>Valid Users</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>User ID</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Salary</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Age</th>
              </tr>
            </thead>
            <tbody>
              {validUsers.map((user, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{user.id}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{user.name}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{user.salary}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{user.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RuleList;
