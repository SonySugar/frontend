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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import CloseIcon from '@material-ui/icons/Close';
import Visibility from '@material-ui/icons/Visibility';
import Edit from '@material-ui/icons/Edit';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import Authenticatonservice from '../../service/Authenticatonservice';

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


const ticket_report_header = [
    { label: "Ticket No", key: "id" },
    { label: "Category", key: "category" },
    { label: "Status", key: "status" },
    { label: "Description", key: "description" },
    { label: "Priority", key: "priority" },
    { label: "Created by", key: "createdby" },
    { label: "Contact", key: "contact" },
    { label: "Date created", key: "datecreated" }
];

class Tickets extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            sysusers: [],
            tickets: [],
            users_temp: [],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            id: '',
            assignedto: '',
            status: '',
            priority: '',
            _notificationSystem: null,
            date_created: '',
            updated_role: '',
            show_progress_status: false,
            query_status_url: '',
            openConfirm: false,
            ticket_report: [],
            date_from: '',
            date_to: '',
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getTickets(0);
        await this.getTicketsReport();
        await this.getSystemusers();
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
    async getTickets(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets/" + pagenum + "/" + 10);
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ tickets: apiResponse });


        }

    }

    async getTicketsReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("tickets");
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
                params["category"] = r.ticket_category.category;
                params["status"] = r.status;
                params["description"] = r.description;
                params["priority"] = r.priority;
                params["createdby"] = r.farmer.firstname;
                params["contact"] = r.farmer.phonenumber_one;
                params["datecreated"] = r.datecreated;
                this.state.ticket_report.push(params);
            });


        }

    }
    async getSystemusers() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("users/report");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {
            this.setState({ sysusers: apiResponse });

        }
    }

    async updateTicket(params) {
        //call API
        this.setState({ show_progress_status: true });
        this.closeUpdateDialog();
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makePostRequest("ticket/update", params);
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {
            notification.addNotification({
                message: apiResponse.message,
                level: 'success',
                autoDismiss: 5
            });
            this.setState({
                id: '',
                assignedto: '',
                status: '',
                priority: ''
            });
            await this.getTickets(0);

        }

        this.setState({ show_progress_status: false });
    }


    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickTicketSelected(row)
            } >
                <Edit style={{ color: "#04a9f5" }} titleAccess='More Details' />
            </IconButton>

        );
    }

    trainingName(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <p>
                {row.training_requests.trainings.module}
            </p>

        );
    }

    assignedTo(row) {
        if (row.system_user == null) {
            return (
                <Td>Not assigned</Td>
            );
        } else {
            return (
                <Td>{row.system_user.username}</Td>
            );
        }
    }

    categoryName(row) {
        return (

            <p>
                {row.customer_tickets.category.category_name}
            </p>

        );
    }

    requestDate(row) {
        const { classes } = this.props;
        let startDate = this.getFormatedStartDate(row.training_requests.start_date);
        return (

            <p>
                {startDate}
            </p>



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

    closeConfirmDialog() {
        this.setState({ openConfirm: false });

    }
    openConfirmDialog() {
        this.setState({ openConfirm: true });
        this.closeUpdateDialog();
    }
    openDeleteDialog(cell, row, enumObject, rowIndex) {
        this.setState({
            openDelete: true,
            delete_dept_id: row.id,
            delete_dept_name: row.dept_name
        });
    }
    onClickTicketSelected(row) {
        this.setState({
            id: row.id,
            assignedto: row.assignedto,
            priority: row.priority,
            status: row.status
        });
        this.openUpdateDialog();
    }


    async closeTicket() {
        this.closeConfirmDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;


        let params = {};
        params["id"] = this.state.id;


        let result = await APIService.makePostRequest("tickets/close", params);
        if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
            });
            this.closeUpdateDialog();
            this.setState({
                id: '',
            });
            this.getTickets();
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
    async handlerPriorityChange(e) {
        this.setState({
            priority: e.target.value
        });
        let params = {};
        params["id"] = this.state.id;
        params["priority"] = e.target.value;
        await this.updateTicket(params);
    }
    async handlerAssignedToChane(e) {
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("assign_ticket")) {
            notification.addNotification({
                message: "You do not have the rights to assign a ticket. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            this.setState({
                assignedto: e.target.value
            });
            let params = {};
            params["id"] = this.state.id;
            params["assignedto"] = e.target.value;
            await this.updateTicket(params);
        }
    }
    async handlerStatusChange(e) {
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_ticket_status")) {
            notification.addNotification({
                message: "You do not have the rights to update ticket status. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            this.setState({
                status: e.target.value
            });
            let params = {};
            params["id"] = this.state.id;
            params["status"] = e.target.value;
            await this.updateTicket(params);
        }
    }


    getFormatedStartDate(val) {

        let date = new Date(val);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }

        if (hour < 10) {
            hour = '0' + hour;
        }
        if (mins < 10) {
            mins = '0' + mins;
        }

        let concatTime = year + '-' + month + '-' + dt + ' ' + hour + ':' + mins;
        return concatTime;
    }
    dateConverter(val) {
        let date = val;
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let dt = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }

        if (hour < 10) {
            hour = '0' + hour;
        }
        if (mins < 10) {
            mins = '0' + mins;
        }

        let concatTime = year + '-' + month + '-' + dt

        return concatTime;
    }

    generateReportPDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");
        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Ticket No", "Category", "Status", "Description", "Priority", "Created by", "Phone", "Date Created"];
        // define an empty array of rows
        const tableRows = [];

        // for each ticket pass all its data into an array
        this.state.ticket_report.forEach(ticket => {
            const ticketData = [
                ticket.id,
                ticket.category,
                ticket.status,
                ticket.description,
                ticket.priority,
                ticket.createdby,
                ticket.contact,
                format(new Date(ticket.datecreated), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });
        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Sony Sugar Ticket Report", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`SonySugar_Ticket${dateStr}.pdf`);
    }


    setDateFrom(e) {


        this.setState({
            date_from: e
        })
    }
    setDateTo(e) {


        this.setState({
            date_to: e
        })
    }

    handleReportSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.training_requests.filter(s => {
            return s.training_requests.trainings.module.includes(value) || s.training_requests.location.county.includes(value) || s.training_requests.app_user.stakeholder.stake_holder_type.includes(value.toUpperCase());
        });
        this.setState({
            training_requests_temp: searchResult
        });
    }

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
        await this.getTickets(add);
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
            await this.getTickets(add);
            this.setState({ show_progress_status: false });
        }
    }

    formatDate(val) {
        return format(new Date(val), "yyyy-MM-dd");
    }
    ticketStatus(row) {
        if (row.status == "Pending")
            return <Td style={{ color: 'red' }}>{row.status}</Td>
        if (row.status == "In progress")
            return <Td style={{ color: 'orange' }}>{row.status}</Td>

        return <Td style={{ color: 'green' }}>{row.status}</Td>

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
                        <Card title='Tickets' isOption>

                            <IconButton onClick={() =>
                                this.generateReportPDF()
                            }>
                                <FaFilePdf title='Download report' size={50} color='red' />
                            </IconButton>


                            <CSVLink data={this.state.ticket_report} headers={ticket_report_header} filename='Tickets.csv'>
                                <FaFileExcel size={50} color='green' title='Download report' />
                            </CSVLink>

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


                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid', fontWeight: 'bold' }}>
                                        <Th>Ticket No</Th>
                                        <Th>Category</Th>
                                        <Th>Description</Th>
                                        <Th>Status</Th>
                                        <Th>Assigned to</Th>
                                        <Th>Created by</Th>
                                        <Th>Contact</Th>
                                        <Th>Date Created</Th>
                                        <Th>Actions</Th>
                                    </Tr>

                                </Thead>
                                {this.state.tickets == null || this.state.tickets.length == 0 ? <Tbody>
                                </Tbody> : <Tbody>
                                    {this.state.tickets.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.id}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.ticket_category.category}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>
                                                    {u.description}
                                                </Td>
                                                <Td style={{ border: '1px solid' }}>{this.ticketStatus(u)}</Td>
                                                <Td style={{ border: '1px solid' }}>{this.assignedTo(u)}</Td>
                                                <Td style={{ border: '1px solid' }}>{u.farmer.firstname}</Td>
                                                <Td style={{ border: '1px solid' }}>{u.farmer.phonenumber_one}</Td>
                                                <Td style={{ border: '1px solid' }}>{this.formatDate(u.datecreated)}</Td>
                                                <Td>
                                                    {this.cellButton(u)}
                                                </Td>



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
                                <p>Page {this.state.pageCustomCount}</p>
                            </div>
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
                    open={this.state.openUpdate}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <center><h3>Ticket Actions #{this.state.id}</h3></center>
                        <div className="card-body text-center">

                            <Table style={{ textAlign: 'left' }}>
                                <Tr key={0}>
                                    <label style={{ color: '#000000' }}><b>Assign ticket</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.assignedto}
                                            onChange={this.handlerAssignedToChane.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select assignee
                                            </option>
                                            {this.state.sysusers.map(
                                                (r, index) => (
                                                    <option
                                                        key={index}
                                                        value={r.id}
                                                    >
                                                        {r.fullname}  - {r.username}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                    </div>
                                </Tr>

                                <Tr key={1}>
                                    <label style={{ color: '#000000' }}><b>Set priority</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.priority}
                                            onChange={this.handlerPriorityChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Priority
                                            </option>
                                            <option value="High">
                                                High
                                            </option>

                                            <option value="Medium">
                                                Medium
                                            </option>
                                            <option value="Low">
                                                Low
                                            </option>
                                        </select>

                                    </div>
                                </Tr>

                                <Tr key={2}>
                                    <label style={{ color: '#000000' }}><b>Change status</b></label>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.status}
                                            onChange={this.handlerStatusChange.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select status
                                            </option>
                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="In progress">
                                                In progress
                                            </option>
                                            <option value="Resolved">
                                                Resolved
                                            </option>
                                        </select>

                                    </div>
                                </Tr>

                            </Table>

                            <Row>
                                <Col>
                                    <div className="card-body text-center">
                                        <IconButton onClick={() =>
                                            this.closeUpdateDialog()
                                        }>
                                            <CloseIcon style={{ color: "red" }} titleAccess='Dimiss' />
                                        </IconButton>
                                    </div>
                                </Col>
                                {/*<Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.openConfirmDialog() }}>Close Ticket</button>
                            </div>
    </Col>*/}
                            </Row>
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
                            <h3>Ticket Id #{this.state.id}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to close this ticket?</h4>



                        </div>
                        <Row>
                            <Col>
                                <div className="card-body text-center">
                                    <button className="btn btn-primary shadow-2 mb-4" onClick={() => { this.closeConfirmDialog() }}>No</button>
                                </div>
                            </Col>
                            {/*<Col>
                            <div className="card-body text-center">
                                <button className="btn btn-success shadow-2 mb-4" onClick={() => { this.closeTicket() }}>Yes</button>
                            </div>
                            </Col>*/}
                        </Row>


                    </div>

                </Dialog>

            </Aux>

        );
    }
}

export default Tickets;