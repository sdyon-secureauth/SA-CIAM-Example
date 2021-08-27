import React from 'react';
import axios from 'axios';
const qs = require('qs');

class DeleteAccount extends React.Component {
    constructor(props) {
      super(props);

      this.state = { idp_id: '', ids_id: '', token: '' };

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

    getIDSUserId = async () => {
        const token = await this.getToken();
        this.setState({token: token});
        //https://daily.qa-ids.secureauth.com/api/v1/scim/ids/{ids_id}/v2/Users
        const options = {
            url: process.env.REACT_APP_TOKEN_URL+'/api/v1/scim/ids/'+process.env.REACT_APP_IDS_STORE+'/v2/Users',
            method: 'get',
            headers: {
                'Authorization': 'Bearer ' +this.state.token,
                'Content-Type': 'application/json'
            },
            params: {
                filter: 'userName eq "' + this.state.idp_id + '"'
            }
          };

          const resp = await axios(options);
          console.log(resp.data.Resources);
          return resp.data.Resources[0].id;

    }

    idsDelete = async () => {
        const token = await this.getToken();
        const ids_id = await this.getIDSUserId();
        this.setState({token: token});
        this.setState({ ids_id: ids_id});
        //https://daily.qa-ids.secureauth.com/api/v1/scim/ids/{ids_id}/v2/Users/{user_id}
        const options = {
            url: process.env.REACT_APP_TOKEN_URL+'/api/v1/scim/ids/'+process.env.REACT_APP_IDS_STORE+'/v2/Users/'+this.state.ids_id,
            method: 'delete',
            headers: {
                'Authorization': 'Bearer ' +this.state.token,
                'Content-Type': 'application/json'
            }
          };
    
          const resp = await axios(options);
    
          return resp.data;
    }


    deleteAccount = async () => {
        var retVal = await this.idsDelete();
        console.log(retVal);
        return await axios.get('/api/delete/user/'+this.state.idp_id+'/devices/1');
    }


    async componentDidMount() {
        if (window.localStorage.getItem('token')) {
            console.log(window.localStorage.getItem('token'));
        } else { 
            this.props.history.push('/login');
        }
        if(window.localStorage.getItem('id_token')) {
            console.log(window.localStorage.getItem('id_token'));
        }
        if(window.localStorage.getItem('ids_ID')) {
            console.log(window.localStorage.getItem('ids_ID'));
            this.setState({ids_id: window.localStorage.getItem('ids_ID')});
        }
        if(window.localStorage.getItem('idp_ID')) {
            console.log(window.localStorage.getItem('idp_ID'));
            this.setState({idp_id: window.localStorage.getItem('idp_ID')});
            await this.deleteAccount();
            window.localStorage.clear();
            this.props.history.push('/login');
            // in order for the redirect to occur, the following is requried
            let pathUrl = window.location.href;
            window.location.href = pathUrl;
        }
    }

    render() {
        return ( 
            <div className='deleteaccount'>
                <div id="appCapsule">
                    <div id="loader">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Deleting your Account</h5>
                                <p className="card-text">Hold on a moment while we clean up.</p>
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DeleteAccount;
