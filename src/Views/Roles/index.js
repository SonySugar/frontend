import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";
import { Dialog,IconButton } from '@material-ui/core';
import Lottie from 'react-lottie-player'
import lottieJson from '../../App/layout/Login/lottie.json';
import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";
import Authenticatonservice from '../../service/Authenticatonservice';
import { PrivilegeCheckBox } from '../../App/components/Checkbox/privilegecheckbox';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Visibility from '@material-ui/icons/Visibility';

import { FaTimes, FaSave, FaDoorOpen,FaPlusCircle } from 'react-icons/fa';
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
const headers2 = [
    { label: "Full Name", key: "full_name" },
    { label: "Email", key: "email" },

];
class Roles extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            sysroles: [],
            sysroles_temp: [],
            role_privileges: [],
            all_privileges: [],
            selected_privileges: [],
            compare_role_privileges: [],
            final_privileges_list: [],
            openView: false,
            openAdd: false,
            checked_value: false,
            deleterole: false,
            closesession: false,
            openUpdate: false,
            updateopen: false,
            username: '',
            phonenumber: '',
            fullnames: '',
            updated_fullnames: '',
            updated_phonenumber: '',
            updated_user_id: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
            open: false,
            role_name: '',
            new_role_name: '',
            role_to_be_deleted: '',
            role_to_be_updated: '',
            show_progress_status: false,
            checkall: false,
            checkedItems: new Map(),
            all_privileges_temp: [],
            headers:[],
            report:[],
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getSystemroles();
        this.setState({ show_progress_status: false });


    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
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

            this.setState({ sysroles: apiResponse, sysroles_temp: apiResponse });
            await this.getAllPrivileges();
            
        }

    }
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getAllPrivileges() {
        //call API

        await APIService.makeApiGetRequest("privileges")
            .then(data => this.setState({ all_privileges: data, all_privileges_temp: data }));

    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };
    getDepartment(cell, row) {
        return cell.dept_name;
    }
    getRole(cell, row) {
        return cell.role_name;
    }
    cellButton(row) {
        return (


<IconButton onClick={() =>
    this.onClickUserSelected(row)
} >
    <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update system role' />
</IconButton>

        );
    }
    deleteButton(row) {
        const { classes } = this.props;
        return (


<IconButton onClick={() =>
    this.confirmDeleteRole(row)
}>

    <DeleteIcon style={{ color: "red" }} titleAccess='Delete system role' />

</IconButton>
        );
    }
    cellPrivileges(row) {
        const { classes } = this.props;
        return (

          

<IconButton onClick={() =>
    this.onClickPriviView(row)
}>

    <Visibility style={{ color: "green" }} titleAccess='View privileges' />

</IconButton>

        );
    }
    async saveRole() {
        this.closeAddDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        // let privilegeList = [];
        // let privileges = Authenticatonservice.getUser().data.user.role.privileges;
        // for (let k in privileges) {

        //     privilegeList.push(privileges[k].mprivileges.privilege_name);
        // }

        // if (!privilegeList.includes("create_role")) {
        //     this.setState({ show_progress_status: false });
        //     notification.addNotification({
        //         message: "You do not have the rights to create a role. Please contact your Systems Administrator",
        //         level: 'error',
        //         autoDismiss: 5
        //     });
        // } else {
            if (this.state.new_role_name == null || this.state.new_role_name === '') {
                this.setState({ show_progress_status: false });

                notification.addNotification({
                    message: 'Please enter role name',
                    level: 'warning',
                    autoDismiss: 5
                });
            } else {

                let selectedItems = [];
                /* for(const entry of this.state.checkedItems.entries()){
                   if(entry[1]==true){
                    selectedItems.push(entry[0]);
                   }
                   
               }*/
                this.state.all_privileges.forEach(pri => {
                    if (pri.is_checked == true) {
                        selectedItems.push(pri.id);
                    }
                });



                let params = {};
                params["role_name"] = this.state.new_role_name
                params["privileges"] = selectedItems






                let result = await APIService.makePostRequest("role/save", params);
                if (result.success) {
                    notification.addNotification({
                        message: 'Role saved',
                        level: 'success',
                        autoDismiss: 5
                    });
                    this.closeAddDialog();
                    this.removeItemAll();
                    this.setState({
                        new_role_name: '',

                    });
                    this.getSystemroles();
                    this.getAllPrivileges();
                    this.setState({ show_progress_status: false });
                } else {
                    this.setState({ show_progress_status: false });
                    notification.addNotification({
                        message: result.message,
                        level: 'error',
                        autoDismiss: 5
                    });
                    this.getSystemroles();
                    this.removeItemAll();
                    this.closeAddDialog();

                }
            }
       // }

    }
    async deleteRole() {
        this.closeDeleteDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.user.role.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("delete_role")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to delete a role. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.role_to_be_deleted


            let result = await APIService.makePostRequest("roles/delete", params);
            if (result.success) {
                notification.addNotification({
                    message: 'Role deleted',
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDeleteDialog();
                this.setState({
                    role_to_be_deleted: ''
                });
                this.getSystemroles();
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
    async updateRole() {
        this.closeUpdateDialog();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        // let privilegeList = [];
        // let privileges = Authenticatonservice.getUser().data.user.role.privileges;
        // for (let k in privileges) {

        //     privilegeList.push(privileges[k].mprivileges.privilege_name);
        // }

        // if (!privilegeList.includes("update_api_configurations")) {
        //     this.setState({ show_progress_status: false });
        //     notification.addNotification({
        //         message: "You do not have the rights to make role updates. Please contact your Systems Administrator",
        //         level: 'error',
        //         autoDismiss: 5
        //     });
        // } else {
            let list = [];
            for (let k in this.state.all_privileges) {
                if (this.state.all_privileges[k].checked) {
                    list.push(this.state.all_privileges[k].id);
                }
            }

            let params = {};
            params["id"] = this.state.role_to_be_updated;
            params["privileges"] = list;


            let result = await APIService.makePostRequest("role/update", params);
            if (result.success) {
                notification.addNotification({
                    message: 'Role updated',
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeUpdateDialog();
                this.setState({
                    role_to_be_updated: ''
                });
                this.getSystemroles();
                this.setState({ show_progress_status: false });
            } else {
                this.setState({ show_progress_status: false });
                notification.addNotification({
                    message: result.message,
                    level: 'error',
                    autoDismiss: 5
                });
            }

       // }
    }
    //clear all items from the privileges array
    removeItemAll() {
        var i = 0;
        while (i < this.state.selected_privileges.length) {

            this.state.selected_privileges.splice(i, 1);

            ++i;

        }

        while (i < this.state.final_privileges_list.length) {

            this.state.final_privileges_list.splice(i, 1);

            ++i;

        }

    }
    confirmDeleteRole(row) {
        this.openDeleteRole(row);
    }
    openDeleteRole(row) {
        this.setState({
            deleterole: true,
            role_name: row.role_name,
            role_to_be_deleted: row.id
        })
    }
    closeDeleteDialog() {
        this.setState({ deleterole: false });
    }
    closeViewDialog() {
        this.setState({ openView: false });
    };
    openViewDialog() {
        this.setState({ openView: true });
    };

    closeAddDialog() {
        this.setState({ openAdd: false });
        this.removeItemAll();
    };
    openAddDialog() {
        this.setState({ openAdd: true });
    };
    openSessionDialog() {
        this.setState({ closesession: true });
    };
    closeUpdateDialog() {
        this.setState({ updateopen: false });
    }
    openUpdateDialog() {
        this.setState({ updateopen: true });
    }


    handleAllChecked = event => {
        let privileges = this.state.all_privileges;
        privileges.forEach(privileges => (privileges.is_checked = event.target.checked));
        this.setState({ all_privileges: privileges });
    };

    handleCheckChildElement = event => {

        let privileges = this.state.all_privileges;
        privileges.forEach(privi => {
            if (privi.id == event.target.value)
                privi.is_checked = event.target.checked;
        });
        this.setState({ all_privileges: privileges });
    };


    onClickPriviView(row) {
        //Empty list first
        while (this.state.role_privileges.length > 0) {
            this.state.role_privileges.pop();
        }

        for (let k in row.privileges) {
            this.state.role_privileges.push(row.privileges[k].mprivileges.description)
        }

        this.setState({
            role_name: row.role_name
        });
        this.openViewDialog();
    }

    onClickUserSelected(row) {
        //Empty list first

        while (this.state.role_privileges.length > 0) {
            this.state.role_privileges.pop();
            this.state.compare_role_privileges.pop();
        }

        for (let k in row.privileges) {
            this.state.role_privileges.push(row.privileges[k].mprivileges.description)
            this.state.compare_role_privileges.push(row.privileges[k].mprivileges.id)
            this.state.selected_privileges.push(row.privileges[k].mprivileges.id)

        }
        for (let j in this.state.all_privileges) {
            if (this.state.compare_role_privileges.includes(this.state.all_privileges[j].id)) {

                this.state.all_privileges[j]['checked'] = true;

            } else {
                this.state.all_privileges[j]['checked'] = false;

            }


        }

        this.setState({
            role_name: row.role_name,
            role_to_be_updated: row.id
        });


        this.openUpdateDialog();
    }
    handleRoleSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.sysroles.filter(s => {
            return s.role_name.includes(value.toUpperCase());
        });
        this.setState({
            sysroles_temp: searchResult
        });

    }

    handlePrivilegeSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.all_privileges.filter(s => {
            return s.description.includes(value);
        });
        this.setState({
            all_privileges_temp: searchResult
        });

    }
    renderList = () => {

        return (
            <div>
                <Table style={{ textAlign: 'left' }} striped={true} bordered={true} hover>
                    <Tbody>
                        {this.state.all_privileges.map((privi, index) => (
                            <Tr key={index}>
                                <Td>
                                    {privi.description}
                                </Td>
                                <Td>
                                    <input
                                        type="checkbox"
                                        value={privi.id}
                                        checked={privi.checked}
                                        id={privi.id}
                                        name={privi.privilege_name}
                                        onChange={this.handlerPrivilegesUpdateChanges}
                                    />
                                </Td>
                            </Tr>

                        )
                        )}
                    </Tbody>
                </Table>
            </div>
        )
    };
    handlerPrivilegesUpdateChanges = e => {
        let itemVal = e.target.name;
        let checked = e.target.checked;
        this.setState(prevState => {
            let { all_privileges, allChecked } = prevState;

            all_privileges = all_privileges.map(item =>
                item.privilege_name === itemVal ? { ...item, checked: checked } : item
            );
            allChecked = all_privileges.every(item => item.checked);

            this.setState({ all_privileges, allChecked });

            return { all_privileges, allChecked };
        });
    }
    availability(pri) {

        if (this.state.compare_role_privileges.includes(pri)) {

            return true;
        }
        return false;
    }
     getReport = ()=>{
        //Make report headers
        let head = [];
        let pre_payload = [];
        let payload = [];

        this.state.sysroles.forEach(h=>{
            let key = h.role_name.toLowerCase().replace(/\s+/g, '');
            h.privileges.forEach(m=>{
                
                pre_payload.push(key+"="+m.mprivileges.privilege_name);
            });
        });
        
         this.state.sysroles.forEach(h=>{
            var obj = {};
            let key = h.role_name.toLowerCase().replace(/\s+/g, '');
            obj["label"] = h.role_name;
            obj["key"] = key;
           head.push(obj);

            //Get privilege for each role
           
      
        });

        pre_payload.forEach(pre=>{
            let params={};
            let splittedPre = pre.split("=");
            
               var key = splittedPre[0];
               var value = splittedPre[1];
            params[key]=value;
            payload.push(params);
            
           

        });
        
 
     
        this.setState({
            headers:head,
            report: payload
        })
    }

    render() {
        const tooltipStyle3 = {
            overflowY: "scroll",

        };
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                        <Card title='System roles' isOption>

                          
                        <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                    this.openAddDialog()
                }
            >
                Create Role
            </Button>
                           

                    
                            <br />
                            <br />
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by Role name" onChange={e => this.handleRoleSearch(e)} />
                            </div>

                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Name</Th>
                                        <Th>Privileges</Th>
                                        <Th>Update Action</Th>
                                        <Th>Delete Action</Th>


                                    </Tr>

                                </Thead>
                                {this.state.sysroles_temp==null || this.state.sysroles_temp.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.sysroles_temp.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }}>
                                                <Td>
                                                    {u.role_name}
                                                </Td>
                                                <Td>{this.cellPrivileges(u)}</Td>
                                                <Td>{this.cellButton(u)}</Td>
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
                    open={this.state.deleterole}

                    fullWidth

                >

                    <div className="card">
                        <center>
                        </center>
                        <div className="card-body text-center">
                            <h3>{this.state.role_name}</h3>
                            <br />
                            <br />
                            <h4>Are you sure you want to delete this role?</h4>

                         
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
                    this.deleteRole()
                }
            >
                Delete role
            </Button></Col>
                                    </Row>
                                

                        </div>
                     


                    </div>

                </Dialog>


                <Dialog
                    open={this.state.openView}
                    onClose={this.closeViewDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-center">
                            <h3>{this.state.role_name} privileges</h3>
                            <Table style={{ textAlign: 'left' }} striped={true} bordered={true} hover>
                                <Tbody>
                                    {this.state.role_privileges.map(
                                        (privi, index) => (
                                            <Tr>
                                                <Td>{privi}</Td>

                                            </Tr>
                                        )
                                    )}
                                </Tbody>
                            </Table>
                           
                            <IconButton onClick={() => { this.closeViewDialog() }}>

<FaTimes size={50} title='Close' color='green' />
</IconButton>
                        </div>

                    </div>


                </Dialog>
                <Dialog
                    open={this.state.updateopen}
                    onClose={this.closeUpdateDialog.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <div className="card-body text-left">
                            <h3>{this.state.role_name} privileges</h3>

                            {this.renderList()}

                        </div>
                        <div className="card-body text-center">
                            
                                    <Row key={0}>
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
                    this.updateRole()
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
                    open={this.state.openAdd}
                    onClose={this.closeAddDialog.bind(this)}
                    fullWidth

                >

                    <div className="card" style={tooltipStyle3}>

                        <div className="card-body text-left">
                            <h3>Create Role</h3>
                            <Row>
                                <div className="input-group mb-3">
                                    <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Start typing ..... e.g Ability to create, Ability to view, Ability to delete, Ability to update, Ability to activate" onChange={e => this.handlePrivilegeSearch(e)} />
                                </div>
                                <Col>
                                    <Table style={{textAlign: "left"}}>
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

                                            {this.state.all_privileges_temp.map(
                                                (pri) => {

                                                    return (
                                                        <PrivilegeCheckBox handleCheckChildElement={this.handleCheckChildElement}
                                                            {...pri}
                                                        />
                                                    );
                                                })


                                            }
                                        </Tbody>
                                    </Table>


                                </Col>
                                <Col>
                                    <p className="mb-4">Role name</p>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Role name" value={this.state.new_role_name} onChange={e => this.handleChange(e, "new_role_name")} />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                            <div className="card-body text-center">
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
                    this.saveRole()
                }
            >
                Create role
            </Button>
                                </Col>
                                </Row>
                                </div>
                            </Row>
                        </div>


                    </div>


                </Dialog>
            </Aux>
        );
    }
}

export default Roles;