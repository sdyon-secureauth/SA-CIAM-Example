import React from 'react';
const axios = require('axios');
const qs = require('qs');



class Auth extends React.Component {
    constructor(props) {
      super(props);
      this.state = { errorMessage: '', idp_id: '', ids_id: '', otp: '', validate_otp: '', auth: true, verify: false,
        factors: [], sms_field: { id: '', factorid: '', value: ''}, call_field: { id: '', factorid: '', value: ''}, 
        email_field: { id: '', factorid: '', value: ''}, pushtoaccept_field: { id: '', factorid: ''} };
  
      this.handleEmail = this.handleEmail.bind(this);
      this.handleSMS = this.handleSMS.bind(this);
      this.handleCall = this.handleCall.bind(this);
      this.handlePushToAccept = this.handlePushToAccept.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleValidateOTP = this.handleValidateOTP.bind(this);
    }

    getMFAMethods = async (user) => {
        var postData;
        if(this.state.idp_id !== '') {
            postData = { user: this.state.idp_id }
        }
        else {
            postData = { user: user }
        }
        console.log(postData);

        return await axios.post('/api/mfamethods', postData);
    }

    handleEmail(event) {
        this.setState(prevState => ({auth: !prevState.auth}));
        this.setState(prevState => ({verify: !prevState.verify}));
        this.validateEmail().then(res => {
            console.log(res.data);
            this.setState({otp: res.data.otp});
        }).catch(error => {
            console.log(error.data);
        })
    }

    handleSMS(event) {
        this.setState(prevState => ({auth: !prevState.auth}));
        this.setState(prevState => ({verify: !prevState.verify}));
        this.validateSMS().then(res => {
            console.log(res.data);
            this.setState({otp: res.data.otp});
        }).catch(error => {
            console.log(error.data);
        })
    }

    handleCall(event) {
        this.setState(prevState => ({auth: !prevState.auth}));
        this.setState(prevState => ({verify: !prevState.verify}));
        this.validateCall().then(res => {
            console.log(res.data);
            this.setState({otp: res.data.otp});
        }).catch(error => {
            console.log(error.data);
        })
    }

    handlePushToAccept(event) {
        this.setState(prevState => ({auth: !prevState.auth}));
        this.setState(prevState => ({verify: !prevState.verify}));
        this.validateCall().then(res => {
            console.log(res.data);
            this.setState({otp: res.data.otp});
        }).catch(error => {
            console.log(error.data);
        })
    }
  
    handleSubmit(event) {
        // prevent form load
        event.preventDefault();
        // login the user if account exists
        if(this.state.otp === this.state.validate_otp) {
            this.sendData();
        }
    }

    sendData = () => {
        this.props.parentCallback("auth complete.");
    }

    validateEmail = async () => {
        // with datastore configured, need to have identity provided to validate email
        //var postData = { user: this.state.user, email: this.state.email } - with staged account we see it as locked
        var postData = { user: this.state.idp_id, email: this.state.email_field.value }
        console.log(postData);
        return await axios.post('/api/validateemail', postData);
    }

    validateSMS = async () => {
        // with datastore configured, need to have identity provided to validate email
        //var postData = { user: this.state.user, email: this.state.email } - with staged account we see it as locked
        var postData = { user: this.state.idp_id, sms: this.state.sms_field.value }
        console.log(postData);
        return await axios.post('/api/validatesms', postData);
    }

    validateCall = async () => {
        // with datastore configured, need to have identity provided to validate email
        //var postData = { user: this.state.user, email: this.state.email } - with staged account we see it as locked
        var postData = { user: this.state.idp_id, call: this.state.call_field.value }
        console.log(postData);
        return await axios.post('/api/validatecall', postData);
    }

    validatePushToAccept = async () => {
        // with datastore configured, need to have identity provided to validate email
        //var postData = { user: this.state.user, email: this.state.email } - with staged account we see it as locked
        var postData = { user: this.state.idp_id, call: this.state.call_field.value }
        console.log(postData);
        return await axios.post('/api/validatepushtoaccept', postData);
    }

