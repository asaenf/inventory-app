import React from 'react';
import { forwardRef } from 'react';
import MaterialTable from "material-table";

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };

class Inventory extends React.Component{
   constructor(props){
    super(props);

    this.getTableData = this.getTableData.bind(this);
    this.getTableColumns = this.getTableColumns.bind(this);
    this.setState = this.setState.bind(this);
   }

  componentDidMount() {
    fetch("https://us-central1-inventoryapp-276220.cloudfunctions.net/get",
    {
            method: 'GET',
            crossDomain:true,
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + ''
            }
          })
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result)
          this.setState({
            isLoaded: true,
            items: result.items
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }


getTableColumns = function(){
return [
           { title: "Product", field: "item" },
           { title: "Quantity", field: "quantity", type: "numeric"},
           { title: "Location", field: "location" },
          ]
}

getTableData = function(){
         return [
            {
              item: "Gurka",
              quantity: 63,
              location: "nere"
            },
            {
              item: "Veg hamburgare",
              quantity: 2,
              location: "nere"
            },
          {
              item: "Paprika",
              quantity: 1,
              location: "uppe"
            } ,
        {
            item: "Paprika",
            quantity: 1,
            location: "aspöja"
          }             
          ]
 }

  render() {
    return (
      <div style={{ maxWidth: "100%" }}>
        <MaterialTable
        icons={tableIcons}
          columns={this.getTableColumns()}
          data={this.getTableData()}
          options={{
            actionsColumnIndex: -1,
            filtering: true
          }}
          title="Inventory"
      editable={{
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              this.setState((prevState) => {
                const data = [...prevState.data];
                data.push(newData);
                return { ...prevState, data };
              });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              if (oldData) {
                this.setState((prevState) => {
                  const data = [...prevState.data];
                  data[data.indexOf(oldData)] = newData;
                  return { ...prevState, data };
                });
              }
            }, 600);
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              this.setState((prevState) => {
                const data = [...prevState.data];
                data.splice(data.indexOf(oldData), 1);
                return { ...prevState, data };
              });
            }, 600);
          }),
      }}
        />
      </div>
    );
  }
}


export default Inventory;
