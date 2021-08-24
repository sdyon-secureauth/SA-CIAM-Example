import React from 'react';
import axios from 'axios';
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

class Register extends React.Component {
    constructor(props) {
      super(props);
      this.state = {user: '', email: '', password: '', validate_password: '', agree: '', register: true, 
      verify: false, isLoading: false, otp: '', validate_otp: '', token: '', user_id: '', errorMessage: '',
      firstName: '', lastName: '', qrCode: '', enrollmentCode: '', totp: '', qrEnroll: false};
  
      this.handleUser = this.handleUser.bind(this);
      this.handleFirstName = this.handleFirstName.bind(this);
      this.handleLastName = this.handleLastName.bind(this);
      this.handleEmail = this.handleEmail.bind(this);
      this.handlePassword = this.handlePassword.bind(this);
      this.handleValidatePassword = this.handleValidatePassword.bind(this);
      this.hanndleAgree = this.hanndleAgree.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleVerify = this.handleVerify.bind(this);
      this.handleValidateOTP = this.handleValidateOTP.bind(this);
      this.handleQREnroll = this.handleQREnroll.bind(this);
      this.handleQRCode = this.handleQRCode.bind(this);
      this.handleEnrollmentCode = this.handleEnrollmentCode.bind(this);
      this.handleTotp = this.handleTotp.bind(this);
    }

    handleUser(event) {
        this.setState({user: event.target.value});
    }

    handleFirstName(event) {
        this.setState({firstName: event.target.value});
    }

    handleLastName(event) {
        this.setState({lastName: event.target.value});
    }
  
    handleEmail(event) {
      this.setState({email: event.target.value});
    }

    handlePassword(event) {
        this.setState({password: event.target.value});
    }

    handleValidatePassword(event) {
        this.setState({validate_password: event.target.value});
    }
  
    hanndleAgree(event) {
        this.setState({agree: event.target.checked});
    }

    handleValidateOTP(event) {
        this.setState({validate_otp: event.target.value});
    }

    handleQRCode(event) {
        this.setState({qrCode: event.target.value});
    }

    handleEnrollmentCode(event) {
        this.setState({enrollmentCode: event.target.value});
    }

    handleTotp(event) {
        this.setState({totp: event.target.value});
    }

    getToken = async () => {
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

    createUser = async () => {

        const token = await this.getToken();
        this.setState({token: token});
        //console.log('token is: ')
        //console.log(token);
        const data = {
            "schemas": [
                "urn:ietf:params:scim:schemas:core:2.0:User",
                "urn:ietf:params:scim:schemas:extension:secureauth:2.0:User",
                "urn:ietf:params:scim:schemas:extension:ldap:2.0:User"
            ],
            "userName": this.state.user,
            "password": this.state.password,
            "emails": [
            {
                "display": this.state.email,
                "primary": true,
                "type": "work",
                "value": this.state.email
            }
        ],
        "name": {
            "familyName": this.state.lastName,
            "givenName": this.state.firstName
        },
            "urn:ietf:params:scim:schemas:extension:secureauth:2.0:User": {
                "status": "staged"
            },
            "urn:ietf:params:scim:schemas:extension:ldap:2.0:User": {
                "AuxID1": " "
            }
        }

        //{{tenant}}/api/v1/scim/ids/{{ids_id}}/v2/Users
        const options = {
        url: process.env.REACT_APP_TOKEN_URL+'/api/v1/scim/ids/'+process.env.REACT_APP_IDS_STORE+'/v2/Users',
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' +this.state.token,
            'Content-Type': 'application/json'
        },
        data: data
      };

      //console.log(options);

      const resp = await axios(options);

      // Error Flow
      // {error: "invalid_request", error_description: "Password and Username don't match"}

      return resp.data;
    }

    updateUser = async () => {

        const data = {
            "schemas": [
                "urn:ietf:params:scim:api:messages:2.0:PatchOp"
            ],
            "Operations": [
                {
                    "op": "replace",
                    "path": "urn:ietf:params:scim:schemas:extension:secureauth:2.0:User:status",
                    "value": "active"
                }
            ]
        }

        //{{tenant}}/api/v1/scim/ids/{{ids_id}}/v2/Users/{{user_id}}
        var url = process.env.REACT_APP_TOKEN_URL+'/api/v1/scim/ids/'+process.env.REACT_APP_IDS_STORE+'/v2/Users/' +this.state.user_id;
        const options = {
            url: url,
            method: 'patch',
            headers: {
                'Authorization': 'Bearer ' +this.state.token,
                'Content-Type': 'application/json'
            },
            data: data
          };
    
          //console.log(options);
          const resp = await axios(options);

          return resp.data;
    }

