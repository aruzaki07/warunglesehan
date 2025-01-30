import logo from '../../../assets/img/logo/logo.svg';
import './App.css';
import {BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dasboard from '../Dasboard'
import {Provider} from 'react-redux'
import {store} from '../../../config/redux';
import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
  return (
    <Provider store ={store}>
       <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index  element={<Dasboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </Provider>
  );
}

export default App;
