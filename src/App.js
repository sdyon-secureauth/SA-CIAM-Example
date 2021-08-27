import logo from './logo.svg';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

import Login from './Login/Login';
import Register from './Register/Register';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import Home from './Home/Home';
import Auth from './Authentication/Auth';
import DeleteAccount from './DeleteAccount/DeleteAccount';

function App() {

  return (
      <Router>
            <div className='App'>
                <div id="loader">
                  <img src="assets/img/logo-icon.png" alt="icon" class="loading-icon" />
                </div>
                  <Switch>
                  <Route exact path='/' component={Home} />
                    <Route exact path='/login' component={Login} /> 
                    <Route exact path="/register" component={Register} />
                    <Route exact path="/forgotpassword" component={ForgotPassword} />
                    <Route exact path='/auth' component={Auth} />
                    <Route exact path='/deleteaccount' component={DeleteAccount} />
                  </Switch>
            </div>
      </Router>
    
  );
}

export default App;
