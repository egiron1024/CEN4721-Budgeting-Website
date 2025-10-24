import React from 'react';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

import Navbar from './components/navbar';
import Dashboard from "./components/dashboard"
import Planner from "./components/planner";
import Spending from "./components/spending"
import Report from "./components/report" 
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar/>
        <main style={{paddingTop: "80px"}}>
        {/*<h1>Welcome to Brokenomics</h1>*/}
          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/planner" element={<Planner/>}/>
            <Route path="/spending" element={<Spending/>}/>
            <Route path="/report" element={<Report/>}/>
          </Routes>
        </main>
      </div>
    </Router>
    
  );
}

export default App;
