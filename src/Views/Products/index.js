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
    { label: "Product Code", key: "productcode" },
    { label: "Product Name", key: "productname" },
    { label: "Product Price", key: "price" },
    { label: "Unit of Measure", key: "unitofmeasure" }
];



class Products extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            products: [],
            products_temp: [],
            open: false,
            openUpdate: false,
            closesession: false,
            id: '',
            productname: '',
            productcode: '',
            unitofmeasure: '',
            price: '',
            _notificationSystem: null,
            date_created: '',
            updated_productname: '',
            show_progress_status: false,
            updated_productcode: '',
            openConfirm: false,
            updated_price: '',
            updated_unitofmeasure: '',
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
        await this.getProducts(0);
        await this.getProductsReport();
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
    async getProductsReport() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("products");
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
                params["productcode"] = r.productcode;
                params["productname"] = r.productname;
                params["price"] = r.price;
                params["unitofmeasure"] = r.unitofmeasure;
                this.state.report.push(params);

            });



        }
        this.setState({ show_progress_status: false })

    }

    async getProducts(pagnum) {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("products/" + pagnum + "/10");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {


            this.setState({ appusers: apiResponse, products_temp: apiResponse });

        }
        this.setState({ show_progress_status: false })

    }


    updateButton(row) {
        const { classes } = this.props;
        return (



            <IconButton onClick={() =>
                this.onClickUpdateProductSelected(row)
            } >
                <EditIcon style={{ color: "#04a9f5" }} titleAccess='Update product' />
            </IconButton>

        );
    }




    closeAddDialog() {
        this.setState({ open: false });
    }
    openAddDialog() {
        this.setState({ open: true });
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

    onClickUpdateProductSelected(row) {
        this.setState({
            id: row.id,
            updated_productcode: row.productcode,
            updated_productname: row.productname,
            updated_price: row.price,
            updated_unitofmeasure: row.unitofmeasure,
            openUpdateDetails: true

        });
    }

    async CreateProduct() {
        this.closeDetails();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("create_product")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to create a product. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["productcode"] = this.state.productcode;
            params["productname"] = this.state.productname;
            params["price"] = this.state.price;
            params["unitofmeasure"] = this.state.unitofmeasure;



            let result = await APIService.makePostRequest("product/save", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeAddDialog();
                this.setState({
                    id: '',
                    updated_price: '',
                    updated_productcode: '',
                    updated_productname: '',
                    updated_unitofmeasure: ''


                });
                this.getProducts(0);
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

    async updateDetails() {
        this.closeDetails();
        this.setState({ show_progress_status: true });
        const notification = this.notificationSystem.current;

        //check permissions
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for (let k in privileges) {

            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }

        if (!privilegeList.includes("update_product")) {
            this.setState({ show_progress_status: false });
            notification.addNotification({
                message: "You do not have the rights to make any updates to a product. Please contact your Systems Administrator",
                level: 'error',
                autoDismiss: 5
            });
        } else {
            let params = {};
            params["id"] = this.state.id;
            params["productcode"] = this.state.updated_productcode;
            params["productname"] = this.state.updated_productname;
            params["price"] = this.state.updated_price;
            params["unitofmeasure"] = this.state.updated_unitofmeasure;



            let result = await APIService.makePostRequest("product/save", params);
            if (result.success) {
                notification.addNotification({
                    message: result.message,
                    level: 'success',
                    autoDismiss: 5
                });
                this.closeDetails();
                this.setState({
                    id: '',
                    updated_price: '',
                    updated_productcode: '',
                    updated_productname: '',
                    updated_unitofmeasure: ''


                });
                this.getProducts(0);
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

 
    handlerTypeChange(e) {
        this.setState({
            trx_type: e.target.value
        });
    }
    handleProductSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.products.filter(s => {
            return s.productcode.includes(value) || s.productname.includes(value);
        });
        this.setState({
            products_temp: searchResult
        });

    }
    // define a generatePDF function that accepts a tickets argument
    generatePDF() {
        // initialize jsPDF
        const doc = new jsPDF();
        doc.setFont("helvetica");

        doc.setFontSize(9);

        // define the columns we want and their titles
        const tableColumn = ["Product Code", "Product Name", "Price", "Unit of Measure"];
        // define an empty array of rows
        const tableRows = [];
        this.state.report.forEach(ticket => {
            const ticketData = [
                ticket.productcode,
                ticket.productname,
                ticket.price,
                ticket.unitofmeasure
            ];
            // push each tickcet's info into a row
            tableRows.push(ticketData);
        });


        // startY is basically margin-top
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.text("Sonysugar Products", 14, 15);
        const date = Date().split(" ");
        // we use a date string to generate our filename.
        const dateStr = date[0] + date[1] + date[2] + date[3] + date[4];
        // we define the name of our PDF file.
        doc.save(`Products_${dateStr}.pdf`);
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
        await this.getProducts(add);
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
            await this.getProducts(add);
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

                <Card title='Products' isOption>

                <br />
                    <br />
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                            this.openAddDialog()
                        }
                    >
                        Create Product
                    </Button>


                    <br />
                    <CSVLink data={this.state.report} headers={headers} filename='Products.csv'>
                        <FaFileExcel size={50} color='green' title='Download products' />
                    </CSVLink>

                    <IconButton onClick={() =>
                        this.generatePDF()
                    }>
                        <FaFilePdf title='Download products' size={50} color='red' />
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
                        <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by product code or product name" onChange={e => this.handleProductSearch(e)} />
                    </div>
                    <br />
                    <p>Page {this.state.pageCount}</p>
                    <Table>
                        <Thead>
                            <Tr style={{ border: '1px solid' }}>
                                <Th>Product code</Th>
                                <Th>Product name</Th>
                                <Th>Unit of measure</Th>
                                <Th>Price</Th>
                                <Th>Update Details</Th>


                            </Tr>

                        </Thead>
                        {this.state.products_temp == null || this.state.products_temp.length == 0 ? <Tbody>
                            <Tr style={{ border: '1px solid' }} key={0}>
                                <Td>No data available ......</Td>
                            </Tr>
                        </Tbody> : <Tbody>
                            {this.state.products_temp.map(
                                (u, index) => (
                                    <Tr style={{ border: '1px solid' }} key={index}>
                                        <Td>
                                            {u.productcode}
                                        </Td>
                                        <Td>
                                            {u.productname}
                                        </Td>
                                        <Td>
                                            {u.unitofmeasure}
                                        </Td>
                                        <Td>
                                            {u.price}
                                        </Td>
                                        <Td>{this.updateButton(u)}</Td>

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

                        <center><h3>Create Product</h3></center>
                        <div className="card-body text-left">


                            {/*<label style={{ color: '#000000' }}><b>Customer number</b></label>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter customer number" value={this.state.customer_number} onChange={e => this.handleChange(e, "customer_number")} />
                    </div>*/}
                            <label style={{ color: '#000000' }}><b>Product code</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter product code" value={this.state.productcode} onChange={e => this.handleChange(e, "productcode")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Product name</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter product name" value={this.state.productname} onChange={e => this.handleChange(e, "productname")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Unit of measure</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter unit of measure" value={this.state.unitofmeasure} onChange={e => this.handleChange(e, "unitofmeasure")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Product price</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter product price" value={this.state.price} onChange={e => this.handleChange(e, "price")} />
                            </div>
                        </div>
                        <div className="card-body text-center">


                            <Row key={0}>
                                <Col>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                            this.closeDetails()
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
                                            this.CreateProduct()
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
                    open={this.state.openUpdateDetails}
                    onClose={this.closeDetails.bind(this)}
                    fullWidth

                >

                    <div className="card">

                        <center><h3>Update Product Details</h3></center>
                        <div className="card-body text-left">


                            {/*<label style={{ color: '#000000' }}><b>Customer number</b></label>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter customer number" value={this.state.customer_number} onChange={e => this.handleChange(e, "customer_number")} />
                    </div>*/}
                            <label style={{ color: '#000000' }}><b>Product code</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter product code" value={this.state.updated_productcode} onChange={e => this.handleChange(e, "updated_productcode")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Product name</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter product name" value={this.state.updated_productname} onChange={e => this.handleChange(e, "updated_productname")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Unit of measure</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter unit of measure" value={this.state.updated_unitofmeasure} onChange={e => this.handleChange(e, "updated_unitofmeasure")} />
                            </div>
                            <label style={{ color: '#000000' }}><b>Product price</b></label>
                            <div className="input-group mb-3">
                                <textarea type="text" className="form-control" style={{ color: '#000000' }} placeholder="Enter product price" value={this.state.updated_price} onChange={e => this.handleChange(e, "updated_price")} />
                            </div>
                        </div>
                        <div className="card-body text-center">


                            <Row key={0}>
                                <Col>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() =>
                                            this.closeDetails()
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
                                            this.updateDetails()
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

export default Products;