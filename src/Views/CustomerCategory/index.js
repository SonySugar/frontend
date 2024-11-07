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
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { FaTimes, FaSave, FaDoorOpen, Fa } from 'react-icons/fa';

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
class CustomerCategory extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            custcategory: [],
            open: false,
            openUpdate: false,
            closesession: false,
            new_category_name: '',
            updated_category_name: '',
            update_category_id: '',
            description: '',
            update_description: '',
            _notificationSystem: null,
            hidedialog: false,
            show_progress_status: false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getCustomerCategories();
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
    async getCustomerCategories() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("customer_category");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ custcategory: apiResponse });


        }

    }

    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickCategorySelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update category' />
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

    onClickCategorySelected(row) {
        this.setState({
            updated_category_name: row.category,
            update_description: row.description,
            update_category_id: row.id,

        });
        this.openUpdateDialog();
    }

    async saveCustomerCategory() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("create_customer_category")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to create a customer category. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.new_category_name == null || this.state.new_category_name === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter category name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["category"] = this.state.new_category_name
                params["description"] = this.state.description

                let result = await APIService.makePostRequest("customer_category/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeAddDialog();
                    this.setState({
                        new_category_name: '',
                        description: ''
                    });
                    this.getCustomerCategories();
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
    }
    async updateCustomerCategory() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
        if (!privilegeList.includes("update_customer_category")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to update contact group. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.updated_category_name == null || this.state.updated_category_name === '') {
                this.setState({ loggingIn: false });

                notification.addNotification({
                    message: 'Please enter group name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["category"] = this.state.updated_category_name;
                params["description"] = this.state.update_description;
                params["id"] = this.state.update_category_id;

                let result = await APIService.makePostRequest("customer_category/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeUpdateDialog();
                    this.setState({
                        updated_category_name: '',
                        update_category_id: '',
                        update_description: ''
                    });
                    this.getCustomerCategories();
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
    }

    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                        <Card title='Customer category' isOption>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    this.openAddDialog()
                                }
                            >
                                Create Customer Category
                            </Button>

                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Name</Th>
                                        <Th>Description</Th>
                                        <Th>Update</Th>

                                    </Tr>

                                </Thead>
                                {this.state.custcategory == null || this.state.custcategory.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        {this.state.type == null || this.state.type == "" ?
                                            <Td style={{ color: 'red' }}>No data available....</Td> : <Td style={{ color: 'blue' }}>Loading ....</Td>}
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.custcategory.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.category}
                                                </Td>
                                                <Td>
                                                    {u.description}
                                                </Td>
                                                <Td>
                                                    {this.cellButton(u)}
                                                </Td>

                                            </Tr>
                                        )
                                    )}
                                </Tbody>}
                            </Table>


                        </Card>


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
                    onClose={this.closeAddDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Create Customer Category</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Category name" value={this.state.new_category_name} onChange={e => this.handleChange(e, "new_category_name")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.description} onChange={e => this.handleChange(e, "description")} />
                                    </div>

                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="card-body text-center">

                                        <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.closeAddDialog()
                                                    }
                                                >
                                                    Dismiss
                                                </Button>
                                    </div>
                                </Col>
                                <Col>
                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() =>
                                                        this.saveCustomerCategory()
                                                    }
                                                >
                                                    Save
                                                </Button>
                                </Col>
                            </Row>
                        </div>


                    </div>


                </Dialog>

                <Dialog
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Update Contact Group</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Category name" value={this.state.updated_category_name} onChange={e => this.handleChange(e, "updated_category_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Description" value={this.state.update_description} onChange={e => this.handleChange(e, "update_description")} />
                                    </div>


                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                        <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.closeUpdateDialog()
                                                    }
                                                >
                                                    Dismiss
                                                </Button>
                                </Col>
                                <Col>
                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() =>
                                                        this.updateCustomerCategory()
                                                    }
                                                >
                                                    Save
                                                </Button>
                                </Col>
                            </Row>
                        </div>


                    </div>


                </Dialog>
            </Aux>

        );
    }
}

export default CustomerCategory;