    handleValidateOTP(event) {
        this.setState({validate_otp: event.target.value});
    }

      closeMessage = async () => {
        this.setState({ errorMessage: ''});
      }

      async componentDidMount() {
        console.log(this.props.user);

        if (window.localStorage.getItem('token')) {
          console.log(window.localStorage.getItem('token'));
        }
        if(window.localStorage.getItem('id_token')) {
            console.log(window.localStorage.getItem('id_token'));
        }
        if(window.localStorage.getItem('ids_ID')) {
            console.log(window.localStorage.getItem('ids_ID'));
            this.setState({ids_id: window.localStorage.getItem('ids_ID')});
        }
        if(window.localStorage.getItem('idp_ID') || this.props.user) {
            var idp_user;
            if(window.localStorage.getItem('idp_ID')) {
                console.log(window.localStorage.getItem('idp_ID'));
                this.setState({idp_id: window.localStorage.getItem('idp_ID')});
                idp_user = window.localStorage.getItem('idp_ID');
            } else {
                idp_user = this.props.user;
                this.setState({idp_id: this.props.user});
                console.log(this.props.user);
            }
            var res = await this.getMFAMethods(idp_user);
            console.log(res.data);
            this.setState({ factors: res.data.factors });

            this.state.factors.map((factor, index) => {
                if(factor.type === 'phone') {
                    factor.capabilities.map((capability, index) => {
                        if(capability === 'sms') {
                            this.setState(prevState => ({ sms_field: { id: index, factorid: factor.id, value: factor.value } }));
                        }
                        if(capability === 'call') {
                            this.setState(prevState => ({ call_field: { id: index, factorid: factor.id, value: factor.value } }));
                        }
                    });
                }
                if(factor.type === 'email') {
                    this.setState(prevState => ({ email_field: { id: index, factorid: factor.id, value: factor.value } }));
                }
                if(factor.type === 'push') {
                    console.log(factor);
                    this.setState(prevState => ({ pushtoaccept_field: { id: index, factorid: factor.id } }));
                }
            });  
        }

      }


    render() {
        return (   
        <div id="appCapsule">
            { this.state.auth &&
            <div>
            <div className="section mt-2 text-center">
                <h1>2 Step Verification</h1>
                <h4>Select your verification method</h4>
            </div>
                <div className="section  pt-1">
                    <div className="wallet-card">
                        <div className="wallet-footer2">
                            { this.state.sms_field.factorid && 
                            <div className="item">
                                    <a href="#" onClick={this.handleSMS}>
                                        <div className="icon-wrapper">
                                            <ion-icon name="chatbox-ellipses-outline"></ion-icon>
                                        </div>
                                        <strong>SMS</strong>
                                    </a>
                                </div>
                            }
                            { this.state.call_field.factorid &&
                                <div className="item">
                                    <a href="#" onClick={this.handleCall}>
                                        <div className="icon-wrapper">
                                            <ion-icon name="call-outline"></ion-icon>
                                        </div>
                                        <strong>Call</strong>
                                    </a>
                                </div>
                            }
                            { this.state.email_field.factorid &&
                                <div className="item">
                                    <a href="#" onClick={this.handleEmail}>
                                        <div className="icon-wrapper">
                                            <ion-icon name="mail-outline"></ion-icon>
                                        </div>
                                        <strong>E-Mail</strong>
                                    </a>
                                </div>
                            }
                            { this.state.pushtoaccept_field.factorid &&
                                <div className="item">
                                    <a href="#">
                                        <div className="icon-wrapper">
                                            <ion-icon name="phone-portrait-outline"></ion-icon>
                                        </div>
                                        <strong>Push to Accept</strong>
                                    </a>
                                </div>
                            }
                            </div>

                        </div>
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
                        <form onSubmit={this.handleSubmit}>
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
        </div>


     
            ); 
    }
}

export default Auth;