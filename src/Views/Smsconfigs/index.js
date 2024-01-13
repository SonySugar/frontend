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
class SmsConfigs extends React.Component {
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
            service_url: '',
            token_url: '',
            allowsms: 'No',
            _notificationSystem: null,
            show_progress_status: false,
            smslist: [],
            template: '',
            title: '',
            template_id: '',
            call_back_url: '',
            balance_url: '',
            sender: '',
            openUpdateTemplate: false
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
        let apiResponse = await APIService.makeApiGetRequest("smsconfig/list");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ configs: apiResponse });
            this.getTemplates();

        }

    }
    async getTemplates() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("sms_templates/list");

        if (apiResponse.status == 403) {

            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ smslist: apiResponse });


        }

    }

    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickConfigSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update configs' />
            </IconButton>


        );
    }

    cellButtonTemplate(row) {
        const { classes } = this.props;
        return (


            <IconButton onClick={() =>
                this.onClickTemplateSelected(row)
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

    openUpdateTemplateDialog() {
        this.setState({ openUpdateTemplate: true });
    }

    closeUpdateTemplateDialog() {
        this.setState({ openUpdateTemplate: false });
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
            service_url: row.serviceurl,
            token_url: row.tokenurl,
            call_back_url: row.callbackurl,
            sender: row.sender,
            balance_url: row.balance_url

        });
        this.openUpdateDialog();
    }
    onClickTemplateSelected(row) {
        this.setState({
            template_id: row.id,
            template: row.template,
            title: row.title,
            allowsms: row.allowsms,

        });
        this.openUpdateTemplateDialog();
    }

    async updateConfigs() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_api_configurations")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make any updates. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {


            let params = {};
            params["id"] = this.state.id;
            params["api_username"] = this.state.api_username;
            params["api_password"] = this.state.api_password;
            params["service_url"] = this.state.service_url;
            params["token_url"] = this.state.token_url;
            params["call_back_url"] = this.state.call_back_url;
            params["sender"] = this.state.sender;
            params["balance_url"] = this.state.balance_url;

            let result = await APIService.makePostRequest("smsconfig/update", params);
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
                    service_url: '',
                    token_url: '',
                    call_back_url: '',

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


    }
    async updateTemplate() {
        this.closeUpdateTemplateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;


        let params = {};
        params["id"] = this.state.template_id;
        params["template"] = this.state.template;
        params["template_title"] = this.state.title;
        params["allowsms"] = this.state.allowsms;


        let result = await APIService.makePostRequest("sms_templates/update", params);
        if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
            });
            this.closeUpdateTemplateDialog();
            this.setState({
                template_id: '',
                template_title: '',
                template: '',


            });
            this.getTemplates();
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
    handlerAllowSmsChange(e) {
        this.setState({
            allowsms: e.target.value
        });
    }

    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
              
                        <Card title='Bulk SMS Configurations' isOption>




                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Consumer Key</Th>
                                        <Th>Consumer Password</Th>
                                        <Th>Service Url</Th>
                                        <Th>Update</Th>


                                    </Tr>

                                </Thead>
                                {this.state.configs==null || this.state.configs.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available ......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.configs.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.apiusername}
                                                </Td>
                                                <Td>
                                                    {u.apipassword}
                                                </Td>
                                                <Td>
                                                    {u.serviceurl}
                                                </Td>

                                                <Td>{this.cellButton(u)}</Td>

                                            </Tr>
                                        )
                                    )}
                                </Tbody>}
                            </Table>


                        </Card>




               
                        <Card title='Bulk SMS Templates' isOption>



                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Description</Th>
                                        <Th>Template</Th>
                                        <Th>SMS allowed</Th>
                                        <Th>Update</Th>


                                    </Tr>

                                </Thead>
                                {this.state.smslist==null ||this.state.smslist.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.smslist.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.title}
                                                </Td>
                                                <Td>
                                                    {u.template}
                                                </Td>
                                                <Td>
                                                    {u.allowsms}
                                                </Td>

                                                <Td>{this.cellButtonTemplate(u)}</Td>

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

                        <center><h3>Update Bulk SMS API Configurations</h3></center>
                        <div className="card-body text-left">

                            <Row>

                                <Col>
                                <label style={{ color: '#000000' }}><b>Sender</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Sender" value={this.state.sender} onChange={e => this.handleChange(e, "sender")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Consumer Key</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Consumer Key" value={this.state.api_username} onChange={e => this.handleChange(e, "api_username")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Consumer password</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Consumer Secret" value={this.state.api_password} onChange={e => this.handleChange(e, "api_password")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Service url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Service url" value={this.state.service_url} onChange={e => this.handleChange(e, "service_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Access token url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Stk token url" value={this.state.token_url} onChange={e => this.handleChange(e, "token_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Call back url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Call back url" value={this.state.call_back_url} onChange={e => this.handleChange(e, "call_back_url")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Balance url</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Balance url" value={this.state.balance_url} onChange={e => this.handleChange(e, "balance_url")} />
                                    </div>
                                


                                </Col>
                            </Row>
                            <div className="card-body text-center">
                                
                              
                                        <Row key={0}>
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


                    </div>


                </Dialog>

                <Dialog
                    open={this.state.openUpdateTemplate}
                    onClose={this.closeUpdateTemplateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <center><h3>Update Bulk SMS Template</h3></center>
                        <div className="card-body text-left">

                            <Row>

                                <Col>
                                    <label style={{ color: '#000000' }}><b>Description</b></label>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.title} onChange={e => this.handleChange(e, "title")} />
                                    </div>
                                    <label style={{ color: '#000000' }}><b>Template</b></label>
                                    <div className="input-group mb-3">
                                        <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Template" value={this.state.template} onChange={e => this.handleChange(e, "template")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.allowsms}
                                            onChange={this.handlerAllowSmsChange.bind(
                                                this
                                            )}
                                        >

                                            <option value="No">
                                                No
                                            </option>

                                            <option value="Yes">
                                                Yes
                                            </option>
                                        </select>

                                    </div>

                                </Col>
                            </Row>
                            <div className="card-body text-center">
                               
                                        <Row key={0}>
                                            <Col>
                                                <IconButton onClick={() => { this.closeUpdateTemplateDialog() }}>

                                                    <FaTimes size={50} title='Cancel' color='red' />
                                                </IconButton>
                                            </Col>
                                            <Col>
                                                <IconButton onClick={() => { this.updateTemplate() }}>
                                                    <FaSave color='green' size={50} title='Save' />
                                                </IconButton>
                                            </Col>
                                        </Row>
                                   
                            </div>
                        </div>


                    </div>


                </Dialog>

            </Aux>

        );
    }
}

export default SmsConfigs;