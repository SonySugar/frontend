import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
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
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { FaTimes, FaSave, FaDoorOpen, Fa } from 'react-icons/fa';
import { FarmersCheckBox } from '../../App/components/Checkbox/farmerscheckbox';

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
class SendSms extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            contact_list: [],
            template_list: [],
            appusers: [],
            closesession: false,
            open_farmers_list: false,
            choose_from_template: false,
            show_message_box: false,
            close_farmers_list: false,
            show_btn: false,
            message: "",
            selected_template: "",
            _notificationSystem: null,
            show_progress_status: false,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getTemplates();
        await this.getUsers();
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }
    }
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getTemplates() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("sms_templates");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ template_list: apiResponse });


        }

    }
    async getUsers() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("farmers/report");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            apiResponse.forEach(r => {
                let params = {};
                params["id"] = r.id;
                params["firstname"] = r.firstname;
                params["lastname"] = r.lastname;
                params["email"] = r.email;
                params["phonenumber_one"] = r.phonenumber_one;
                params["nationalid"] = r.nationalid;
                params["active"] = r.active;
                params["dateupdated"] = r.dateupdated;
                this.state.appusers.push(params);

            });



        }

    }
    async SendSms() {
        //call API
        this.setState({ show_progress_status: true, open_farmers_list: false });
        const notification = this.notificationSystem.current;
        let phoneNumbers = [];
        this.state.appusers.forEach(u => {
            if (u.checked)
                phoneNumbers.push(u.phonenumber_one)
        });
        let params = {}
        let endpoint = "farmer/withtemplate/sendsms";
        if (this.state.choose_from_template) {
            params["templateid"] = this.state.selected_template;

        } else {
            params["message"] = this.state.message;
            endpoint = "farmer/notemplate/sendsms";
        }
        params["recipients"] = phoneNumbers;

        let apiResponse = await APIService.makePostRequest(endpoint, params);
        if (apiResponse.success) {
            notification.addNotification({
                message: apiResponse.message,
                level: 'success',
                autoDismiss: 5
            });
            this.setState({ show_progress_status: false });
        } else {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        }
        this.setState({ appusers: [] });
        this.getUsers();

    }
    handlerTypeChange(e) {
        if (e.target.value == 'template') {
            this.setState({ choose_from_template: true, show_message_box: false, show_btn: true });
        }
        else {
            this.setState({ choose_from_template: false, show_message_box: true, show_btn: true });
        }
    }
    handleSelectionChange() {
        this.setState({ open_farmers_list: true });
    }
    handleCheckChildElement = event => {
        let farmers = this.state.appusers;
        farmers.forEach(f => {
            if (f.id == event.target.value)
                f.checked = event.target.checked;
        });
        this.setState({ appusers: farmers });
    };
    closeFarmersList() {
        this.setState({ open_farmers_list: false });
        //this.removeItemAll();
    };
    handleAllChecked = event => {
        let farmers = this.state.appusers;
        farmers.forEach(f => (f.checked = event.target.checked));
        this.setState({ appusers: farmers });
    };
    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />

                <Card title='Send SMS' isOption>
                    <Row>
                        <label style={{ color: '#000000' }}><b>Message Type</b></label>
                        <div className="input-group mb-3">
                            <select
                                className="form-control"
                                value={this.state.smtpauth}
                                onChange={this.handlerTypeChange.bind(
                                    this
                                )}
                            >
                                <option value="">
                                    Select message type
                                </option>
                                <option value="template">
                                    Choose from SMS templates
                                </option>

                                <option value="composed">
                                    Compose message
                                </option>
                            </select>

                        </div>
                    </Row>
                    <Row>
                        {/**Show message box */}
                        <Col>
                            {this.state.show_message_box && (
                                <div>
                                    <label style={{ color: '#000000' }}><b>Message</b></label>
                                    <textarea
                                        className="form-control"
                                        value={this.state.message}
                                        style={{ height: '200px', width: '600px' }}
                                        onChange={(e) => { this.setState({ message: e.target.value }) }}
                                    ></textarea>
                                </div>
                            )}
                            {/**Show template box */}
                            {this.state.choose_from_template && (
                                <div>
                                    <label style={{ color: '#000000' }}><b>Choose Template</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.selected_template}
                                            onChange={(e) => { this.setState({ selected_template: e.target.value }) }}
                                        >
                                            <option value="">
                                                Select template
                                            </option>
                                            {this.state.template_list.map((template, index) => (
                                                <option value={template.id} key={index}>
                                                    {template.title} | {template.template}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                </div>
                            )}
                            <br />
                            {this.state.show_btn && (<Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    this.handleSelectionChange()
                                }
                            >
                                Select recipients
                            </Button>)}
                        </Col>
                    </Row>
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
                    open={this.state.open_farmers_list}
                    onClose={this.closeFarmersList.bind(this)}
                    fullWidth
                >
                    <div className="card">
                        <div className="card-body text-left">

                            <Row>
                                <Table style={{ textAlign: "left" }}>
                                    <Tbody>
                                        <Tr key={0}>
                                            <Td>
                                                Check / Uncheck All
                                            </Td>
                                            <Td>
                                                <input
                                                    type="checkbox"
                                                    onClick={this.handleAllChecked}
                                                    value="checkedall"
                                                />{" "}

                                            </Td>
                                        </Tr>

                                        {this.state.appusers.map(
                                            (farmer) => {

                                                return (
                                                    <FarmersCheckBox handleCheckChildElement={this.handleCheckChildElement}
                                                        {...farmer}
                                                    />
                                                );
                                            })


                                        }
                                        <Tr>
                                            <Td></Td>
                                            <Td></Td>
                                            <Td></Td>

                                            <Td>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() =>
                                                        this.SendSms()
                                                    }
                                                >
                                                    Send
                                                </Button>
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Row>
                        </div>
                    </div>

                </Dialog>
            </Aux>
        );
    }
}
export default SendSms;