import React from 'react';
import Lottie from 'react-lottie-player'
import lottieJson from './lottie.json';
import { Card, Fade, Tab, Tabs,  } from 'react-bootstrap';

import './../../../assets/scss/style.scss';
import Aux from "../../../hoc/_Aux";
import Breadcrumb from "../../../App/layout/AdminLayout/Breadcrumb";
import NotificationSystem from "react-notification-system";
import AuthenticationService from '../../../service/Authenticatonservice';
import CustomerAuthenticationservice from '../../../service/CustomerAuthenticationservice';
import APIService from '../../../service/Apiservice';
import CircularProgress from "../../components/CircularProgress";
import { Dialog, DialogContent, DialogActions } from '@material-ui/core';
import styled from "styled-components";
import "./Login.css";
import "./Tab.css";
import "./Card.css";

const SpinnerDiv = styled.div`
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: RGBA(0, 0, 0, 0.2);
  color: RGBA(51, 102, 0, 1);
  display: grid;
  place-items: center;
  z-index: 10;
  `;

var custom_notification_style = {
  NotificationItem: { // Override the notification item
    DefaultStyle: { // Applied to every notification, regardless of the notification level
      margin: '10px 5px 2px 1px'
    },

    warning: {
      color: 'white',
      backgroundColor: "orange",
      textStyle: "bold"
    },
    error: {
      color: 'white',
      backgroundColor: "red",
      textStyle: "bold"
    },
    success: {
      color: 'white',
      backgroundColor: "green",
      textStyle: "bold"
    }
  }
}
class Login extends React.Component {
  notificationSystem = React.createRef();
  constructor(props) {
    super();
    this.state = {
      show_progress_status: false,
      username: '',
      password: '',
      confirmpassword: '',
      newpassword: '',
      email: '',
      firstname: '',
      surname: '',
      phonenumber: '',
      companyname: '',
      companykrapin: '',
      lastname: '',
      submitted: false,
      loggingIn: false,
      open: false,
      openReg: false,
      disabled:false,
      disabledReg: false,
      registering: false,
      activeTab: 'customer',
      loginType: 'customer',
      _notificationSystem: null
    }
      this.handleTabSelect = this.handleTabSelect.bind(this);
  }
  handleChange = (event, stateName) => {
    this.setState({
      [stateName]: event.target.value
    });
  };
  async loginUser() {

    this.setState({ loggingIn: true,disabled:true, show_progress_status: true });
    let endpoint = "authentication";
    //this.state.loginType === 'customer' ? endpoint = "authentication/customer" : endpoint = "authentication"
    const notification = this.notificationSystem.current;
    if (this.state.username == null || this.state.username === '') {
      this.setState({ loggingIn: false, show_progress_status: false  });

      notification.addNotification({
        message: 'Please enter your email address',
        level: 'warning',
        autoDismiss: 5
      });
    } else if (this.state.password == null || this.state.password === '') {
      this.setState({ loggingIn: false, show_progress_status: false });
      notification.addNotification({
        message: 'Please enter your password',
        level: 'warning',
        autoDismiss: 5
      });
    } else {

      let params = {};
      params["username"] = this.state.username
      params["password"] = this.state.password

      let result = await APIService.makePostRequest(endpoint, params);
      if (result.success) {
        AuthenticationService.setUser(result);
        const { from } = this.props.location.state || {
          from: { pathname: "/dashboard" }
        };
        this.props.history.push(from);
        this.setState({
          disabled:false,
        }) 
      } else {
        this.setState({ loggingIn: false, show_progress_status: false });
        notification.addNotification({
          message: "Login failed. Please check your credentials or create an account",
          level: 'error',
          autoDismiss: 5,
          
        });
        this.setState({
          disabled:false,
        }) 
      }
    }
    this.setState({
      disabled:false,
    })  
  }
  // async registerUser() {

  //   this.setState({ registering: true,disabledReg:true, show_progress_status: true });
  //   let endpoint = "customer/save";
  //   const notification = this.notificationSystem.current;
  //   if (this.state.newpassword !== this.state.confirmpassword) {
  //     this.setState({ registering: false, show_progress_status: false  });

  //     notification.addNotification({
  //       message: 'Password mismatch!',
  //       level: 'warning',
  //       autoDismiss: 5
  //     });
  //   }else if (!this.state.phonenumber.startsWith('254')) {
  //     this.setState({ registering: false, show_progress_status: false  });

  //     notification.addNotification({
  //       message: 'Please enter a valid phone number. It should start with 254',
  //       level: 'warning',
  //       autoDismiss: 5
  //     });
  //   }else {

  //     let params = {};
  //     params["firstname"] = this.state.firstname;
  //     params["lastname"] = this.state.lastname;
  //     params["surname"] = this.state.surname;
  //     params["email"] = this.state.email;
  //     params["phonenumber"] = this.state.phonenumber;
  //     params["companykrapin"] = this.state.companykrapin;
  //     params["companyname"] = this.state.companyname;
  //     params["password"] = this.state.newpassword;
  //     let result = await APIService.makePostRequest(endpoint, params);
  //     if (result.success) {
  //       notification.addNotification({
  //         message: result.message,
  //         level: 'success',
  //         autoDismiss: 5,
          
  //       });
  //       this.closeRegDialog();
  //       this.setState({ registering: false,disabledReg:true, show_progress_status: false });
  //     } else {
  //       this.setState({ registering: false, show_progress_status: false });
  //       notification.addNotification({
  //         message: result.message,
  //         level: 'error',
  //         autoDismiss: 5,
          
  //       });
  //       this.setState({
  //         disabledReg:false,
  //       }) 
  //     }
  //   }
  //   this.setState({
  //     disabledReg:false,
  //   })  
  // }
  closeDialog() {
    this.setState({ open: false });
  };
  openDialog() {
    this.setState({ open: true });
  };

