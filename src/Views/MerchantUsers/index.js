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
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CSVLink } from "react-csv";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { FaFileExcel, FaTimes, FaUserPlus, FaSave, FaDoorOpen, FaFilePdf } from 'react-icons/fa';
import jsPDF from "jspdf";
import "jspdf-autotable";




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
    { label: "Full Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "mobilenumber" },
    { label: "Role", key: "role" },
    { label: "Created by", key: "created_by" },
    { label: "Last updated by", key: "last_update_by" },

];
class MerchantUsers extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            sysusers: [],
            users_temp: [],
            sysroles: [],
            filtered_sysroles: [],
            merchants: [],
            openView: false,
            openAdd: false,
            hover: false,
            checked_value: false,
            deleterole: false,
            closesession: false,
            openUpdate: false,
            updateopen: false,
            email: '',
            merchant: '',
            phonenumber: '',
            full_names: '',
            updated_fullnames: '',
            updated_phonenumber: '',
            updated_user_id: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            updated_full_name: '',
            updated_staff_id: '',
            updated_phone_number: '',
            updated_merchant: '',
            updated_email: '',
            updated_hover: false,
            open: false,
            role_name: '',
            new_role_name: '',
            role_to_be_deleted: '',
            role_to_be_updated: '',
            dept_list: [],
            dept_id: '',
            user_id: '',
            user_name: '',
            openDelete: false,
            disabled: false,
            show_progress_status: false,
            report: [],
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getSystemusers(0);
        await this.getSystemusersReport();
        await this.getMerchants();
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
    async getSystemusers(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("users/" + pagenum + "/10");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ sysusers: apiResponse, users_temp: apiResponse });
 



        }
    }
    async getSystemusersReport() {
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

            await this.getSystemroles();
            //create report
            let filteredReport = [];
            filteredReport = apiResponse.filter(r => {
                return r.apiuser == false && r.merchant.id == AuthenticationService.getUser().data.user.merchant.id;
            });
            filteredReport.forEach(r => {
                let params = {};
                params["name"] = r.name;
                params["email"] = r.email;
                params["mobilenumber"] = r.mobilenumber;
                params["role"] = r.role.name;
                params["created_by"] = r.createdby;
                params["last_update_by"] = r.dateupdated;
                this.state.report.push(params);

            });


        }
    }
    async getSystemroles() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("roles");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {
            if (apiResponse.length != 0) {
                this.setState({ sysroles: apiResponse });
                let filteredRole = apiResponse.filter(r => {
                    return r.name != "ROLE_SUPER_ADMIN" && r.name != "API_USER";
                });
                this.setState({filtered_sysroles: filteredRole});
            }
        }

    }
    async getMerchants() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("merchants/active");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {
            if (apiResponse.length != 0) {
                this.setState({ merchants: apiResponse });
            }
        }

    }
    async updateUsers() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
       

            if (this.state.updated_full_name == null || this.state.updated_full_name === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter full name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.updated_phone_number == null || this.state.updated_phone_number === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter phone number',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.updated_email == null || this.state.updated_email === '' || !this.validateEmail(this.state.updated_email)) {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter a valid email address',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["id"] = this.state.updated_user_id;
                params["name"] = this.state.updated_full_name;
                params["mobilenumber"] = this.state.updated_phone_number;
                params["email"] = this.state.updated_email;
                params["role_id"] = this.state.updated_role;
                params["merchant_id"] = this.state.updated_merchant;

                let result = await APIService.makePostRequest("user/update", params);
                if (result.success) {
                    notification.addNotification({
                        message: 'System user updated',
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeUpdateDialog();
                    this.setState({
                        updated_full_name: '',
                        updated_phone_number: '',
                        updated_staff_id: '',
                        updated_email: '',
                        updated_role_id: '',
                        merchant_id: '',

                    });
                    this.getSystemusers(0);
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
    async saveUsers() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

      
            if (this.state.full_names == null || this.state.full_names === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter full name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.phonenumber == null || this.state.phonenumber === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter phone number',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.email == null || this.state.email === '' || !this.validateEmail(this.state.email)) {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter a valid email address',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let params = {};
                params["name"] = this.state.full_names;
                params["mobilenumber"] = this.state.phonenumber;
                params["email"] = this.state.email;
                params["roleid"] = this.state.role;
                params["merchantid"] = AuthenticationService.getUser().data.user.merchants.id;
                params["username"] = this.state.email;
                params["apiuser"] = false;

                let result = await APIService.makePostRequest("user/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: 'System user saved',
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeAddDialog();
                    this.setState({
                        full_names: '',
                        phonenumber: '',
                        staff_id: '',
                        email: '',
                        role: '',

                    });
                    this.getSystemusers(0);
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
    async onClickUserActivattion(row, flag) {
        this.setState({
            disabled: true
        });
        this.setState({ show_progress_status: true });
        let params = {};
        const notification = this.notificationSystem.current;
        // let flag = "Active";
    
        params["id"] = row.id;
        params["activate"] = flag == "Active" ? true : false;


        let result = await APIService.makePostRequest("user/activate", params);
        if (result.success) {
            notification.addNotification({
                message: result.message,
                level: 'success',
                autoDismiss: 5
            });

            this.getSystemusers(0);
            this.setState({ show_progress_status: false });
        } else {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: result.message,
                level: 'error',
                autoDismiss: 5
            });
        }
        this.setState({
            disabled: false
        })
    }
    onUserDelete(row) {
        const notification = this.notificationSystem.current;
        if (row.id == AuthenticationService.getUser().data.user.id) {
            notification.addNotification({
                message: 'You are not allowed to delete your own record',
                level: 'error',
                autoDismiss: 5
            });
        } else {
            this.setState({
                user_id: row.id,
                user_name: row.full_name,
                openDelete: true

            });
        }

    }
    closeDeleteDialog() {
        this.setState({ openDelete: false });
    }
    async deleteUser() {
        this.closeDeleteDialog();
        this.setState({
            disabled: true
        });
        this.setState({ show_progress_status: true });
        let params = {};
        const notification = this.notificationSystem.current;


        params["id"] = this.state.user_id;



        let result = await APIService.makePostRequest("users/delete", params);
        if (result.success) {
            notification.addNotification({
                message: 'System user deleted',
                level: 'success',
                autoDismiss: 5
            });
            this.setState({
                user_id: ''
            });
            this.closeDeleteDialog();
            this.getSystemusers(0);
            this.setState({ show_progress_status: false });
        } else {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: result.message,
                level: 'error',
                autoDismiss: 5
            });
        }
        this.setState({
            disabled: false
        })
    }
    async getAllPrivileges() {
        //call API

        await APIService.makeApiGetRequest("privileges")
            .then(data => this.setState({ all_privileges: data }));

    }
    validateEmail(email) {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

        if (!pattern.test(email)) {

            return false;

        }
        return true;
    }
    getDepartment(cell, row) {
        return cell.dept_name;
    }

    getDepartmentName(id) {

        return "ICT";
    }
    getRole(cell, row) {
        return cell.role_name;
    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };
    closeAddDialog() {
        this.setState({
            open: false, full_names: '',
            phonenumber: '',
            staff_id: '',
            email: '',
            role: '',
            hover: false
        });
    };

    closeUpdateDialog() {
        this.setState({
            openUpdate: false,
            updated_hover: false,
        });
    }
    openAddDialog() {
        this.setState({ open: true });
    };
    openSessionDialog() {
        this.setState({ closesession: true });
    };
    cellButton(row) {
        const { classes } = this.props;
        return (
            <IconButton onClick={() =>
                this.onClickUserSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update system user' />
            </IconButton>

        );
    }
    cellApiUser(row) {
        if(row.apiuser){
            return (
                <div>
                    <p>Yes</p>
                </div>
    
            );
        }else{
            return (
                <div>
                    <p>No</p>
                </div>
    
            );
        }
    }
    cellActivateDeativate(row) {
        let disabled = false;
        let disabledMessage = "Not applicable for an API user"
        if(row.apiuser){
            disabled = true
        }
        if (row.active) {
            if(!disabled){
                disabledMessage = "Deactivate system user"
            }
            return (
                <IconButton onClick={() =>
                    this.onClickUserActivattion(row, "Inactive")
                } disabled={disabled}>
                    <CloseIcon style={{ color: "orange" }} titleAccess='Deactivate system user' />
                </IconButton>

            );

        } else {
            if(!disabled){
                disabledMessage = "Activate system user"
            }
            return (
                <IconButton onClick={() =>
                    this.onClickUserActivattion(row, "Active")
                } disabled={disabled}>
                    <DoneIcon style={{ color: "green" }} titleAccess='Activate system user' />
                </IconButton>

            );
        }
    }
    deleteButton(row) {
        const { classes } = this.props;
        return (

            /* <Button
                 size="sm"
                 disabled={this.state.disabled}
                 variant="danger"
                 onClick={() =>
                     this.onUserDelete(row)
                 }
             >
                 Delete
             </Button>*/

            <IconButton onClick={() =>
                this.onUserDelete(row)
            }>

                <DeleteIcon style={{ color: "red" }} titleAccess='Delete system user' />

            </IconButton>



        );
    }
    handlerRoleChanges(e) {

        this.setState({
            role: e.target.value
        });
    }
    handlerRoleUpdateChanges(e) {

        this.setState({
            updated_role: e.target.value
        });
    }

    handlerMerchantUpdateChanges(e){
        this.setState({
            updated_merchant: e.target.value
        });
    }

    handlerDeptChanges(e) {
        this.setState({
            dept_id: e.target.value
        })
    }

    handlerDeptUpdateChanges(e) {
        this.setState({
            updated_dept: e.target.value
        })
    }


    onClickUserSelected(row) {
        this.setState({
            updated_user_id: row.id,
            updated_full_name: row.name,
            updated_email: row.email,
            updated_phone_number: row.mobilenumber,
            updated_role: row.role_id,
            updated_merchant: row.merchant_id,
            openUpdate: true,
            updated_hover: true,
        });
    }

    handleUserSearch(e) {
        let value = e.target.value;
        console.log(this.state.sysusers)
        //lets do a filter
        let searchResult = this.state.sysusers.filter(s => {
            return s.email.includes(value.toLowerCase()) || s.role.name.includes(value.toUpperCase()) || s.name.includes(value);
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
        const tableColumn = ["Full Name", "Email", "Phone Number", "Role", "Created by"];
        // define an empty array of rows
        const tableRows = [];

        // for each ticket pass all its data into an array
        this.state.report.forEach(ticket => {
            const ticketData = [
                ticket.name,
                ticket.email,
                ticket.mobilenumber,
                ticket.role,
                ticket.created_by,
                //ticket.last_update_by,
                // called date-fns to format the date on the ticket
                //format(new Date(ticket.updated_at), "yyyy-MM-dd")
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("System Users", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`System_Users_${dateStr}.pdf`);
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
        await this.getSystemusers(add);
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
            await this.getSystemusers(add);
            this.setState({ show_progress_status: false });
        }
    }
    render() {

        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />


                <Card title='System users' isOption>




                    <br />
                    <br />
                    <IconButton onClick={() =>
                        this.openAddDialog()
                    }>
                        <FaUserPlus style={{ color: "#04a9f5" }} size={50} title='Add user' />
                    </IconButton>
                    <CSVLink data={this.state.report} headers={headers} filename= {AuthenticationService.getUser().data.user.merchants.name+'_SystemUsers.csv'}>

                        <FaFileExcel size={50} color='green' title='Download users' />
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
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Email or Full names or Role" onChange={e => this.handleUserSearch(e)} />
                    </div>
                    <p>Page {this.state.pageCount}</p>
                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Full Name</Th>
                                <Th>Role</Th>
                                <Th>Active</Th>
                                <Th>Update</Th>
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
                                            {u.name}
                                        </Td>
                                        <Td>
                                            {u.roles.name}
                                        </Td>
                                        <Td>{u.active ? 'Yes' : 'No'}</Td>
                                        <Td>{this.cellButton(u)}</Td>
                                        <Td>{this.cellActivateDeativate(u)}</Td>
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
                    open={this.state.open}
                    onClose={this.closeAddDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Create User</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Full name" value={this.state.full_names} onChange={e => this.handleChange(e, "full_names")} />
                                    </div>


                                    <div className="input-group mb-3">
                                        <input type="email" className="form-control" style={{ color: '#000000' }} placeholder="Email" value={this.state.email} onChange={e => this.handleChange(e, "email")} />
                                    </div>


                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Phone number" value={this.state.phonenumber} onChange={e => this.handleChange(e, "phonenumber")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.role}
                                            onChange={this.handlerRoleChanges.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Role
                                            </option>
                                            {this.state.filtered_sysroles.map(
                                                (r, index) => (
                                                    <option
                                                        key={index}
                                                        value={r.id}
                                                    >
                                                        {r.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                </Col>
                            </Row>


                            <Table>
                                <Tbody>
                                    <Tr key={0}>
                                        <Td>
                                            <IconButton onClick={() => { this.closeAddDialog() }}>

                                                <FaTimes size={50} title='Cancel' color='red' />
                                            </IconButton>
                                        </Td>
                                        <Td>
                                            <IconButton onClick={() => { this.saveUsers() }} >
                                                <FaSave color='green' size={50} title='Save' />
                                            </IconButton>
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>

                        </div>


                    </div>




                </Dialog>

                <Dialog
                    open={this.state.openDelete}

                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>{this.state.user_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this user?</h4>





                            <Row key={0}>
                                <Col><IconButton onClick={() => { this.closeDeleteDialog() }}>

                                    <FaTimes size={50} title='Cancel' color='green' />
                                </IconButton></Col>
                                <Col> <IconButton onClick={() => { this.deleteUser() }}>
                                    <FaSave color='red' size={50} title='Save' />
                                </IconButton></Col>
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
                            <h3>Update User</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Full name" value={this.state.updated_full_name} onChange={e => this.handleChange(e, "updated_full_name")} />
                                    </div>


                                    <div className="input-group mb-3">
                                        <input type="email" className="form-control" style={{ color: '#000000' }} placeholder="Email" value={this.state.updated_email} onChange={e => this.handleChange(e, "updated_email")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Phone number" value={this.state.updated_phone_number} onChange={e => this.handleChange(e, "updated_phone_number")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <select
                                            className="form-control"
                                            value={this.state.updated_role}
                                            onChange={this.handlerRoleUpdateChanges.bind(
                                                this
                                            )}
                                        >
                                            <option value="">
                                                Select Role
                                            </option>
                                            {this.state.filtered_sysroles.map(
                                                (r, index) => (
                                                    <option
                                                        key={index}
                                                        value={r.id}
                                                    >
                                                        {r.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>


                                </Col>
                            </Row>

                            <Row key={0}>
                                <Col>
                                    <IconButton onClick={() => { this.closeUpdateDialog() }}>

                                        <FaTimes size={50} title='Cancel' color='red' />
                                    </IconButton>
                                </Col>
                                <Col>
                                    <IconButton onClick={() => { this.updateUsers() }}>
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

export default MerchantUsers;