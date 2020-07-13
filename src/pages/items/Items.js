import "react-toastify/dist/ReactToastify.css";

import React from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";

import { withRouter, useHistory } from "react-router-dom";
import { Button, Typography } from "../../components/Wrappers";
import { CircularProgress, Box, Grid } from "@material-ui/core";

function FormsElements() {
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const [itemsData, setItemsData] = React.useState([]);

  const history = useHistory();

  const fetchItemsData = async () => {
    setIsTableLoading(true);
    try {
      const res = await axios.get("/admin/items");
      const { code, money, product } = res.data;
      const data = [
        ...code.map(c => {
          return { ...c, type: "code" };
        }),
        ...money.map(m => {
          return { ...m, type: "cash" };
        }),
        ...product.map(p => {
          return { ...p, type: "product" };
        }),
      ];
      setItemsData(data);
      setIsTableLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = (id, history) => {
    axios
      .delete("/admin/items/" + id)
      .then(() => {
        if (history.location.pathname !== "/app/items")
          history.push("/app/items");
      })
      .catch(ex => {
        console.error(ex.response.data);
      });
    fetchItemsData();
  };

  React.useEffect(() => {
    fetchItemsData();
  }, []);

  const columns = [
    {
      name: "imageUrl",
      label: "Image",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <Box display={"flex"} alignItems={"center"}>
              <img
                src={value}
                alt={value}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            </Box>
          );
        },
      },
    },
    {
      name: "title",
      label: "Title",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "amount",
      label: "Amount",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "token",
      label: "Token",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "type",
      label: "Type",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "actions",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        selectableRows: false,
        customBodyRender: (value, tableMeta, updateValue) => {
          const rowIndex = tableMeta.rowIndex;
          return (
            <Box display={"flex"} alignItems={"center"}>
              <Button
                color="secondary"
                size="small"
                variant="contained"
                onClick={e => deleteItem(itemsData[rowIndex]._id, history, e)}
              >
                Delete
              </Button>
            </Box>
          );
        },
      },
    },
  ];

  const options = {
    download: false,
    print: false,
    search: false,
    selectableRows: "none",
    serverSide: true,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10],
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MUIDataTable
            title={
              <Typography>
                Items
                {isTableLoading && (
                  <CircularProgress
                    size={24}
                    style={{ marginLeft: 15, position: "relative", top: 4 }}
                  />
                )}
              </Typography>
            }
            data={itemsData}
            columns={columns}
            options={options}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default withRouter(FormsElements);
