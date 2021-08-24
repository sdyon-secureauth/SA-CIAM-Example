import React from 'react';
import Auth from '../Authentication/Auth';
const axios = require('axios');
const qs = require('qs');



async function getTokens(user, pwd) { 
    const options = {
        url: process.env.REACT_APP_TOKEN_URL+'/token',
        method: 'post',
        auth: {
          username: process.env.REACT_APP_CLIENT_ID,
          password: process.env.REACT_APP_CLIENT_SECRET,
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        data: qs.stringify({
            grant_type: 'password',
            username: user, //req.body.username,
            password: pwd, //req.body.password,
            scope: 'openid profile',
            response_type: 'id_token'
          })
      };

      const resp = await axios(options);

      // Error Flow
      // {error: "invalid_request", error_description: "Password and Username don't match"}

      return resp.data;
}

async function getToken() {
    // creds are of the user (api details)
    const options = {
        // {{tenant}}/api/v1/privy/ids/{{ids_id}}/g3/token
        url: process.env.REACT_APP_TOKEN_URL+'/api/v1/privy/ids/default/g3/token',
        method: 'post',
        auth: {
            username: process.env.REACT_APP_API_ID,
            password: process.env.REACT_APP_API_SECRET,
        }
      };

      const resp = await axios(options);
      return resp.data.access_token;
 }


async function getUserID(user) {

    var token = await getToken();

    // eq is exact match
    // sw is start with
    // gt is greater than

    var serachUser = '"'+user+'"';
    const data = {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
        "attributes": [ "userName", "emails.value", "id"],
        "filter":"userName eq " + serachUser,
        "startIndex": 1,
        "count": 1
      }

      //{{tenant}}/api/v1/scim/ids/{{ids_id}}/v2/Users/.search
      var url = process.env.REACT_APP_TOKEN_URL+'/api/v1/scim/ids/'+process.env.REACT_APP_IDS_STORE+'/v2/Users/.search';
      const options = {
          url: url,
          method: 'post',
          headers: {
              'Authorization': 'Bearer ' +token,
              'Content-Type': 'application/json'
          },
          data: data
        };
  
        //console.log(options);
        const resp = await axios(options);

        return resp.data;
}


class Login extends React.Component {
    constructor(props) {
      super(props);
      this.state = {username: '', password: '', errorMessage: '', preauth: true, auth: false };
  
      this.handleUserName = this.handleUserName.bind(this);
      this.handlePassword = this.handlePassword.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

    }
  
    handleUserName(event) {
      this.setState({username: event.target.value});
    }

    handlePassword(event) {
        this.setState({password: event.target.value});
      }
  
    handleSubmit(event) {
        // prevent form load
        event.preventDefault();
         // login the user if account exists
         this.login().then(res => {
            // response type through saidp-sdk-js
            // { status: '', mesage: '' }
            // console.log(res.data);
            console.log(res);
            if(res.access_token !== undefined) {
                // successful login here
                window.localStorage.setItem('token', res.access_token);
                window.localStorage.setItem('id_token', res.id_token);
                window.localStorage.setItem('idp_ID', this.state.username);
                
                getUserID(this.state.username).then(res => {
                    console.log(res);
                    window.localStorage.setItem('ids_ID', res.Resources[0].id);
                    this.setState(prevState => ({preauth: !prevState.preauth}));
                    this.setState(prevState => ({auth: !prevState.auth}));
                }).catch(error => {});
            } else {
                this.setState({ errorMessage: res.error_description });
            }

        }).catch(error => {
            console.log(error.response.data);
            this.setState({ errorMessage: error.response.data.error_description });
        });
    }

    login = async () => {
        //var postData = { user: this.state.username, pwd: this.state.password }
        //return axios.post('/api/validatecreds', postData);
        return await getTokens(this.state.username, this.state.password);

      }

      handleClick = (e) => {
        this.inputElement.click();
      }

      closeMessage = async () => {
        this.setState({ errorMessage: ''});
      }

      // auth component returns to partent (login) after successful 2 step verification
      callbackFunction = (authResponse) => {
          this.handleClick();
          console.log(authResponse);
          this.props.history.push('/');
      }

      async componentDidMount() {
        if (window.localStorage.getItem('token')) {
          console.log(window.localStorage.getItem('token'));
        }
        if(window.localStorage.getItem('id_token')) {
            console.log(window.localStorage.getItem('id_token'));
        }

      }


    render() {
        return (        
            <div className='login'>
                <div id="appCapsule">
                        { this.state.errorMessage &&

                        <div className="alert-danger alert-dismissible fade show">
                            A problem has been occurred while submitting your data. { this.state.errorMessage }
                            <a href="javascript:;" data-bs-dismiss="modal" onClick={ () => { this.closeMessage() } }><ion-icon name="close-outline"></ion-icon></a>
                        </div>

                        }

                        <div>
                        <div className="section mt-2 text-center">
                            <h1>Log in</h1>
                            <h4>Fill the form to log in</h4>
                        </div>
                        <div className="section mb-5 p-2">

                            <form onSubmit={this.handleSubmit}>
                                <div className="card">
                                    <div className="card-body pb-1">
                                        <div className="form-group basic">
                                            <div className="input-wrapper">
                                                <label className="label" htmlFor="email1">User ID (required)</label>
                                                <input type="text" className="form-control" id="email1" placeholder="Enter User ID" value={this.state.username} onChange={this.handleUserName} />
                                                <i className="clear-input">
                                                    <ion-icon name="close-circle"></ion-icon>
                                                </i>
                                            </div>
                                        </div>

                                        <div className="form-group basic">
                                            <div className="input-wrapper">
                                                <label className="label" htmlFor="password1">Password (required)</label>
                                                <input type="password" className="form-control" id="password1" autoComplete="off"
                                                    placeholder="Enter Password" value={this.state.password} onChange={this.handlePassword} />
                                                <i className="clear-input">
                                                    <ion-icon name="close-circle"></ion-icon>
                                                </i>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="form-links mt-2">
                                    <div>
                                        <a href="/register">Register Now</a>
                                    </div>
                                    <div><a href="/forgotpassword" className="text-muted">Forgot Password?</a></div>
                                </div>

                                <div className="form-button-group  transparent">
                                    <button type="submit" className="btn btn-primary btn-block btn-lg" data-bs-toggle="modal" data-bs-target="#authActionSheet">Log in</button>
                                </div>
                            </form>
                        </div>
                        </div>
                        
                        <div className="modal fade action-sheet" id="authActionSheet" tabIndex="-1" role="dialog"  >
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-body">
                                        { this.state.auth &&
                                            <Auth user = { this.state.username } parentCallback = {this.callbackFunction} />
                                        }
                                        <div ref={input => this.inputElement = input} data-bs-dismiss="modal" onClick={this.handleClick}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
            </div>
        );
    }
}

export default Login;
