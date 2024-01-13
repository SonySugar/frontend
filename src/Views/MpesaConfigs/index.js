import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";

import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog, IconButton } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import Authenticatonservice from '../../service/Authenticatonservice';
import EditIcon from '@material-ui/icons/Edit';

import { FaTimes, FaSave, FaDoorOpen } from 'react-icons/fa';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
const SpinnerDiv = styled.div`
text-align: center;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: RGBA(0, 0, 0, 0.2);
display: grid;
place-items: center;
z-index: 10;
`;
class MpesaConfigs extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            configs: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id: '',
            api_username: '',
            api_password: '',
            callback_url: '',
            pass_key: '',
            trx_type: '',
            short_code: '',
            token_url: '',
            stk_push_url: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            show_progress_status: false,
            query_status_url: '',
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getConfigs();
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }
    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getConfigs() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("configs/mpesa");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ configs: apiResponse });


        }

    }

    cellButton(row) {
        return (



            <IconButton onClick={() =>
                this.onClickConfigSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update configs' />
            </IconButton>

        );
    }

    closeUpdateDialog() {
        this.setState({ openUpdate: false });
    }
    openUpdateDialog() {
        this.setState({ openUpdate: true });
    }

    closeAddDialog() {
        this.setState({ open: false });
    }
    openAddDialog() {
        this.setState({ open: true });
    }

    closeDeleteDialog() {
        this.setState({ openDelete: false });
    }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    onClickConfigSelected(row) {
        this.setState({
            id: row.id,
            api_username: row.apiusername,
            api_password: row.apipassword,
            callback_url: row.callbackurl,
            trx_type: row.transactiontype,
            short_code: row.business_short_code,
            token_url: row.tokenurl,
            stk_push_url: row.stkpushurl,
            pass_key: row.passkey,
            query_status_url: row.queryurl

        });
        this.openUpdateDialog();
    }


    async updateConfigs() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;



            let params = {};
            params["id"] = this.state.id;
            params["apiusername"] = this.state.api_username;
            params["apipassword"] = this.state.api_password;
            params["callbackurl"] = this.state.callback_url;
            params["passkey"] = this.state.pass_key;
            params["transactiontype"] = this.state.trx_type;
            params["business_short_code"] = this.state.short_code;
            params["tokenurl"] = this.state.token_url;
            params["stkpushurl"] = this.state.stk_push_url;
            params["queryurl"] = this.state.query_status_url;

            let result = await APIService.makePostRequest("configs/mpesa/update", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeUpdateDialog();
                this.setState({
                    id: '',
                    api_username: '',
                    api_password: '',
                    callback_url: '',
                    pass_key: '',
                    trx_type: '',
                    short_code: '',
                    token_url: '',
                    stk_push_url: '',
                    query_status_url: '',
                });
                this.getConfigs();
                this.setState({ show_progress_status: false });
            } else {
                this.setState({ show_progress_status: false });
                notification.addNotification({
                    message: result.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }
        

    }
    handlerTypeChange(e) {
        this.setState({
            trx_type: e.target.value
        });
    }

    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
               
                        <Card title='Mpesa Configurations' isOption>


                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Paybill Number</Th>
                                        <Th>PassKey</Th>
                                        <Th>ConsumerKey</Th>
                                        <Th>ConsumerSecret</Th>
                                        <Th>Update</Th>


                                    </Tr>

                                </Thead>
                                {this.state.configs==null || this.state.configs.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available...</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.configs.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.business_short_code}
                                                </Td>
                                                <Td>
                                                    {u.passkey}
                                                </Td>
                                                <Td>
                                                    {u.apiusername}
                                                </Td>
                                                <Td>
                                                    {u.apipassword}
                                                </Td>
                                                <Td>{this.cellButton(u)}</Td>

                                            </Tr>
                                        )
                                    )}
                                </Tbody>}
                            </Table>


                        </Card>


                   
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
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <center><h3>Update Mpesa API Configurations</h3></center>
                        <div className="card-body text-left">

                            <Row>

                                <Col>
                                    <label style={{ color: '#000000' }}><b>Paybill number</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Pay bill number" value={this.state.short_code} onChange={e => this.handleChange(e, "short_code")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Pass Key</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Pass Key" value={this.state.pass_key} onChange={e => this.handleChange(e, "pass_key")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Consumer Key</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Consumer Key" value={this.state.api_username} onChange={e => this.handleChange(e, "api_username")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Consumer password</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Consumer Secret" value={this.state.api_password} onChange={e => this.handleChange(e, "api_password")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>STK push url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Stk push url" value={this.state.stk_push_url} onChange={e => this.handleChange(e, "stk_push_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Access token url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Stk token url" value={this.state.token_url} onChange={e => this.handleChange(e, "token_url")} />
                                    </div>

                                    <label style={{ color: '#000000' }}><b>Call back url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Call back url" value={this.state.callback_url} onChange={e => this.handleChange(e, "callback_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Query transaction status url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Query transaction status url" value={this.state.query_status_url} onChange={e => this.handleChange(e, "query_status_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Transaction type</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.trx_type}
                                            onChange={this.handlerTypeChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Transaction Type
                                            </option>
                                            <option value="CustomerPayBillOnline">
                                                CustomerPayBillOnline
                                            </option>

                                            <option value="CustomerBuyGoodsOnline">
                                                CustomerBuyGoodsOnline
                                            </option>
                                        </select>

                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="card-body text-center">
                        <Row>
                            <Col>
                                    <IconButton onClick={() => { this.closeUpdateDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.updateConfigs() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                                </Row>
                        </div>



                    </div>


                </Dialog>

            </Aux>

        );
    }
}

export default MpesaConfigs;