    salesForceContact = async () => {

        const options = {
            url: '/api/aapi/salesforce',
            method: 'post',
            data: {
                firstname: this.state.firstName, //req.body.username,
                lastname: this.state.lastName, //req.body.password,
                email: this.state.email
              }
        };

        console.log(options);
        const resp = await axios(options);

        return resp.data;
    }

    login = async () => {
        //var postData = { user: this.state.username, pwd: this.state.password }
        //return axios.post('/api/validatecreds', postData);
        return await getTokens(this.state.user, this.state.password);

      }

    validateEmail = async () => {
            // with datastore configured, need to have identity provided to validate email
            //var postData = { user: this.state.user, email: this.state.email } - with staged account we see it as locked
            var postData = { user: 'admin', email: this.state.email }
            return await axios.post('/api/validateemail', postData);
    }

    generateQR = async (user) => {
        const result = await axios.get('/api/enrollment/Generate.QR/'+user);
        console.log(result);
        return result;
     }
    
     validateEnrollment = async (user, enrollmentCode, totp) => {
        var postData = { enrollmentCode: enrollmentCode, totp: totp }
        const result = await axios.post('/api/enrollment/validate/'+user, postData);
        console.log(result);
        return result;
     }

    handleSubmit(event) {
        event.preventDefault();
        // login the user if account exists
        if(this.state.password === this.state.validate_password && this.state.agree === true) {
            this.setState(prevState => ({isLoading: !prevState.isLoading}));
            
            

            this.createUser().then(res => {
                // happy path
                this.setState(prevState => ({register: !prevState.register}));
                //this.setState(prevState => ({verify: !prevState.verify}));
                this.setState(prevState => ({qrEnroll: !prevState.qrEnroll}));
                console.log(res);

                this.setState({user_id: res.id});

                this.generateQR(this.state.user).then(results => {
                    console.log(results.data);
                    this.setState({qrCode: results.data.qrCodeBase64});
                    this.setState({enrollmentCode: results.data.enrollmentCode});
                });

                this.validateEmail().then(res => {
                    console.log(res.data);
                    this.setState({otp: res.data.otp});
                }).catch(error => {
                    console.log(error.data);
                });
                this.setState(prevState => ({isLoading: !prevState.isLoading}));
                
            }).catch(error => {
                console.log(error.response.data);
                this.setState(prevState => ({isLoading: !prevState.isLoading}));
            });

        }
        else {

        }
    }

    handleVerify(event) {
        event.preventDefault();
        if(this.state.otp === this.state.validate_otp) {
            this.updateUser().then(res => {
                console.log(res);
                this.login().then(res => {
                    console.log(res);
                    if(res.access_token !== undefined) {
                        // successful login here
                        window.localStorage.setItem('token', res.access_token);
                        window.localStorage.setItem('id_token', res.id_token);
                        window.localStorage.setItem('idp_ID', this.state.user);
                        window.localStorage.setItem('ids_ID', this.state.user_id);
                        
                        this.salesForceContact().then(res => {
                            console.log(res.data);
                            // redirect to home page
                            this.props.history.push('/');
                        }).catch(error => {
                            console.log(error);
                        });
                    } else {
                        this.setState({ errorMessage: res.error_description });
                    }
                }).catch(error => {
                    console.log(error.response.data);
                    this.setState({ errorMessage: error.response.data.error_description });
                });
            }).catch(error => {

            });
        }
        else {

        }
    }

    handleQREnroll(event) {
        event.preventDefault();

        this.validateEnrollment(this.state.user, this.state.enrollmentCode, this.state.totp).then(res => {

            console.log(res.data);

            this.setState(prevState => ({qrEnroll: !prevState.qrEnroll}));
            this.setState(prevState => ({verify: !prevState.verify}));
        })
    }

    async componentDidMount() {
    }

