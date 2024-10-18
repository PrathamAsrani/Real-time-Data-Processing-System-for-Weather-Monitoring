import React from 'react';
import AddRule from './components/AddRule';
import RuleList from './components/RuleList';
import { RulesProvider } from './context/RulesContext';
import './styles/Global.css'

function App() {
  return (
    <RulesProvider>
      <div className="App">
        <h1>Rule Engine with AST</h1>
        <AddRule />
        <RuleList />
      </div>
    </RulesProvider>
  );
}

export default App;
