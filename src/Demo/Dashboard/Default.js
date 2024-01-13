import React from 'react';
import { Row, Col, Card, Table, Tabs, Tab } from 'react-bootstrap';

import Aux from "../../hoc/_Aux";
import DEMO from "../../store/constant";

import avatar1 from '../../assets/images/user/avatar-1.jpg';
import avatar2 from '../../assets/images/user/avatar-2.jpg';
import avatar3 from '../../assets/images/user/avatar-3.jpg';
import { FaDoorOpen } from 'react-icons/fa';
import AuthenticationService from '../../service/Authenticatonservice';
import CustomerAuthenticationservice from '../../service/CustomerAuthenticationservice';
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice"
import { Dialog, IconButton } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);



const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

const SpinnerDiv = styled.div`
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: RGBA(0, 0, 0, 0.2);
  display: grid;
  color: RGBA(51, 102, 0, 1)
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

class Dashboard extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            show_progress_status: false,
            app_users: [],
            tickets: [],
            schedule_list: [],
            closesession: false,
            loggingIn: false,
            loginType : "customer",
            open: false,
            _notificationSystem: null,
            confirmpassword: '',
            password: '',
            mpesa_success: [],
            mpesa_data: {},
            mpesa_success_trx: [],
            mpesa_data_trx: {},
            options: {},
            options_trx: {},
            show_graph: false,
            graph_title: "",
            show_graph_trx_graph:false,
            total_amount:0,
            balance:{},

            pesaflow_success: [],
            pesaflow_data: {},
            pesaflow_success_trx: [],
            pesaflow_data_trx: {},
            pesaflowoptions: {},
            pesaflowoptions_trx: {},
            pesaflowshow_graph: false,
            pesaflowgraph_title: "",
            pesaflowshow_graph_trx_graph:false,
            pesaflowtotal_amount:0,
            
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
     
        if (JSON.stringify(AuthenticationService.getUser()) == '{}' && JSON.stringify(CustomerAuthenticationservice.getCustomer()) == '{}' ) {
            this.logout();
        } else {

            if(Object.keys(AuthenticationService.getUser()).length > 0){
                this.setState({ 
                    loginType: 'admin'
                });
            //Extract force password change status
            if (AuthenticationService.getUser().data.systemUser.force_password_change == true) {
                this.setState({
                    open: true
                });
            }
            }else if(Object.keys(CustomerAuthenticationservice.getCustomer()).length > 0){

                this.setState({ 
                    loginType: 'customer'
                });
            //Extract force password change status
            if (CustomerAuthenticationservice.getCustomer().data.customer.force_password_change == true) {
                this.setState({
                    open: true
                });
            }
            }

        }
    }

    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");
        AuthenticationService.logout();
        CustomerAuthenticationservice.logout();

    }
    // async getUsers() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponse = await APIService.makeApiGetRequest("mobile_app/users_report");
    //     if (apiResponse.status == 403) {
    //         this.setState({ closesession: true });
    //         notification.addNotification({
    //             message: apiResponse.message,
    //             level: 'error',
    //             autoDismiss: 5
    //         });
    //     } else {


    //         this.setState({ app_users: apiResponse });

    //     }
    // }

    // async getSmsBalance() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let params = {};
    //     let apiResponse = await APIService.makePostRequest("smsconfig/check_balance", params);
    //     if (apiResponse.status == 403) {
    //         this.setState({ closesession: true });
    //         notification.addNotification({
    //             message: apiResponse.message,
    //             level: 'error',
    //             autoDismiss: 5
    //         });
    //     } else {


    //         this.setState({ balance: apiResponse });

    //     }
    // }

    // async getTickets() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponse = await APIService.makeApiGetRequest("tickets/payment_generated");
    //     if (apiResponse.status == 403) {
    //         this.setState({ closesession: true });
    //         notification.addNotification({
    //             message: apiResponse.message,
    //             level: 'error',
    //             autoDismiss: 5
    //         });
    //     } else {

    //         this.setState({ tickets: apiResponse });
    //     }
    // }
    // async getScheduled() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponse = await APIService.makeApiGetRequest("schedule/list");




    //     if (apiResponse.status == 403) {

    //     } else {
    //         let change_list = apiResponse.filter(c => {
    //             return c.status === "Completed"
    //         });
    //         this.setState({ schedule_list: change_list });
    //     }

    // }

    // async getData() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponse = await APIService.makeApiGetRequest("transactions/mpesa_trx_data_confirmed");
    //     let apiResponseError = await APIService.makeApiGetRequest("transactions/mpesa_trx_data_error");
    //     let apiResponsePending = await APIService.makeApiGetRequest("transactions/mpesa_trx_data_pending");



    //     let valuesConfirmed = [];

    //     valuesConfirmed.push(apiResponse["Jan"]);
    //     valuesConfirmed.push(apiResponse["Feb"]);
    //     valuesConfirmed.push(apiResponse["Mar"]);
    //     valuesConfirmed.push(apiResponse["Apr"]);
    //     valuesConfirmed.push(apiResponse["May"]);
    //     valuesConfirmed.push(apiResponse["June"]);
    //     valuesConfirmed.push(apiResponse["July"]);
    //     valuesConfirmed.push(apiResponse["Aug"]);
    //     valuesConfirmed.push(apiResponse["Sept"]);
    //     valuesConfirmed.push(apiResponse["Oct"]);
    //     valuesConfirmed.push(apiResponse["Nov"]);
    //     valuesConfirmed.push(apiResponse["Dec"]);

    //     let valuesError = [];
    //     valuesError.push(apiResponseError["Jan"]);
    //     valuesError.push(apiResponseError["Feb"]);
    //     valuesError.push(apiResponseError["Mar"]);
    //     valuesError.push(apiResponseError["Apr"]);
    //     valuesError.push(apiResponseError["May"]);
    //     valuesError.push(apiResponseError["June"]);
    //     valuesError.push(apiResponseError["July"]);
    //     valuesError.push(apiResponseError["Aug"]);
    //     valuesError.push(apiResponseError["Sept"]);
    //     valuesError.push(apiResponseError["Oct"]);
    //     valuesError.push(apiResponseError["Nov"]);
    //     valuesError.push(apiResponseError["Dec"]);

    //     let valuesPending = [];
    //     valuesPending.push(apiResponsePending["Jan"]);
    //     valuesPending.push(apiResponsePending["Feb"]);
    //     valuesPending.push(apiResponsePending["Mar"]);
    //     valuesPending.push(apiResponsePending["Apr"]);
    //     valuesPending.push(apiResponsePending["May"]);
    //     valuesPending.push(apiResponsePending["June"]);
    //     valuesPending.push(apiResponsePending["July"]);
    //     valuesPending.push(apiResponsePending["Aug"]);
    //     valuesPending.push(apiResponsePending["Sept"]);
    //     valuesPending.push(apiResponsePending["Oct"]);
    //     valuesPending.push(apiResponsePending["Nov"]);
    //     valuesPending.push(apiResponsePending["Dec"]);






    //     const datas = {
    //         labels,
    //         datasets: [
    //             {
    //                 label: 'Success',
    //                 data: valuesConfirmed,
    //                 borderColor: 'rgb(34,139,34)',
    //                 backgroundColor: 'rgba(34,139,34, 0.5)',
    //             },
    //             {
    //                 label: 'Failed',
    //                 data: valuesError,
    //                 borderColor: 'rgb(255, 99, 132)',
    //                 backgroundColor: 'rgba(255, 99, 132, 0.5)',
    //             },
    //             {
    //                 label: 'Pending confirmation',
    //                 data: valuesPending,
    //                 borderColor: 'rgb(128, 128, 128)',
    //                 backgroundColor: 'rgba(128, 128, 128, 0.5)',
    //             }

    //         ],
    //     };
    //     const date = Date().split(" ");
    //     // we use a date string to generate our filename.
    //     const dateStr = date[3];

    //     const mpesa_options = {
    //         responsive: true,
    //         plugins: {
    //             legend: {
    //                 position: 'top',
    //             },
    //             title: {
    //                 display: true,
    //                 text: 'No of Mpesa Transactions ' + dateStr,
    //             },
    //         },
    //     };
    //     this.setState({
    //         mpesa_data: datas,
    //         show_graph: true,
    //         options: mpesa_options
    //     });


    // }
    // async getPesaflowData() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponse = await APIService.makeApiGetRequest("transactions/pesaflow_trx_data_confirmed");
    //     let apiResponsePending = await APIService.makeApiGetRequest("transactions/pesaflow_trx_data_pending");



    //     let valuesConfirmed = [];

    //     valuesConfirmed.push(apiResponse["Jan"]);
    //     valuesConfirmed.push(apiResponse["Feb"]);
    //     valuesConfirmed.push(apiResponse["Mar"]);
    //     valuesConfirmed.push(apiResponse["Apr"]);
    //     valuesConfirmed.push(apiResponse["May"]);
    //     valuesConfirmed.push(apiResponse["June"]);
    //     valuesConfirmed.push(apiResponse["July"]);
    //     valuesConfirmed.push(apiResponse["Aug"]);
    //     valuesConfirmed.push(apiResponse["Sept"]);
    //     valuesConfirmed.push(apiResponse["Oct"]);
    //     valuesConfirmed.push(apiResponse["Nov"]);
    //     valuesConfirmed.push(apiResponse["Dec"]);



    //     let valuesPending = [];
    //     valuesPending.push(apiResponsePending["Jan"]);
    //     valuesPending.push(apiResponsePending["Feb"]);
    //     valuesPending.push(apiResponsePending["Mar"]);
    //     valuesPending.push(apiResponsePending["Apr"]);
    //     valuesPending.push(apiResponsePending["May"]);
    //     valuesPending.push(apiResponsePending["June"]);
    //     valuesPending.push(apiResponsePending["July"]);
    //     valuesPending.push(apiResponsePending["Aug"]);
    //     valuesPending.push(apiResponsePending["Sept"]);
    //     valuesPending.push(apiResponsePending["Oct"]);
    //     valuesPending.push(apiResponsePending["Nov"]);
    //     valuesPending.push(apiResponsePending["Dec"]);






    //     const datas = {
    //         labels,
    //         datasets: [
    //             {
    //                 label: 'Success',
    //                 data: valuesConfirmed,
    //                 borderColor: 'rgb(34,139,34)',
    //                 backgroundColor: 'rgba(34,139,34, 0.5)',
    //             },
    //             {
    //                 label: 'Pending confirmation',
    //                 data: valuesPending,
    //                 borderColor: 'rgb(128, 128, 128)',
    //                 backgroundColor: 'rgba(128, 128, 128, 0.5)',
    //             }

    //         ],
    //     };
    //     const date = Date().split(" ");
    //     // we use a date string to generate our filename.
    //     const dateStr = date[3];

    //     const pesaflow_options = {
    //         responsive: true,
    //         plugins: {
    //             legend: {
    //                 position: 'top',
    //             },
    //             title: {
    //                 display: true,
    //                 text: 'No of Pesaflow Transactions ' + dateStr,
    //             },
    //         },
    //     };
    //     this.setState({
    //         pesaflow_data: datas,
    //         pesaflowshow_graph: true,
    //         pesaflowoptions: pesaflow_options
    //     });


    // }


    // async getDataTrx() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponseTrx = await APIService.makeApiGetRequest("transactions/mpesa_trx_data");


       

    //     let valuesTrx = [];
    //     valuesTrx.push(apiResponseTrx["Jan"]);
    //     valuesTrx.push(apiResponseTrx["Feb"]);
    //     valuesTrx.push(apiResponseTrx["Mar"]);
    //     valuesTrx.push(apiResponseTrx["Apr"]);
    //     valuesTrx.push(apiResponseTrx["May"]);
    //     valuesTrx.push(apiResponseTrx["June"]);
    //     valuesTrx.push(apiResponseTrx["July"]);
    //     valuesTrx.push(apiResponseTrx["Aug"]);
    //     valuesTrx.push(apiResponseTrx["Sept"]);
    //     valuesTrx.push(apiResponseTrx["Oct"]);
    //     valuesTrx.push(apiResponseTrx["Nov"]);
    //     valuesTrx.push(apiResponseTrx["Dec"]);

    //    //get the total
    //    var total = 0;
    //    valuesTrx.forEach(t=>{
    //      total+=t;
    //    });
      

    //     const datas = {
    //         labels,
    //         datasets: [
    //             {
    //                 label: 'Total Amount(Kshs)',
    //                 data: valuesTrx,
    //                 borderColor: 'rgb(34,139,34)',
    //                 backgroundColor: 'rgba(34,139,34, 0.5)',
    //             },

    //         ],
    //     };
    //     const date = Date().split(" ");
    //     // we use a date string to generate our filename.
    //     const dateStr = date[3];

    //     const mpesa_options = {
    //         responsive: true,
    //         plugins: {
    //             legend: {
    //                 position: 'top',
    //             },
    //             title: {
    //                 display: true,
    //                 text: 'Total Amount of Mpesa Transactions  in ' + dateStr +': Ksh '+ total +".00",
    //             },
    //         },
    //     };
    //     this.setState({
    //         mpesa_data_trx: datas,
    //         show_graph_trx_graph: true,
    //         options_trx: mpesa_options,
    //         total_amount: total,
    //     });


    // }
    // async getPesaflowDataTrx() {
    //     //call API
    //     const notification = this.notificationSystem.current;
    //     let apiResponseTrx = await APIService.makeApiGetRequest("transactions/pesaflow_trx_data");


       

    //     let valuesTrx = [];
    //     valuesTrx.push(apiResponseTrx["Jan"]);
    //     valuesTrx.push(apiResponseTrx["Feb"]);
    //     valuesTrx.push(apiResponseTrx["Mar"]);
    //     valuesTrx.push(apiResponseTrx["Apr"]);
    //     valuesTrx.push(apiResponseTrx["May"]);
    //     valuesTrx.push(apiResponseTrx["June"]);
    //     valuesTrx.push(apiResponseTrx["July"]);
    //     valuesTrx.push(apiResponseTrx["Aug"]);
    //     valuesTrx.push(apiResponseTrx["Sept"]);
    //     valuesTrx.push(apiResponseTrx["Oct"]);
    //     valuesTrx.push(apiResponseTrx["Nov"]);
    //     valuesTrx.push(apiResponseTrx["Dec"]);

    //    //get the total
    //    var total = 0;
    //    valuesTrx.forEach(t=>{
    //      total+=t;
    //    });
      

    //     const datas = {
    //         labels,
    //         datasets: [
    //             {
    //                 label: 'Total Amount(Kshs)',
    //                 data: valuesTrx,
    //                 borderColor: 'rgb(34,139,34)',
    //                 backgroundColor: 'rgba(34,139,34, 0.5)',
    //             },

    //         ],
    //     };
    //     const date = Date().split(" ");
    //     // we use a date string to generate our filename.
    //     const dateStr = date[3];

    //     const pesaflow_options = {
    //         responsive: true,
    //         plugins: {
    //             legend: {
    //                 position: 'top',
    //             },
    //             title: {
    //                 display: true,
    //                 text: 'Total Amount of Pesaflow Transactions  in ' + dateStr +': Ksh '+ total +".00",
    //             },
    //         },
    //     };
    //     this.setState({
    //         pesaflow_data_trx: datas,
    //         pesaflowshow_graph_trx_graph: true,
    //         pesaflowoptions_trx: pesaflow_options,
    //         pesaflowtotal_amount: total,
    //     });


    // }
    async updatePassword() {
        this.setState({ loggingIn: true, show_progress_status: true });
        const notification = this.notificationSystem.current;


            let params = {};

            params["newpassword"] = this.state.password
            params["confirmpassword"] = this.state.confirmpassword

            let result = await APIService.makePostRequest("authentication/customer/force_password_change", params);

            if (result.success) {
                //Go to dashboar

                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.setState({ loggingIn: false, show_progress_status: false });
                this.logout();
            } else {


                notification.addNotification({
                    message: result.message,
                    level: 'error',
                    autoDismiss: 5
                });

            }

            this.setState({ loggingIn: false, show_progress_status: false });
        
    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };

    render() {


        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
               
                <Row>
                    <Col md={6} xl={4}>
                        
                     </Col>
                </Row>
                <Dialog
                    open={this.state.closesession}

                    fullWidth

                >

                    <div className="card">
                        <center>
                            <Lottie
                                loop
                                animationData={lottieJson}
                                play
                                style={{ width: 50, height: 50 }}
                            />
                        </center>
                        <div className="card-body text-center">
                            <h3>Your session has expired</h3>
                            <br />
                            <br />
                            <h4>Please log in again</h4>



                        </div>
                        <div className="card-body text-center">
                            <IconButton onClick={() => { this.logout() }}>

                                <FaDoorOpen size={50} title='Exit' color='red' />
                            </IconButton>
                        </div>


                    </div>

                </Dialog>

                <Dialog
                    open={this.state.open}
                    //onClose={this.closeDialog.bind(this)}
                    fullWidth

                >
          {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                    <div className="card">

                        <div className="card-body text-center">
                            <center>
                                <Lottie
                                    loop
                                    animationData={lottieJson}
                                    play
                                    style={{ width: 50, height: 50 }}
                                />
                            </center>

                            <h3 className="mb-4">Please change your password</h3>
                            <div className="input-group mb-3">
                                <input type="password" className="form-control" placeholder="Password" value={this.state.password} onChange={e => this.handleChange(e, "password")} />
                            </div>
                            <div className="input-group mb-4">
                                <input type="password" className="form-control" placeholder="Confirm password" value={this.state.confirmpassword} onChange={e => this.handleChange(e, "confirmpassword")} />
                            </div>

                            <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.updatePassword() }}>Reset</button>
                            {this.state.loggingIn && (<img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />)}
                        </div>
                    </div>


                </Dialog>

            </Aux>
        );
    }
}

export default Dashboard;