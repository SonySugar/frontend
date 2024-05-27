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
import { CSVLink } from "react-csv";
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaTimes, FaSave, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

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

const headers = [
    { label: "First Name", key: "firstname" },
    { label: "Last Name", key: "lastname" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phonenumber_one" },
    { label: "National Id", key: "nationalid" },
    { label: "Status", key: "active" },
    { label: "Date Updated", key: "dateupdated" }
];



class AppUsers extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            appusers: [],
            users_temp: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id: '',
            firtname: '',
            surname: '',
            lastname: '',
            email: '',
            phone_number: '',
            nationalid: '',
            sms_status: '',
            _notificationSystem: null,
            date_created: '',
            updated_role: '',
            show_progress_status: false,
            status: '',
            openConfirm: false,
            activation_message: '',
            action: '',
            openUpdateDetails: false,
            report: [],
            pageNum: 0,
            pageCount: 1,
            totalcount: 0
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getUsers(0);
        await this.getUsersReport();
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
    async getUsersReport() {
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


            // this.setState({ appusers: apiResponse, users_temp: apiResponse });


            //create report data
            //let reportList =[];

            apiResponse.forEach(r => {
                let params = {};
                params["firstname"] = r.firstname;
                params["lastname"] = r.lastname;
                params["email"] = r.email;
                params["phonenumber_one"] = r.phonenumber_one;
                params["nationalid"] = r.nationalid;
                params["active"] = r.active;
                params["dateupdated"] = r.dateupdated;
                this.state.report.push(params);

            });



        }
        this.setState({ show_progress_status: false })

    }

    async getUsers(pagnum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("farmers/" + pagnum + "/10");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {


            this.setState({ appusers: apiResponse, users_temp: apiResponse });

        }
        this.setState({ show_progress_status: false })

    }


    pinButton(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <Button
                size="sm"
                variant="primary"
                onClick={() =>
                    this.onClickUserPinSelected(cell, row, enumObject, rowIndex)
                }
            >
                Resend
            </Button>

        );
    }

    updateButton(row) {
        const { classes } = this.props;
        return (



            <IconButton onClick={() =>
                this.onClickUpdateUserSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update farmer' />
            </IconButton>

        );
    }



    activateButton(row) {
        const { classes } = this.props;
        if (!row.active) {

            return (


                <IconButton onClick={() =>
                    this.onClickUserSelected(row)
                }>
                    <DoneIcon style={{ color: "green" }} titleAccess='Activate system user' />
                </IconButton>




            );
        } else {
            return (


                <IconButton onClick={() =>
                    this.onClickUserSelected(row)
                }>
                    <CloseIcon style={{ color: "red" }} titleAccess='Deactivate app user' />
                </IconButton>

            );
        }
    }

    closeConfirmActivationDialog() {
        this.setState({ openConfirm: false });
    }
    openConfirmActivationDialog() {
        this.setState({ openConfirm: true });
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
    closeDetails() {
        this.setState({ openUpdateDetails: false });
    }
    updateDetailsDialog() {
        this.setState({
            openUpdateDetails: true
        });
    }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    onClickUserSelected(row) {
        let actionFlag = false;
        let message = 'Are you sure you want to deactivate ' + row.firstname + ' ' + row.lastname;
        if (!row.active) {

            message = 'Are you sure you want to activate ' + row.firstname + ' ' + row.lastname;
            actionFlag = true;
        }

        this.setState({
            id: row.id,
            firstname: row.firstname,
            lastname: row.lastname,
            surname: row.surname,
            phone_number: row.phonenumber_one,
            email: row.email,
            datecreated: row.datecreated,
            status: row.active,
            nationalid: row.nationalid,
            action: actionFlag,
            activation_message: message

        });
        this.openConfirmActivationDialog();
    }
    onClickUserPinSelected(cell, row, enumObject, rowIndex) {
        //resending pin
    }

    onClickUpdateUserSelected(row) {
        this.setState({
            id: row.id,
            firstname: row.firstname,
            lastname: row.lastname,
            surname: row.surname,
            phone_number: row.phonenumber_one,
            email: row.email,
            datecreated: row.datecreated,
            status: row.active,
            nationalid: row.nationalid,
            openUpdateDetails: true

        });
    }

    async updateDetails() {
        this.closeDetails();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_app_user")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make any updates to a mobile app user. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.id;
            params["kra_pin"] = this.state.pin;
            params["company_pin"] = this.state.company_pin;



            let result = await APIService.makePostRequest("mobile_app/update_details", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDetails();
                this.setState({
                    id: '',
                    pin: '',
                    company_pin: '',


                });
                this.getUsers(0);
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

    async activateDeactivateUser() {
        this.closeConfirmActivationDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        // let privilegeList = [];
        // let privileges = Authenticatonservice.getUser().data.user.roles.privileges;
        // for (let k in privileges) {

        //     privilegeList.push(privileges[k].mprivileges.privilege_name);
        // }

        // if (!privilegeList.includes("activate_app_user")) {
        //     this.setState({ show_progress_status: false });
        //     notification.addNotification({
        //         message: "You do not have the rights to make activate or deactivate app user. Please contact your Systems Administrator",
        //         level: 'error',
        //         autoDismiss: 5
        //     });
        // } else {
            let params = {};
            params["id"] = this.state.id;
            params["activate"] = this.state.action;

            let result = await APIService.makePostRequest("farmer/activate", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeConfirmActivationDialog();
                this.setState({
                    id: '',
                    action: '',

                });
                this.getUsers(0);
                this.setState({ show_progress_status: false });
            } else {
                this.setState({ show_progress_status: false });
                notification.addNotification({
                    message: result.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }
            this.setState({ show_progress_status: false });
        //}
    }
    handlerTypeChange(e) {
        this.setState({
            trx_type: e.target.value
        });
    }
    handleUserSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.appusers.filter(s => {
            return s.email.includes(value.toLowerCase()) || s.phone_number.includes(value) || s.full_name.includes(value);
        });
        this.setState({
            users_temp: searchResult
        });

    }
    // define a generatePDF function that accepts a tickets argument
    generatePDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["First Name", "Last Name", "Email", "Phone Number", "National Id", "Status", "Date Updated"];
        // define an empty array of rows
        const tableRows = [];
        this.state.report.forEach(ticket => {
            const ticketData = [
                ticket.firstname,
                ticket.lastname,
                ticket.email,
                ticket.phonenumber_one,
                ticket.nationalid,
                ticket.active,
                //ticket.created_by,
                //ticket.last_update_by,
                // called date-fns to format the date on the ticket
                format(new Date(ticket.dateupdated), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Sonysugar Registerd Mobile App Users", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Mobile_App_Users_${dateStr}.pdf`);
    };
    async AddPage() {
        this.setState({ show_progress_status: true });
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        add++;
        count++;
        this.setState({
            pageNum: add,
            pageCount: count
        });
        await this.getUsers(add);
        this.setState({ show_progress_status: false });
    }
    async RemovePage() {
        var add = this.state.pageNum;
        var count = this.state.pageCount;
        if (this.state.pageNum > 0) {
            this.setState({ show_progress_status: true });
            add--;
            count--;
            this.setState({
                pageNum: add,
                pageCount: count
            });
            await this.getUsers(add);
            this.setState({ show_progress_status: false });
        }
    }
    farmerStatus(status) {
        if (status) {
            return (
                <p style={{ color: 'green' }}>Active</p>
            );
        } else {
            return (
                <p style={{ color: 'red' }}>Inactive</p>
            );
        }
    }
    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />

                <Card title='Registered Farmers' isOption>




                    <br />
                    <CSVLink data={this.state.report} headers={headers} filename='Mobile_App_Users.csv'>
                        <FaFileExcel size={50} color='green' title='Download app users' />
                    </CSVLink>

                    <IconButton onClick={() =>
                        this.generatePDF()
                    }>
                        <FaFilePdf title='Download system users' size={50} color='red' />
                    </IconButton>

                    <IconButton onClick={() =>
                        this.RemovePage()
                    } >
                        <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                    </IconButton>

                    <IconButton onClick={() =>
                        this.AddPage()
                    } >
                        <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                    </IconButton>

                    <div className="input-group mb-3">
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Email or First name or Last name or Phone Number" onChange={e => this.handleUserSearch(e)} />
                    </div>
                    <br />
                    <p>Page {this.state.pageCount}</p>
                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Full Name</Th>
                                <Th>Phone Number</Th>
                                <Th>Email</Th>
                                <Th>Status</Th>
                                <Th>Update Details</Th>
                                <Th>Activate/Deactivate</Th>


                            </Tr>

                        </Thead>
                        {this.state.users_temp == null || this.state.users_temp.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.users_temp.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.firstname + " " + u.lastname}
                                        </Td>
                                        <Td>
                                            {u.phonenumber_one}
                                        </Td>
                                        <Td>
                                            {u.email}
                                        </Td>
                                        <Td>
                                            {this.farmerStatus(u.active)}
                                        </Td>
                                        <Td>{this.updateButton(u)}</Td>
                                        <Td>{this.activateButton(u)}</Td>

                                    </Tr>
                                )
                            )}
                        </Tbody>}
                    </Table>
                    <div className="card-body text-center">
                        <IconButton onClick={() =>
                            this.RemovePage()
                        } >
                            <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                        </IconButton>

                        <IconButton onClick={() =>
                            this.AddPage()
                        } >
                            <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                        </IconButton>
                        <p>Page {this.state.pageCount}</p>
                    </div>

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
                    open={this.state.openConfirm}

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

                            <h4>{this.state.activation_message}</h4>



                        </div>
                        <Row>
                            <Col>
                                <div className="card-body text-center">
                                    <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeConfirmActivationDialog() }}>No</button>
                                </div>
                            </Col>
                            <Col>
                                <div className="card-body text-center">
                                    <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.activateDeactivateUser() }}>Yes</button>
                                </div>
                            </Col>
                        </Row>


                    </div>

                </Dialog>

                <Dialog
                    open={this.state.openUpdateDetails}
                    onClose={this.closeDetails.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <center><h3>Update Farmer Details</h3></center>
                        <div className="card-body text-left">


                            {/*<label style={{ color: '#000000' }}><b>Customer number</b></label>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter customer number" value={this.state.customer_number} onChange={e => this.handleChange(e, "customer_number")} />
                    </div>*/}
                            <label style={{ color: '#000000' }}><b>First Name</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter Firstname" value={this.state.firstname} onChange={e => this.handleChange(e, "firstname")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Surname</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter Surname" value={this.state.surname} onChange={e => this.handleChange(e, "surname")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Phone Number</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter Phone Number" value={this.state.phone_number} onChange={e => this.handleChange(e, "phone_number")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Email</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter Email" value={this.state.email} onChange={e => this.handleChange(e, "email")} />
                            </div>
                        </div>
                        <div className="card-body text-center">


                            {/* <Row key={0}>
                                <Col>
                                    <IconButton onClick={() => { this.closeDetails() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.updateDetails() }}>
                                        <FaSave color='green' size={50} title='Save' />
                                    </IconButton>
                                </Col>
                            </Row> */}

                        </div>








                    </div>


                </Dialog>

            </Aux>

        );
    }
}

export default AppUsers;