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
import { FaFileExcel, FaSave, FaDoorOpen, Fa } from 'react-icons/fa';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';

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
class BulkContactUpload extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            contacts: [],
            paginated_contacts:[],
            groups: [],
            contacts_temp:[],
            open: false,
            openUpdate: false,
            openDelete: false,
            closesession: false,
            new_first_name: '',
            new_last_name: '',
            new_phone_number: '',
            new_national_id: '',
            new_contact_group: '',
            updated_first_name: '',
            updated_last_name: '',
            updated_phone_number: '',
            updated_national_id: '',
            update_contact_id: '',
            update_contact_group:'',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            contact_id: '',
            selectedflag: '',
            contact_name: '',
            contact_to_be_deleted: '',
            hidedialog: false,
            bulk_contact_group: '',
            show_progress_status: false,
            openBulk: false,
            pageNum: 0,
            pageCount: 1,
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getAllContacts();
        await this.getContacts(0);
        await this.getContactGroups();
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
    async getContactGroups() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("contactgroups");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ groups: apiResponse });


        }

    }

    async getContacts(pagenum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("contacts/" + pagenum + "/10");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ paginated_contacts: apiResponse, contacts_temp: apiResponse });




        }
    }

    async getAllContacts() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("contacts");

        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });

        } else {

            this.setState({ contacts: apiResponse });




        }
    }

    cellButton(row) {
        const { classes } = this.props;
        return (

            <IconButton onClick={() =>
                this.onClickContactSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update group' />
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
    openBulkDialog() {
        this.setState({ openBulk: true });
    }
    closeBulkDialog() {
        this.setState({ openBulk: false });
    }

    closeDeleteDialog() {
        this.setState({ openDelete: false });
    }

    onClickContactSelected(row) {
        this.setState({
            update_contact_id: row.id,
            updated_first_name: row.firstname,
            updated_last_name: row.lastname,
            updated_phone_number: row.phonenumber,
            updated_national_id: row.nationalid,
            update_contact_group: row.contact_group.id

        });
        this.openUpdateDialog();
    }

    async saveContact() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;
        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("create_contact")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to create a contact. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.new_first_name == null || this.state.new_first_name === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter first name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else  if (this.state.new_phone_number == null || this.state.new_phone_number === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter a valid phone number (254.....)',
                    level: 'warning',
                    autoDismiss: 5
                });
            }else {

                let params = {};
                params["firstname"] = this.state.new_first_name;
                params["lastname"] = this.state.new_last_name;
                params["phonenumber"] = this.state.new_phone_number;
                params["nationalid"] = this.state.new_national_id;
                params["group"] = this.state.new_contact_group;
                params["id"] = "";

                let result = await APIService.makePostRequest("contact/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeAddDialog();
                    this.setState({
                        new_first_name: '',
                        new_last_name: '',
                        new_phone_number: '',
                        new_national_id: '',
                        new_contact_group: ''
                    });
                    this.getContacts(0);
                    this.getAllContacts();
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
    async updateContact() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
        if (!privilegeList.includes("update_contact")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to update a contact. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            if (this.state.updated_first_name == null || this.state.updated_first_name === '') {
                this.setState({ loggingIn: false });

                notification.addNotification({
                    message: 'Please enter first name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else if (this.state.updated_phone_number == null || this.state.updated_phone_number === '') {
                this.setState({ loggingIn: false });

                notification.addNotification({
                    message: 'Please enter phone number',
                    level: 'warning',
                    autoDismiss: 5
                });
            }else {

                let params = {};
                params["id"] = this.state.update_contact_id;
                params["group"] = this.state.update_contact_group;
                params["firstname"] = this.state.updated_first_name;
                params["lastname"] = this.state.updated_last_name;
                params["phonenumber"] = this.state.updated_phone_number;
                params["nationalid"] = this.state.updated_national_id;


                let result = await APIService.makePostRequest("contact/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: result.message,
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeUpdateDialog();
                    this.setState({
                        updated_group_name: '',
                        update_group_id: '',
                        pageNum: 0,
                        pageCount: 1
                    });
                    this.getContacts(0);
                    this.getAllContacts();
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
    deleteButton(row) {
        const { classes } = this.props;
        return (


            <IconButton onClick={() =>
                this.confirmDeleteContact(row)
            }>

                <DeleteIcon style={{ color: "red" }} titleAccess='Delete contact' />

            </IconButton>
        );
    }
    confirmDeleteContact(row) {
        this.openDeleteContact(row);
    }
    openDeleteContact(row) {
        this.setState({
            openDelete: true,
            contact_name: row.firstname + " " + row.lastname,
            contact_to_be_deleted: row.id
        })
    }
    async deleteContact() {
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
        console.log(privilegeList)

        if (!privilegeList.includes("delete_contact")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to delete a contact. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.contact_to_be_deleted


            let result = await APIService.makePostRequest("contact/delete", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDeleteDialog();
                this.setState({
                    contact_to_be_deleted: '',
                    pageNum: 0,
                    pageCount: 1
                });
                this.getAllContacts();
                this.getContacts(0);
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
    uploadFile = async e => {
        const notification = this.notificationSystem.current;
        this.closeBulkDialog();
          //check permissions
          let privilegeList = [];
          let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
          for(let k in privileges){
             
              privilegeList.push(privileges[k].mprivileges.privilege_name);
          }
  
          if(!privilegeList.includes("create_contact")){
              this.setState({ show_progress_status: false });
              notification.addNotification({
                message: "You do not have the rights to create a contact group. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
              });  
          }else{
  
        this.setState({
            show_progress_status: true,
            open: false
        });
        const files = e.target.files;
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("group", this.state.bulk_contact_group);
    
        // clear the value
        e.target.value = null;
    
        let response = await APIService.uploadFile("/contact/upload", formData);
        console.log(response);
        if (response) {
        
          if (response.data && response.data.success) {
            notification.addNotification({
              message: response.data.message,
              level: 'success',
              autoDismiss: 5
            });
             this.setState({
               bulk_contact_group:'',
               show_actions:false,
             })
            // get uploaded clients
            this.getAllContacts();
            this.getContacts(0);
          } else {
            notification.addNotification({
              message: response.response.data.message,
              level: 'error',
              autoDismiss: 5
            });
          }
          this.setState({
            show_progress_status: false
          });
        } else {
          notification.addNotification({
            message: 'Something went wrong',
            level: 'error',
            autoDismiss: 5
          });
          this.setState({
            show_progress_status: false
          });
        }
    }
    
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
        await this.getContacts(add);
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
            await this.getContacts(add);
            this.setState({ show_progress_status: false });
        }
    }

    handleSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.paginated_contacts.filter(s => {
            return s.firstname.includes(value) || s.lastname.includes(value) || s.phonenumber.includes(value) || s.nationalid.includes(value) || s.contact_group.name.includes(value);
        });
        this.setState({
            contacts_temp: searchResult
        });

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
                        <Card title='Manage Contacts' isOption>
                        <div
                style={{
                  textAlign: "left",
                  display: "grid"
                }}
              >

               
                  <a href="/FileUploadTemplates/Contacts.xlsx" download>
                  <FaFileExcel size={50} color='green' title='Download template'/>
                  </a>
                
              </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                    this.openAddDialog()
                                }
                            >
                                Create Contact
                            </Button>
                            <IconButton onClick={() =>
                        this.RemovePage()
                    } >
                                                    <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                    this.openBulkDialog()
                                }
                            >
                                Bulk upload
                            </Button>
                            <IconButton onClick={() =>
                        this.RemovePage()
                    } ></IconButton>
                        <ArrowBack style={{ color: "green" }} titleAccess='Previous' />
                    </IconButton>

                    <IconButton onClick={() =>
                        this.AddPage()
                    } >
                        <ArrowForward style={{ color: "green" }} titleAccess='Next' />
                    </IconButton>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Firstname Id or Lastname or Phone number or Narional Id or Contact group" onChange={e => this.handleSearch(e)} />
                    </div>
                    <p>Page {this.state.pageCount}</p>
                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>First name</Th>
                                        <Th>Last name</Th>
                                        <Th>Phone number</Th>
                                        <Th>National ID</Th>
                                        <Th>Contact group</Th>
                                        <Th>Update</Th>
                                        <Th>Delete</Th>

                                    </Tr>

                                </Thead>
                                {this.state.contacts_temp == null || this.state.contacts_temp.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        {this.state.type == null || this.state.type == "" ?
                                            <Td style={{ color: 'red' }}>No data available....</Td> : <Td style={{ color: 'blue' }}>Loading ....</Td>}
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.contacts_temp.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.firstname}
                                                </Td>
                                                <Td>
                                                    {u.lastname}
                                                </Td>
                                                <Td>
                                                    {u.phonenumber}
                                                </Td>
                                                <Td>
                                                    {u.nationalid}
                                                </Td>
                                                <Td>
                                                    {u.contact_group.name}
                                                </Td>
                                                <Td>
                                                    {this.cellButton(u)}
                                                </Td>
                                                <Td>{this.deleteButton(u)}</Td>

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
                            <h3>Create Contact</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="first name" value={this.state.new_first_name} onChange={e => this.handleChange(e, "new_first_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="last name" value={this.state.new_last_name} onChange={e => this.handleChange(e, "new_last_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="phone number. Should start with 254" value={this.state.new_phone_number} onChange={e => this.handleChange(e, "new_phone_number")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="National ID" value={this.state.new_national_id} onChange={e => this.handleChange(e, "new_national_id")} />
                                    </div>
                                    <div className="input-group mb-3">
                                        <select className="form-control" style={{ color: '#000000' }} value={this.state.new_contact_group} onChange={e => this.handleChange(e, "new_contact_group")}>
                                            <option value="">Select contact group</option>
                                            {this.state.groups.map((group) => (
                                                <option value={group.id} key={group.id}>{group.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.closeAddDialog()
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
                                                        this.saveContact()
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
                            <h3>Update Contact</h3>
                            <Row>

                                <Col>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="First name" value={this.state.updated_first_name} onChange={e => this.handleChange(e, "updated_first_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Last name" value={this.state.updated_last_name} onChange={e => this.handleChange(e, "updated_last_name")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Phone number. Start with 254..." value={this.state.updated_phone_number} onChange={e => this.handleChange(e, "updated_phone_number")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="National ID" value={this.state.updated_national_id} onChange={e => this.handleChange(e, "updated_national_id")} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <select className="form-control" style={{ color: '#000000' }} value={this.state.update_contact_group} onChange={e => this.handleChange(e, "update_contact_group")}>
                                            <option value="">Select contact group</option>
                                            {this.state.groups.map((group) => (
                                                <option value={group.id} key={group.id}>{group.name}</option>
                                            ))}
                                        </select>
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
                                                        this.updateContact()
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
                    open={this.state.openDelete}

                    fullWidth

                >

                    <div className="card">
                        <center>
                        </center>
                        <div className="card-body text-center">
                            <h3>{this.state.contact_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this contact?</h4>


                            <Row key={0}>
                                <Col>                    <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                        this.closeDeleteDialog()
                                    }
                                >
                                    Dismiss
                                </Button></Col>
                                <Col>                     <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() =>
                                        this.deleteContact()
                                    }
                                >
                                    Delete contact
                                </Button></Col>
                            </Row>


                        </div>



                    </div>

                </Dialog>
                <Dialog
                    open={this.state.openBulk}
                    onClose={this.closeBulkDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>Bulk upload</h3>
                            <Row>

                                <Col>
                                    <div className="input-group mb-3">
                                        <select className="form-control" style={{ color: '#000000' }} value={this.state.bulk_contact_group} onChange={e => this.handleChange(e, "bulk_contact_group")}>
                                            <option value="">Select contact group</option>
                                            {this.state.groups.map((group) => (
                                                <option value={group.id} key={group.id}>{group.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        this.closeBulkDialog()
                                                    }
                                                >
                                                    Dismiss
                                                </Button>
                                </Col>
                                <Col>
                                <input
                      type="file"
                      id="myfile"
                      className="hidden"
                      style={{
                        display: "none",
                        cursor: "pointer"
                      }}
                      onChange={e => this.uploadFile(e)}
                    />
                    <label
                      htmlFor="myfile"
                      style={{
                        position: "relative",
                        top: "3px",
                        width: "193px",
                        height: "34px",
                        fontSize: "15px",
                        textAlign: "center",
                        backgroundColor: "rgb(0, 153, 51)",
                        color: "white",
                        borderRadius: ".25em",
                        cursor: "pointer",
                        padding: "6px 12px"
                      }}
                    >

                      Upload File
                    </label>
                                </Col>
                            </Row>
                        </div>


                    </div>


                </Dialog>

            </Aux>

        );
    }
}

export default BulkContactUpload;