    render() {
        return (
            <div id="appCapsule">
                { this.state.isLoading && 
                <div id="loader">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Creating your Account</h5>
                            <p className="card-text">Hold on a moment while we get your account ready.</p>
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                  </div>
                </div>
                }
                { this.state.register &&
                <div>
                    <div className="section mt-2 text-center">
                        <h1>Register now</h1>
                        <h4>Create an account</h4>
                    </div>
                    <div className="section mb-5 p-2">
                        <form onSubmit={this.handleSubmit}>
                            <div className="card">

                                <div className="card-body">
                                    <div className="form-group basic">
                                        <div className="input-wrapper">
                                            <label className="label" htmlFor="user">User ID</label>
                                            <input type="text" className="form-control" id="user" placeholder="Enter User ID" 
                                            value={this.state.user} onChange={this.handleUser} />
                                            <i className="clear-input">
                                                <ion-icon name="close-circle"></ion-icon>
                                            </i>
                                        </div>
                                    </div>

                                    <div className="form-group basic">
                                        <div className="input-wrapper">
                                            <label className="label" htmlFor="firstName">First Name</label>
                                            <input type="text" className="form-control" id="firstName" placeholder="Enter First Name" 
                                            value={this.state.firstName} onChange={this.handleFirstName} />
                                            <i className="clear-input">
                                                <ion-icon name="close-circle"></ion-icon>
                                            </i>
                                        </div>
                                    </div>

                                    <div className="form-group basic">
                                        <div className="input-wrapper">
                                            <label className="label" htmlFor="lastName">Last Name</label>
                                            <input type="text" className="form-control" id="lastName" placeholder="Enter Last Name" 
                                            value={this.state.lastName} onChange={this.handleLastName} />
                                            <i className="clear-input">
                                                <ion-icon name="close-circle"></ion-icon>
                                            </i>
                                        </div>
                                    </div>

                                    <div className="form-group basic">
                                        <div className="input-wrapper">
                                            <label className="label" htmlFor="email1">E-mail</label>
                                            <input type="email" className="form-control" id="email1" placeholder="Enter E-mail" 
                                            value={this.state.email} onChange={this.handleEmail} />
                                            <i className="clear-input">
                                                <ion-icon name="close-circle"></ion-icon>
                                            </i>
                                        </div>
                                    </div>

                                    <div className="form-group basic">
                                        <div className="input-wrapper">
                                            <label className="label" htmlFor="password1">Password</label>
                                            <input type="password" className="form-control" id="password1" autoComplete="off"
                                                placeholder="Enter Password" value={this.state.password} onChange={this.handlePassword} />
                                            <i className="clear-input">
                                                <ion-icon name="close-circle"></ion-icon>
                                            </i>
                                        </div>
                                    </div>

                                    <div className="form-group basic">
                                        <div className="input-wrapper">
                                            <label className="label" htmlFor="password2">Password Again</label>
                                            <input type="password" className="form-control" id="password2" autoComplete="off"
                                                placeholder="Enter Password Again" value={this.state.validate_password} onChange={this.handleValidatePassword} />
                                            <i className="clear-input">
                                                <ion-icon name="close-circle"></ion-icon>
                                            </i>
                                        </div>
                                    </div>

                                    <div className="custom-control custom-checkbox mt-2 mb-1">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="customCheckb1" 
                                            value={this.state.agree} onChange={this.hanndleAgree} />
                                            <label className="form-check-label" htmlFor="customCheckb1">
                                                I agree <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">terms and
                                                    conditions</a>
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="form-button-group transparent">
                                <button type="submit" className="btn btn-primary btn-block btn-lg">Register</button>
                            </div>

                        </form>
                    </div>
                </div>
             }
             { this.state.verify &&
                <div>
                    <div className="section mt-2 text-center">
                        <h1>Enter OTP Code</h1>
                        <h4>Enter 6 digit otp verification code sent to your email</h4>
                    </div>
                    <div className="section mb-5 p-2">
                        <form onSubmit={this.handleVerify}>
                            <div className="form-group basic">
                                <input type="text" className="form-control verification-input" id="smscode" placeholder="••••••"
                                    maxLength="6" value={this.state.validate_otp} onChange={this.handleValidateOTP} />
                            </div>

                            <div className="form-button-group transparent">
                                <button type="submit" className="btn btn-primary btn-block btn-lg">Verify</button>
                            </div>

                        </form>
                    </div>
                </div>
            }
            { this.state.qrEnroll &&
                <div>
                    <div className="section mt-2 text-center">
                        <h1>Scan QR Code</h1>
                        <h4>Enter 6 digit otp verification code after scanning</h4>
                    </div>
                    <div className="section mb-5 p-2">
                        <form onSubmit={this.handleQREnroll}>
                        <div className="form-group basic">
                            {this.state.qrCode ?
                                    <img src={`data:image/png;base64,${this.state.qrCode}`}/>:
                                '' }
                            </div>
                            <div className="form-group basic">
                                <input type="text" className="form-control verification-input" id="smscode" placeholder="••••••"
                                    maxLength="6" value={this.state.totp} onChange={this.handleTotp} />
                            </div>
                            
                            <div className="form-button-group transparent">
                                <button type="submit" className="btn btn-primary btn-block btn-lg">Verify</button>
                            </div>

                        </form>
                    </div>
                </div>
            }
            </div>
        );
    }
}

export default Register;