  closeRegDialog() {
    this.setState({ openReg: false });
  };
  openRegDialog() {
    this.setState({ openReg: true });
  };
  validateEmail() {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    if (!pattern.test(this.state.username)) {

      return false;

    }
    return true;
  }
  async updatePassword() {
    this.setState({ loggingIn: true, show_progress_status: true });
    const notification = this.notificationSystem.current;
    if (this.state.username ==null || this.state.username === '') {

      notification.addNotification({
        message: 'Please enter a valid phone number',
        level: 'error',
        autoDismiss: 5
      });
      this.setState({ loggingIn: false, show_progress_status: false });

    } else {

      let params = {};
      params["phonenumber"] = this.state.username
      //params["password"] = this.state.password

      let result = await APIService.makePostRequest("authentication/customer/reset_password", params);

      if (result.success) {
        //Go to dashboar

        notification.addNotification({
          message: 'Password reset was successful. Please check your email',
          level: 'success',
          autoDismiss: 5
        });
      } else {


        notification.addNotification({
          message: 'Sorry, the request could not be completed. Please try again later',
          level: 'error',
          autoDismiss: 5
        });

      }
      this.closeDialog();
      this.setState({ loggingIn: false, show_progress_status: false });
    }
  }
  handleTabSelect(selectedTab){
    console.log("Active tab "+ selectedTab)
    this.setState({
      activeTab: selectedTab,
      loginType: selectedTab
    });
  }
  render() {
    return (

      <div className='Login'>
      <Aux>
      {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
        <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
        <Breadcrumb />

        
        <div className="auth-wrapper">
        <Card className="auth-card">

          <Card.Body>
          <div className="auth-content">
             <div className="mb-4">
               <i className="feather icon-unlock auth-icon" />
             </div>
             <h3 className="mb-4">Login</h3>
            
             <div className="input-group mb-3">
               <input type="email" className="form-control" style={{ color: '#000000' }} placeholder="Email" value={this.state.username} onChange={e => this.handleChange(e, "username")} />
             </div>
             <div className="input-group mb-4">
               <input type="password" className="form-control" placeholder="password" value={this.state.password} onChange={e => this.handleChange(e, "password")} />
             </div>
             <div className="form-group text-left">
               <div className="checkbox checkbox-fill d-inline">
                 <input type="checkbox" name="checkbox-fill-1" id="checkbox-fill-a1" />
               </div>
             </div>
             <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.loginUser() }}>Login</button>
             {this.state.loggingIn && (<img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />)}
            
            </div>
            </Card.Body>
            </Card>
            </div>
            
        {/* <Dialog
          open={this.state.open}
          onClose={this.closeDialog.bind(this)}
          fullWidth

        >
          {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
          <div className="card">

            <div className="card-body text-center">

              <h3 className="mb-4">Reset password</h3>
              <div className="input-group mb-3">
                <input type="number" className="form-control" style={{ color: '#000000' }} placeholder="Phone number (254....)" value={this.state.username} onChange={e => this.handleChange(e, "username")} />
              </div>
              <div className="form-group text-left">
                <div className="checkbox checkbox-fill d-inline">
                  <input type="checkbox" name="checkbox-fill-1" id="checkbox-fill-a1" />
                </div>
              </div>
              <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.updatePassword() }}>Reset</button>
              {this.state.loggingIn && (<img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />)}
            </div>
          </div>


        </Dialog> */}
        {/* <Dialog
          open={this.state.openReg}
          onClose={this.closeRegDialog.bind(this)}
          fullWidth

        >
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
          <div className="card">

            <div className="card-body text-center">

              <h3 className="mb-4">Account creation</h3>
              <div className="input-group mb-3">
                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="First name" value={this.state.firstname} onChange={e => this.handleChange(e, "firstname")} />
              </div>
              <div className="input-group mb-3">
                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Surname" value={this.state.surname} onChange={e => this.handleChange(e, "surname")} />
              </div>
              <div className="input-group mb-3">
                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Last name" value={this.state.lastname} onChange={e => this.handleChange(e, "lastname")} />
              </div>
              <div className="input-group mb-3">
                <input type="number" className="form-control" style={{ color: '#000000' }} placeholder="Phone number (254.....)" value={this.state.phonenumber} onChange={e => this.handleChange(e, "phonenumber")} />
              </div>
              <div className="input-group mb-3">
                <input type="email" className="form-control" style={{ color: '#000000' }} placeholder="Email address" value={this.state.email} onChange={e => this.handleChange(e, "email")} />
              </div>
              <div className="input-group mb-3">
                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Company Name (Optional)" value={this.state.companyname} onChange={e => this.handleChange(e, "companyname")} />
              </div>
              <div className="input-group mb-3">
                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Company KRA PIN (Optional)" value={this.state.companykrapin} onChange={e => this.handleChange(e, "companykrapin")} />
              </div>
              <div className="input-group mb-3">
                <input type="password" className="form-control" placeholder="Password" value={this.state.newpassword} onChange={e => this.handleChange(e, "newpassword")} />
              </div>
              <div className="input-group mb-3">
                <input type="password" className="form-control" placeholder="Confirm password" value={this.state.confirmpassword} onChange={e => this.handleChange(e, "confirmpassword")} />
              </div>
              <div className="form-group text-left">
                <div className="checkbox checkbox-fill d-inline">
                  <input type="checkbox" name="checkbox-fill-1" id="checkbox-fill-a1" />
                </div>
              </div>
              <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.registerUser() }}>Save</button>
              {this.state.registering && (<img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />)}
            </div>
          </div>


        </Dialog> */}
      </Aux>
      </div>

    )
  }


}
export default Login